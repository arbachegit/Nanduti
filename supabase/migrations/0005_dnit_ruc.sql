-- =============================================================
-- Ñandutí MVP — migration 0005: DNIT consultaRUC + escolas/saúde extras
-- Adiciona fonte DNIT (RUC paraguayo) e raw table associada.
-- Idempotente.
-- =============================================================

insert into nanduti.fontes_dados (nome, url_canonica, tipo, cron_humano, notas) values
  ('dnit_ruc', 'https://www.set.gov.py/portal/PARAGUAY-SET/Servicios+Online/Consulta+RUC', 'api_rest', 'every 1 day', 'DNIT consultaRUC — dados cadastrais de empresas (saúde, educação, etc). Requer apiKey via DNIT_API_KEY.'),
  ('mec_datos_portal', 'https://datos.mec.gov.py/data', 'dkan', 'every 7 days', 'MEC DKAN portal próprio (separado de datos.gov.py). Catalog API + recursos CSV.'),
  ('mspbs_usf_directorio', 'https://www.mspbs.gov.py/dependencias/aps/centros-de-salud-y-usf.html', 'scraping_html', 'every 30 days', 'MSPBS dirório de USFs (Unidades de Salud Familiar) com geo + cobertura.')
on conflict (nome) do nothing;

-- Raw table pra DNIT consultaRUC.
create table if not exists nanduti.raw_dnit_ruc (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create index if not exists idx_raw_dnit_ruc_collected on nanduti.raw_dnit_ruc (collected_at desc);
-- RUC vem em payload->>'ruc'; índice GIN ajuda lookup rápido em gov.empresa_search.
create index if not exists idx_raw_dnit_ruc_payload on nanduti.raw_dnit_ruc using gin (payload jsonb_path_ops);
