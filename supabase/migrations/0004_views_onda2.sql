-- =============================================================
-- Ñandutí MVP — migration 0004: views Onda 2
--
-- Views que abstraem acesso a raw_* — desacoplam schema de queries.
-- Data-source TypeScript (`lib/data-source/*.ts`) lê dessas views.
-- Idempotente (CREATE OR REPLACE).
--
-- Quando o volume crescer, trocar VIEW por MATERIALIZED VIEW + REFRESH
-- agendado. Por enquanto VIEW é suficiente.
-- =============================================================

-- ---- Feed do Estado (consolidado: Presidência + SEN + futuro Decretos+Gaceta)

create or replace view nanduti.v_feed_estado as
  select
    sha256                                             as id,
    'agencia_ip'                                       as oee,
    payload->>'title'                                  as titulo,
    payload->>'summary'                                as resumo,
    payload->>'link'                                   as url_oficial,
    (payload->>'pub_date')::timestamptz                as publicado_em,
    coalesce(
      (payload->'categories'->>0),
      'comunicado'
    )                                                  as categoria,
    payload->>'creator'                                as autor,
    collected_at
  from nanduti.raw_presidencia_feed
  where payload->>'fonte_nome' = 'agencia_ip'
union all
  select
    sha256                                             as id,
    'sen'                                              as oee,
    payload->>'title'                                  as titulo,
    payload->>'summary'                                as resumo,
    payload->>'link'                                   as url_oficial,
    (payload->>'pub_date')::timestamptz                as publicado_em,
    coalesce(
      (payload->'categories'->>0),
      'asistencia'
    )                                                  as categoria,
    payload->>'creator'                                as autor,
    collected_at
  from nanduti.raw_reliefweb_sen
  where payload->>'fonte_nome' = 'sen_scraping';

comment on view nanduti.v_feed_estado is 'Feed consolidado do Estado paraguaio. Lido por info.feed e info.weekly_summary.';

-- ---- Alertas (SEN + DINAC + ANDE futuro)

create or replace view nanduti.v_alerta as
  -- SEN (asistencia humanitária / temporais)
  select
    sha256                                             as id,
    'sen'                                              as fonte,
    payload->>'title'                                  as titulo,
    payload->>'summary'                                as descricao,
    payload->>'link'                                   as url_oficial,
    (payload->>'pub_date')::timestamptz                as ts_evento,
    case
      when lower(payload->>'title') ~ '(temporal|tormenta|inundac|emergencia|evacua)' then 'severe'
      when lower(payload->>'title') ~ '(asistencia|ayuda|materiales)'                  then 'info'
      else 'watch'
    end                                                as severity,
    case
      when lower(payload->>'title') ~ '(temporal|tormenta|inundac|lluvia)' then 'meteorologico'
      when lower(payload->>'title') ~ '(indigena|comunidad|asistencia)'    then 'humanitario'
      when lower(payload->>'title') ~ '(incendio|fuego)'                   then 'incendio'
      else 'general'
    end                                                as categoria,
    null::text                                         as geo_dpto,
    collected_at
  from nanduti.raw_reliefweb_sen
union all
  -- DINAC (pronóstico clima)
  select
    sha256                                             as id,
    'dinac'                                            as fonte,
    'Pronóstico — ' || (payload->>'ciudad')           as titulo,
    payload->>'descripcion'                            as descricao,
    'https://www.meteorologia.gov.py/pronostico/'      as url_oficial,
    coalesce((payload->>'actualizado_iso')::timestamptz, collected_at) as ts_evento,
    case
      when lower(payload->>'descripcion') ~ '(tormenta|severo|granizo|temporal)' then 'severe'
      when lower(payload->>'descripcion') ~ '(lluvia|chubasco)'                  then 'watch'
      else 'info'
    end                                                as severity,
    'meteorologico'                                    as categoria,
    payload->>'ciudad'                                 as geo_dpto,
    collected_at
  from nanduti.raw_dinac_clima;

comment on view nanduti.v_alerta is 'Alertas consolidadas (SEN + DINAC). Severity inferida via regex no título/descrição. Lida por alerts.recent.';

-- ---- Cotações BCP (mais recente por moeda)

create or replace view nanduti.v_cotacao_atual as
  select distinct on (payload->>'moeda_codigo')
    payload->>'moeda_codigo'                           as moeda_codigo,
    payload->>'moeda_nome'                             as moeda_nome,
    (payload->>'unidade')::numeric                     as unidade,
    (payload->>'valor_pyg')::numeric                   as valor_pyg,
    (payload->>'fecha_planilla')::date                 as fecha_planilla,
    collected_at
  from nanduti.raw_bcp_cotacao
  -- Filtro: apenas payloads no schema novo (sem collected_at no payload — bug antigo)
  where not (payload ? 'collected_at')
  order by payload->>'moeda_codigo', collected_at desc;

comment on view nanduti.v_cotacao_atual is 'Última cotação por moeda. Lida por wallet.balance e crypto.balance pra conversão USD/PYG.';

-- ---- Histórico cotações (últimos 30 dias)

create or replace view nanduti.v_cotacao_historico as
  select
    sha256                                             as id,
    payload->>'moeda_codigo'                           as moeda_codigo,
    (payload->>'valor_pyg')::numeric                   as valor_pyg,
    (payload->>'fecha_planilla')::date                 as fecha_planilla,
    collected_at
  from nanduti.raw_bcp_cotacao
  where not (payload ? 'collected_at')
    and collected_at > now() - interval '30 days';

comment on view nanduti.v_cotacao_historico is 'Histórico 30d. Útil pra info.weekly_summary tendência cambial.';

-- ---- Catalog datasets (MEC + MSPBS via DKAN)

create or replace view nanduti.v_dataset_catalog as
  select
    sha256                                             as id,
    'mec'                                              as dominio,
    payload->>'slug'                                   as slug,
    payload->>'title'                                  as titulo,
    payload->>'url'                                    as url_oficial,
    payload->>'metadata_modified'                      as atualizado_em,
    payload->'resources'                               as resources,
    collected_at
  from nanduti.raw_mec_instituciones
  where payload->>'domain' = 'mec'
union all
  select
    sha256                                             as id,
    'mspbs'                                            as dominio,
    payload->>'slug'                                   as slug,
    payload->>'title'                                  as titulo,
    payload->>'url'                                    as url_oficial,
    payload->>'metadata_modified'                      as atualizado_em,
    payload->'resources'                               as resources,
    collected_at
  from nanduti.raw_mspbs_usf
  where payload->>'domain' = 'mspbs';

comment on view nanduti.v_dataset_catalog is 'Catalog MEC + MSPBS via datos.gov.py. Usado por gov.tramite_search e edu.* enquanto APIs específicas não chegam.';

-- ---- Grants nas views (PostgREST precisa)
-- ALTER DEFAULT PRIVILEGES da migration 0002 cobre TABLES, mas views
-- precisam GRANT explícito.
grant select on nanduti.v_feed_estado, nanduti.v_alerta,
                nanduti.v_cotacao_atual, nanduti.v_cotacao_historico,
                nanduti.v_dataset_catalog
  to anon, authenticated, service_role;
