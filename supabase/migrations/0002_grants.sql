-- =============================================================
-- Ñandutí MVP — migration 0002: GRANTS no schema nanduti
-- PostgREST roda como `service_role` / `authenticated` / `anon`.
-- Sem GRANT explícito, schemas custom retornam 42501.
-- RLS continua valendo — GRANT só destrava o portão.
-- Idempotente: GRANT em quem já tem é no-op.
-- =============================================================

-- USAGE no schema (poder "ver" o schema)
grant usage on schema nanduti to anon, authenticated, service_role;

-- service_role: faz tudo (bypassa RLS por design)
grant all on all tables in schema nanduti to service_role;
grant all on all sequences in schema nanduti to service_role;
grant all on all functions in schema nanduti to service_role;

-- authenticated: pode ler/escrever, mas RLS filtra
grant select, insert, update, delete on all tables in schema nanduti to authenticated;
grant usage, select on all sequences in schema nanduti to authenticated;

-- anon: read-only (e RLS bloqueia tudo que for user-scoped)
grant select on all tables in schema nanduti to anon;

-- Default privileges para tabelas/sequences criadas no futuro
alter default privileges in schema nanduti
  grant all on tables to service_role;
alter default privileges in schema nanduti
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema nanduti
  grant select on tables to anon;
alter default privileges in schema nanduti
  grant all on sequences to service_role;
alter default privileges in schema nanduti
  grant usage, select on sequences to authenticated;
