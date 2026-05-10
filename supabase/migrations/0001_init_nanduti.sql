-- =============================================================
-- Ñandutí MVP — migration 0001
-- Schema isolado: nanduti.*
-- Star Schema v3.0 (raw → staging → analytics → public)
-- RLS ligada em tudo user-scoped. Service role bypassa.
-- =============================================================

create schema if not exists nanduti;
comment on schema nanduti is 'Ñandutí super-app — schema isolado';

-- ---- Identity (Supabase próprio, não Identity Hub) ----------
-- Override consciente do CLAUDE.md global: Ñandutí MVP usa auth
-- isolada por velocidade. SSO cross-app fica fora do escopo.

create table if not exists nanduti.users (
  id uuid primary key default gen_random_uuid(),
  cic text unique,                       -- cédula paraguaya, módulo 11 validado
  identidad_oauth_sub text unique,       -- futuro: bridge MITIC quando OAuth liberar
  phone_e164 text unique,                -- WhatsApp/SMS via Infobip
  email text unique,
  nombre text not null,
  apellido text,
  geo_dpto text,                         -- departamento PY
  geo_distrito text,
  geo_lat double precision,
  geo_lng double precision,
  demo_persona boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);
comment on table nanduti.users is 'Usuários do Ñandutí. demo_persona=true para María González (apresentações).';

create index if not exists idx_users_cic on nanduti.users (cic) where cic is not null;
create index if not exists idx_users_phone on nanduti.users (phone_e164) where phone_e164 is not null;

-- ---- Audit estoniano (X-Road style) -------------------------
create table if not exists nanduti.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references nanduti.users(id) on delete set null,
  actor text,                            -- 'self' | 'mitic' | 'mspbs' | etc
  action text not null,                  -- 'read.docs' | 'tool.gov.ruc_lookup' | ...
  resource text,                         -- ex.: 'docs.cedula' | 'wallet.balance'
  ts timestamptz not null default now(),
  ip text,
  ua text,
  payload_redacted jsonb                 -- PII mascarado antes de gravar
);
create index if not exists idx_audit_user_ts on nanduti.audit_log (user_id, ts desc);

-- ---- Rastreabilidade de fontes (CLAUDE.md §5) ---------------
create table if not exists nanduti.fontes_dados (
  id uuid primary key default gen_random_uuid(),
  nome text unique not null,
  url_canonica text not null,
  tipo text not null check (tipo in ('api_rest','api_soap','scraping_html','rss','csv_bulk','github_repo','dkan','ckan')),
  cron_humano text,                      -- ex.: 'every 15 minutes'
  ativo boolean not null default true,
  notas text,
  created_at timestamptz not null default now()
);
comment on table nanduti.fontes_dados is 'Toda fonte externa registrada aqui antes de ingerir.';

create table if not exists nanduti.fontes_dados_coletas (
  id uuid primary key default gen_random_uuid(),
  fonte_id uuid not null references nanduti.fontes_dados(id) on delete cascade,
  ts timestamptz not null default now(),
  status text not null check (status in ('ok','partial','error')),
  raw_count integer not null default 0,
  novos integer not null default 0,
  duplicados integer not null default 0,
  sha256_lote text,
  erro text
);
create index if not exists idx_coletas_fonte_ts on nanduti.fontes_dados_coletas (fonte_id, ts desc);

create table if not exists nanduti.fontes_dados_vinculos (
  id uuid primary key default gen_random_uuid(),
  fonte_id uuid not null references nanduti.fontes_dados(id) on delete cascade,
  tabela text not null,                  -- ex.: 'staging_alerta'
  registro_id text not null,
  ts timestamptz not null default now(),
  unique (fonte_id, tabela, registro_id)
);

-- ---- Camada raw (JSONB imutável, idempotência por sha256) ---
-- Pattern: cada raw_* tem (id, source_url, payload, sha256 unique, collected_at)
-- ETL faz INSERT ... ON CONFLICT (sha256) DO NOTHING.

