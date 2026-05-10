-- =============================================================
-- Ñandutí MVP — migration 0003: fontes adicionais
-- Adiciona fontes descobertas na Onda 1 + cria raw tables novas
-- onde necessário. Idempotente.
-- =============================================================

insert into nanduti.fontes_dados (nome, url_canonica, tipo, cron_humano, notas) values
  ('mec_github', 'https://github.com/mecpy/mec-opendata', 'github_repo', 'every 7 days', 'MEC GitHub mirror — datasets históricos. Arquivado desde 2016 mas mantém arquivos relevantes.'),
  ('sen_scraping', 'https://www.sen.gov.py/', 'scraping_html', 'every 1 hour', 'SEN scraping HTML direto — substituto temporário enquanto ReliefWeb v2 não aprova appname.')
on conflict (nome) do nothing;

-- raw table pra GitHub mirrors (genérica, vários repos)
create table if not exists nanduti.raw_github_mirror (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  payload jsonb not null,
  sha256 text unique not null,
  collected_at timestamptz not null default now()
);

-- Default privileges já cobrem tabelas criadas no schema (migration 0002).
