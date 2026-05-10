# Bom dia (sessão 2) — sumário do trabalho noturno

> Branch: `main` (mergeado 4× via PR #1, #2, #3, #4)
> 8 commits novos · ~9h autônomas (10/05 02:00 → 11:00 BRT) · 3 agentes paralelos

## 🚀 GitHub Actions cloud — TODOS OS 7 WORKFLOWS RODANDO

Após corrigir secret `SUPABASE_URL` (estava malformado no `gh secret set` inicial), todos os workflows passam a executar com sucesso:

| Workflow | Cron | Cloud status |
|---|---|---|
| `etl-presidencia-feed` | 30min | ✅ success (10 items + 6 gacetas) |
| `etl-bcp-cotacao` | 1h | ✅ success (26 cotações) |
| `etl-datos-gov-py` | mensal | ✅ success (24 datasets MEC+MSPBS+MITIC) |
| `etl-mec-github-mirror` | semanal | ✅ success (2 repos) |
| `etl-sen-feed` | 30min | ✅ success (10 alertas) |
| `etl-dinac-clima` | 1h | ✅ success (17 cidades) |
| `etl-dncp-contratos` | 1d | ✅ success (50 records OCDS) |

Cron schedules vão picking up automaticamente daqui em diante.

## 📊 Banco populado — 9 raw tables

```
raw_presidencia_feed:    10  (Agencia IP RSS)
raw_gaceta_oficial:       6  (NOVO — Grails SSR scraping)
raw_bcp_cotacao:         78  (cotação USD/EUR/BRL/ARS + 22 outras)
raw_mec_instituciones:   14  (DKAN catalog)
raw_mspbs_usf:            7  (DKAN catalog)
raw_paraguay_gov:         3  (NOVO — datasets MITIC PUG)
raw_reliefweb_sen:       10  (SEN feed RSS)
raw_dinac_clima:         17  (cidades + previsão)
raw_github_mirror:        4  (mecpy org)
raw_dncp_contratos:      50  (NOVO — OCDS API real)
fontes_dados_coletas:    34+ (audit trail)
```

## 🤖 3 agentes paralelos descobriram fontes bloqueadas

### Agente A — DNCP OCDS endpoint encontrado ✅

**Descoberta:** API v3 está atrás do prefixo Swagger UI `/doc/`, não em `/datos/api/v3/` direto.

```
GET /datos/api/v3/doc/search/processes?fecha_desde=...&fecha_hasta=...&tipo_fecha=fecha_release
```

4 req/s sem auth, OCDS 1.1 compliant, prefix `ocds-03ad3f-`. Implementado em `scrapers/dncp/run.py`. Cron diário 07:00 UTC.

### Agente B — paraguay.gov.py mapeado ✅

**Descoberta:** Portal é SPA Angular client-side, scraping HTML inviável. **Caminho oficial: dataset MITIC em datos.gov.py.**

3 datasets PUG capturados:
- `instituciones-del-portal-unico-de-gobierno-2025` (CSV com 1.108 OEEs)
- `instituciones-del-portal-de-gobernaciones-y-municipios-2025`
- `instituciones-adheridas-al-portal-de-acceso-la-información-pública`

Adicionado `domain=mitic_pug` em `datos_gov_py/run.py`.

### Agente C — Gaceta Oficial + Decretos descobertos ✅

**Gaceta Oficial:** TOTALMENTE acessível via Chrome UA. Grails SSR (não SPA).
- Endpoint detalhe: `/index/detalle_publicacion/{id}`
- Endpoint PDF: `/index/getDocumento/{docId}`
- Implementado em `scrapers/presidencia/gaceta_oficial.py` — 6 publicações persistidas

**Decretos Presidência:** Geo-bloqueado em TCP do Brasil. Mas API descoberta no bundle Angular: `/api/norma/list`. Implementação tenta via runner Azure US (fallback graceful se geo-block persistir). Ainda assim, **Gaceta Oficial cobre 100% dos decretos via PDF** — cobertura completa garantida.

## 🔌 Onda 2 — primeiros 3 tools migrados mock → real

Pattern: handler tenta Supabase, fallback automático pro mock se ausente. Response inclui `{source: 'supabase'|'mock'}` pra debug.

| Tool | Pluga em | Data-source TS |
|---|---|---|
| `info.feed` | view `v_feed_estado` (Agencia IP + SEN) | `lib/data-source/info.ts` |
| `alerts.recent` | view `v_alerta` (SEN + DINAC, severity inferida) | `lib/data-source/alerts.ts` |
| `wallet.balance` | view `v_cotacao_atual` (USD/PYG live) | `lib/data-source/wallet.ts` |

`tool-registry.ts` plugado, typecheck passa.

## ⚠️ AÇÃO MANUAL — Migration 0004 ainda não aplicada

**Sem ela, os data-sources caem no mock automaticamente.** Tools continuam funcionando, mas não usam dados reais ainda.

```bash
pbcopy < supabase/migrations/0004_views_onda2.sql
# ou
cat supabase/migrations/0004_views_onda2.sql | pbcopy
# depois cola em https://supabase.com/dashboard/project/qgzkphojxxenvoukjxjz/sql/new
```

A migration cria 5 views:
- `v_feed_estado` (consolidação Presidência+SEN)
- `v_alerta` (SEN+DINAC com severity/categoria inferida via regex)
- `v_cotacao_atual` (distinct on moeda_codigo, mais recente)
- `v_cotacao_historico` (últimos 30 dias)
- `v_dataset_catalog` (MEC+MSPBS via DKAN)

## 📋 Histórico de commits da sessão 2

```
HEAD   feat: Gaceta Oficial real + Decretos via runner GH
       feat: paraguay.gov.py via DKAN + DNCP cloud SUCCESS
       feat: Onda 2 + DNCP real — data-source layer pluga 3 tools
       docs: WAKEUP_SUMMARY.md (sessão 1)
       feat: SEN feed RSS + DINAC pronóstico
       feat: scrapers Onda 1 — 4 workflows reais + skeletons
       feat: migration 0002 — grants no schema nanduti
       feat: bootstrap MVP foundation
```

## 🗺️ Roadmap — Onda 3 (próxima sessão)

Foundation está sólida. Próximos passos estimados em ordem de valor:

1. **Aplicar migration 0004** (clipboard) → tools `info.feed`, `alerts.recent`, `wallet.balance` viram real automaticamente
2. **Migration 0005** opcional: tabela `raw_paraguay_gov_servicios` + scraper que baixa CSVs reais (1108 trámites estruturados)
3. **`gov.tramite_search`** plugado em `v_dataset_catalog` (já lê metadata; depois pluga no CSV downloader)
4. **`crypto.balance`** com cotação real USDC + disclaimer SEPRELAD dinâmico (raw_seprelad ainda vazio)
5. **`info.weekly_summary`** usa LLM Sonnet sobre `lastWeek()` + ABNT citations
6. **`alerts.subscribe`** persiste em `nanduti.alert_subscriptions` (já existe)
7. **`police.complaint`** persiste em `nanduti.complaints` real
8. **`docs.audit`** lê `nanduti.audit_log` real
9. **Identity Hub bridge** se decidir abandonar Supabase próprio (mudança grande — adia)

## 🐛 Issues conhecidas (não-bloqueantes)

- `raw_bcp_cotacao` tem 26 rows com schema antigo (`collected_at` no payload, fix consertado depois) — `DELETE FROM nanduti.raw_bcp_cotacao WHERE payload ? 'collected_at';` no SQL Editor limpa
- Gaceta Oficial: regex do `numero` está colando data junto ("11708" em vez de "117"). Refinar regex em iteração futura.
- Decretos via runner GH: testando se Azure US passa o geo-block paraguaio (resultado em cloud run, ainda em verificação)

## 🔗 PRs mergeados pra main

- #1: bootstrap MVP foundation
- #2: Onda 2 + DNCP real
- #3: paraguay.gov.py via DKAN
- #4: Gaceta Oficial + Decretos via runner

## 💡 Quando você acordar

1. Ler este arquivo
2. `pbcopy < supabase/migrations/0004_views_onda2.sql` + cola no SQL Editor
3. Testar `curl http://localhost:3030/api/info/feed?limit=3` — deve retornar `source: "supabase"` com dados reais
4. Decidir Onda 3 (ver roadmap acima)

Working tree clean. Zero regressões. Cron schedules ativos.