create table if not exists nanduti.raw_presidencia_feed (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_reliefweb_sen (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_dinac_clima (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_ande_cortes (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_bcp_cotacao (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_dncp_contratos (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_paraguay_gov (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_mec_instituciones (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_mec_matriculas (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_mspbs_usf (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_seprelad (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

create table if not exists nanduti.raw_gaceta_oficial (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

-- ---- Staging (3NF, normalizado) -----------------------------

create table if not exists nanduti.dim_departamento (
  codigo text primary key,               -- 0..17 (DGEEC)
  nombre text not null
);

create table if not exists nanduti.dim_distrito (
  codigo text primary key,
  dpto_codigo text not null references nanduti.dim_departamento(codigo),
  nombre text not null
);

create table if not exists nanduti.staging_alerta (
  id uuid primary key default gen_random_uuid(),
  fonte_id uuid not null references nanduti.fontes_dados(id),
  source_ref text,                       -- id da fonte (reliefweb/sen)
  severity text check (severity in ('info','watch','warning','severe','extreme')),
  categoria text,                        -- 'meteorologico','energia','sanitario','seguridad', etc
  titulo text not null,
  body text,
  geo_dpto text,
  geo_distrito text,
  geo_lat double precision,
  geo_lng double precision,
  ts_evento timestamptz not null,
  url_oficial text,
  collected_at timestamptz not null default now(),
  unique (fonte_id, source_ref)
);
create index if not exists idx_alerta_ts on nanduti.staging_alerta (ts_evento desc);
create index if not exists idx_alerta_geo on nanduti.staging_alerta (geo_dpto, geo_distrito);

create table if not exists nanduti.staging_escuela (
  id uuid primary key default gen_random_uuid(),
  codigo_mec text unique,
  nombre text not null,
  dpto text,
  distrito text,
  lat double precision,
  lng double precision,
  internet_bool boolean,
  nivel text,
  fonte_id uuid references nanduti.fontes_dados(id)
);

create table if not exists nanduti.staging_usf (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  dpto text,
  distrito text,
  lat double precision,
  lng double precision,
  contacto text,
  fonte_id uuid references nanduti.fontes_dados(id)
);

create table if not exists nanduti.staging_tramite (
  id uuid primary key default gen_random_uuid(),
  source_id text unique,                 -- slug paraguay.gov.py
  nombre text not null,
  oee text,                              -- órgão público (MITIC, DNIT, MSPBS...)
  requisitos text[],
  costo_pyg integer,
  url_oficial text,
  tags text[],
  fonte_id uuid references nanduti.fontes_dados(id)
);

create table if not exists nanduti.staging_cotacao (
  id uuid primary key default gen_random_uuid(),
  moneda text not null,                  -- 'USD' | 'EUR' | 'BRL' | 'ARS'
  ts timestamptz not null,
  compra numeric(18,2),
  venta numeric(18,2),
  fonte_id uuid references nanduti.fontes_dados(id),
  unique (moneda, ts, fonte_id)
);
create index if not exists idx_cotacao_moneda_ts on nanduti.staging_cotacao (moneda, ts desc);

create table if not exists nanduti.staging_feed_estado (
  id uuid primary key default gen_random_uuid(),
  source_ref text unique,
  oee text,                              -- 'presidencia' | 'ip' | 'gaceta' | 'mspbs'
  titulo text not null,
  resumo text,
  url_oficial text,
  publicado_em timestamptz,
  categoria text,
  collected_at timestamptz not null default now(),
  fonte_id uuid references nanduti.fontes_dados(id)
);
create index if not exists idx_feed_pub on nanduti.staging_feed_estado (publicado_em desc);

-- ---- Operacional (user-scoped, RLS) -------------------------

create table if not exists nanduti.alert_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references nanduti.users(id) on delete cascade,
  geo_dpto text,
  geo_distrito text,
  categorias text[] not null default '{}',
  push_web boolean not null default true,
  whatsapp boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_subs_user on nanduti.alert_subscriptions (user_id);

create table if not exists nanduti.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references nanduti.users(id) on delete set null,
  type text not null,                    -- 'violencia','robo','feminicidio','desapariciones'...
  body text,
  discrete boolean not null default false,
  status text not null default 'recebida' check (status in ('recebida','em_analise','encaminhada','arquivada')),
  encaminhada_para text,                 -- 'DEAM Asunción' | '911' | etc
  geo_lat double precision,
  geo_lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_complaints_user on nanduti.complaints (user_id, created_at desc);

create table if not exists nanduti.docs_vc (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references nanduti.users(id) on delete cascade,
  kind text not null,                    -- 'cedula','partida_nacimiento','antecedentes','carnet_vacunacion','licencia','ruc'
  payload jsonb not null,
  signature_ed25519 text not null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists nanduti.docs_audit (
  id uuid primary key default gen_random_uuid(),
  vc_id uuid not null references nanduti.docs_vc(id) on delete cascade,
  accessed_by text not null,             -- 'self' | 'mitic' | 'banco_x' | endpoint origem
  ts timestamptz not null default now(),
  ip text
);
create index if not exists idx_docs_audit_vc on nanduti.docs_audit (vc_id, ts desc);

-- ---- RLS --------------------------------------------------
-- Enable em todas user-scoped. Service role do server bypassa.
alter table nanduti.users enable row level security;
alter table nanduti.audit_log enable row level security;
alter table nanduti.alert_subscriptions enable row level security;
alter table nanduti.complaints enable row level security;
alter table nanduti.docs_vc enable row level security;
alter table nanduti.docs_audit enable row level security;

-- Policies: cada user só lê/escreve seu próprio registro
-- (auth.uid() = user_id). Service role do server-side bypassa.
create policy "users self" on nanduti.users
  for all using (auth.uid() = id);

create policy "audit self read" on nanduti.audit_log
  for select using (auth.uid() = user_id);

create policy "subs self all" on nanduti.alert_subscriptions
  for all using (auth.uid() = user_id);

create policy "complaints self all" on nanduti.complaints
  for all using (auth.uid() = user_id);

create policy "docs_vc self all" on nanduti.docs_vc
  for all using (auth.uid() = user_id);

create policy "docs_audit self read" on nanduti.docs_audit
  for select using (auth.uid() = (select user_id from nanduti.docs_vc where id = vc_id));

-- ---- Seed: fontes_dados -----------------------------------
insert into nanduti.fontes_dados (nome, url_canonica, tipo, cron_humano, notas) values
  ('agencia_ip', 'https://www.ip.gov.py/ip/', 'scraping_html', 'every 30 minutes', 'Agencia IP — comunicados oficiais'),
  ('decretos_presidencia', 'https://decretos.presidencia.gov.py/', 'scraping_html', 'every 30 minutes', 'Decretos do Executivo'),
  ('gaceta_oficial', 'https://www.gacetaoficial.gov.py/', 'scraping_html', 'every 1 day', 'Diário oficial PY'),
  ('reliefweb_sen', 'https://api.reliefweb.int/v1/reports?filter[field]=source.shortname&filter[value]=Paraguay+SEN', 'api_rest', 'every 1 hour', 'Proxy estruturado pra alertas SEN'),
  ('dinac_pronostico', 'https://www.meteorologia.gov.py/pronostico/', 'scraping_html', 'every 1 hour', 'DINAC pronóstico — 6×/dia'),
  ('ande_cortes', 'https://www.ande.gov.py/', 'scraping_html', 'every 15 minutes', 'ANDE energia'),
  ('bcp_cotacao_diaria', 'https://www.bcp.gov.py/webapps/web/cotizacion/monedas', 'scraping_html', 'every 1 hour', 'BCP cotação diária'),
  ('dncp_ocds', 'https://www.contrataciones.gov.py/datos/api/v2/', 'api_rest', 'every 1 day', 'DNCP OCDS API v2 — 4 req/s sem auth'),
  ('paraguay_gov_oees', 'https://www.paraguay.gov.py/', 'scraping_html', 'every 7 days', 'Catálogo trámites por OEE'),
  ('mec_instituciones', 'https://datos.mec.gov.py/data/directorios_instituciones', 'dkan', 'every 30 days', 'MEC SIIIE diretório de instituições'),
  ('mec_matriculas', 'https://data.mec.gov.py/def/matriculaciones_inicial', 'api_rest', 'yearly + on-demand', 'MEC matrículas'),
  ('mspbs_datos_abiertos', 'https://www.datos.gov.py/group/ministerio-de-salud-publica-y-bienestar-social-mspbs', 'ckan', 'every 30 days', 'MSPBS datos abiertos (USFs)'),
  ('seprelad_resoluciones', 'https://www.seprelad.gov.py/', 'scraping_html', 'every 7 days', 'SEPRELAD — disclaimer dinâmico cripto')
on conflict (nome) do nothing;

-- ---- Seed: dim_departamento (DGEEC) -----------------------
insert into nanduti.dim_departamento (codigo, nombre) values
  ('00','Asunción'),('01','Concepción'),('02','San Pedro'),('03','Cordillera'),
  ('04','Guairá'),('05','Caaguazú'),('06','Caazapá'),('07','Itapúa'),
  ('08','Misiones'),('09','Paraguarí'),('10','Alto Paraná'),('11','Central'),
  ('12','Ñeembucú'),('13','Amambay'),('14','Canindeyú'),('15','Presidente Hayes'),
  ('16','Boquerón'),('17','Alto Paraguay')
on conflict (codigo) do nothing;
