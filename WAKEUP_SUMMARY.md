# Bom dia — sumário do trabalho noturno

> Branch: `feat/mvp-real-data` · 4 commits novos · working tree clean
> Working hours: 4h autônomas (10/05 02:00 → 06:00 BRT)

## 🎯 Entregue — funcional end-to-end

**6 fontes paraguaias com dados reais persistidos no Supabase**, todas
testadas localmente com `python -m <fonte>.run`, idempotência por sha256
confirmada:

| Fonte | Workflow | Cron | Items reais persistidos |
|---|---|---|---|
| Agencia IP (Presidência) | `etl-presidencia-feed.yml` | 30min | 10 (RSS) |
| BCP cotação diária | `etl-bcp-cotacao.yml` | 1h | 26 moedas (USD=6.159, EUR=7.250, BRL=1.258, ARS=4,43 PYG) |
| MEC catalog (datos.gov.py) | `etl-datos-gov-py.yml` | mensal | 14 datasets |
| MSPBS catalog (datos.gov.py) | `etl-datos-gov-py.yml` | mensal | 7 datasets |
| SEN feed RSS | `etl-sen-feed.yml` | 30min | 10 alertas humanitários |
| DINAC pronóstico | `etl-dinac-clima.yml` | 1h | 17 cidades + previsão |

Banco status (validado via REST API com service_role):
- `raw_presidencia_feed`: 10 rows
- `raw_bcp_cotacao`: 78 rows (26 valor real + cleanup pendente — ver abaixo)
- `raw_mec_instituciones`: 14
- `raw_mspbs_usf`: 7
- `raw_reliefweb_sen`: 10 (via fonte sen_scraping)
- `raw_dinac_clima`: 17
- `fontes_dados_coletas`: 17 registros de auditoria

## ⏸️ Skeletons claros (bloqueados ou pendentes)

| Fonte | Razão | Próximo passo |
|---|---|---|
| ReliefWeb v2 | Requer approval do appname (24-48h) | Submeter pedido em https://apidoc.reliefweb.int/parameters#appname com `nanduti.iconsai.ai` |
| DNCP OCDS v3 | API retorna 404, endpoint mudou | Investigar via https://data.open-contracting.org/en/publication/63 |
| Decretos Presidência | Site offline (timeout 60s) | Tentar em GH Actions (IPs Azure podem passar firewall) |
| Gaceta Oficial | SPA jQuery custom, dados via AJAX | Capturar request `/index/buscarContenido` POST via DevTools |

## 🔧 1 ação manual necessária pra ativar `etl-mec-github-mirror`

Migration **0003 ainda não aplicada** no Supabase (precisa direct connection
ou paste no SQL Editor — eu não consegui aplicar autonomamente sem você):

```bash
pbcopy < supabase/migrations/0003_more_fontes.sql
# depois cola em https://supabase.com/dashboard/project/qgzkphojxxenvoukjxjz/sql/new
```

A migration adiciona:
- 2 fontes em `fontes_dados`: `mec_github` + `sen_scraping`
- Tabela `nanduti.raw_github_mirror` (genérica pra outros repos governamentais futuros)

Sem ela: o scraper `mec_github/run.py` não encontra fonte e o INSERT em
`raw_github_mirror` falha (tabela inexistente). O scraper de SEN funciona
mesmo sem 0003 porque grava em `raw_reliefweb_sen` (já existe).

## 🐛 Cleanup opcional (5 segundos)

`raw_bcp_cotacao` tem 26 rows com schema antigo (`collected_at` no payload
quebrava idempotência). Após o fix, novas rows ficam idempotentes. Pra
limpar as antigas:

```sql
DELETE FROM nanduti.raw_bcp_cotacao WHERE payload ? 'collected_at';
```

Não bloqueia nada — só deixa o banco mais limpo.

## 🔌 GitHub Secrets pra ativar workflows na cloud

Pra os 6 workflows rodarem em GitHub Actions (cron), adicione em
`Settings → Secrets and variables → Actions`:

```
SUPABASE_URL              = https://qgzkphojxxenvoukjxjz.supabase.co
SUPABASE_SERVICE_ROLE     = <a service_role JWT do .env.local>
SLACK_ETL_WEBHOOK         = <opcional, pra notificações de falha>
```

`GITHUB_TOKEN` é injetado automaticamente — não precisa secret manual.

## 📝 Push da branch + PR

Branch `feat/mvp-real-data` ainda local (4 commits ahead de main). Quando
quiser revisar:

```bash
git push -u origin feat/mvp-real-data
gh pr create --title "feat: MVP real data — Onda 1 (6 fontes paraguaias)" --body-file ...
```

Não fiz push autônomo — push afeta remote, queria sua aprovação.

## 🗺️ Roadmap atualizado pra Onda 2

Com Onda 1 destravada, o próximo passo é trocar handlers mock dos 28
tools em `lib/tool-registry.ts` pra ler do Supabase. Ordem sugerida
baseada nos dados que já estão no banco:

1. **`info.feed`** → `staging_feed_estado` populado por presidência+SEN+DINAC
2. **`alerts.recent`** → `staging_alerta` populado por SEN+DINAC (precisa
   trigger SQL pra normalizar raw → staging)
3. **`wallet.balance`** → cotação USD/PYG do BCP em `staging_cotacao`
4. **`gov.tramite_search`** → metadata MEC/MSPBS em raw_mec_instituciones

Resto dos tools (saúde detalhada, edu boletín, crypto, police, docs) entra
na Onda 3 — depende de fontes ainda não mapeadas (MITIC OAuth, Idwall PY,
etc) ou que precisam scraping mais sofisticado.

## 💡 Aprendizados do que NÃO funcionou

- `paraguay.gov.py` não tem API pública estruturada — scraping HTML é o
  único caminho (mapping pendente)
- `datos.mec.gov.py` retorna páginas HTML, não API JSON — usar
  `datos.gov.py` (DKAN) que tem API CKAN parcial
- `datos.gov.py` package_search retorna HTML (DKAN antigo, não respeita
  `Accept: application/json`); contornei usando `package_list` + filtro
  Python por keywords + `package_show` por slug
- DNCP, Decretos e ReliefWeb v2 têm bloqueios institucionais (endpoint
  morto / approval / offline) — todos com TODO claro pra retomada

## ✅ Commits autônomos no `feat/mvp-real-data`

```
HEAD  feat: SEN feed RSS + DINAC pronóstico — 2 fontes reais bonus
      feat: scrapers Onda 1 — 4 workflows reais + 3 skeletons + dim_pessoas_py
      feat: migration 0002 — grants no schema nanduti
      feat: bootstrap MVP — supabase schema, DO Gradient LLM, scrapers scaffold
main  fix: client-side TypeError on chat suggestions
```

---

**Próxima sessão:** se quiser continuar pela manhã, sugiro começar pela
migration 0003 (1 paste) + push da branch + PR. A partir daí, atacar
Onda 2 (substituir handlers mock dos primeiros 4 tools).
