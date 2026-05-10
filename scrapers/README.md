# Ñandutí — Scrapers

Coleta autônoma de fontes públicas paraguaias. Cada subpasta = uma fonte.
Disparados por GitHub Actions (cron) — ver `.github/workflows/etl-*.yml`.

## Princípios

1. **Idempotência por SHA256** — todo registro raw tem hash do payload.
   Re-execução não duplica.
2. **Validação Pydantic v2** — payload entra raw, mas é validado antes do
   staging. CLAUDE.md §3 obriga.
3. **User-Agent identificado** — `Nanduti/1.0 (+https://nanduti.iconsai.ai;
   contato@iconsai.ai)`. Scraping respeitoso, rate-limit 1 req/s.
4. **Fail loud, recover gracefully** — `tenacity` retry com backoff
   exponencial; falha persistente vira linha em `fontes_dados_coletas`
   status='error' + Slack webhook.
5. **Sem cálculo no scraper** — só extração + persistência. Estatística e
   joining ficam em jobs SQL ou FastAPI separados.

## Layout

```
scrapers/
├── _lib/                    # utilitários compartilhados
│   ├── supabase_client.py   # cliente service-role + UPSERT idempotente
│   ├── idempotency.py       # SHA256 normalizado
│   ├── http.py              # httpx com User-Agent padrão + retry
│   └── coleta.py            # registra coleta em fontes_dados_coletas
├── presidencia/             # Agencia IP + Decretos + Gaceta
├── reliefweb/               # SEN via ReliefWeb API
├── dinac/                   # pronóstico
├── ande/                    # cortes energia
├── bcp/                     # cotação USD/PYG
├── dncp/                    # OCDS API
├── datos_gov_py/            # CKAN catalog discovery (MEC + MSPBS + MITIC)
├── paraguay_gov/            # catálogo trámites
├── mec/                     # datos.mec.gov.py DKAN (escolas + matrículas)
├── mec_github/              # mecpy/* mirror (run = metadata, run_content = CSVs)
├── mspbs/                   # USFs via CKAN MSPBS
├── dnit_ruc/                # consultaRUC API (empresas)
├── sen/                     # SEN scraping HTML direto
└── seprelad/                # resoluciones cripto
```

## Fontes de dados demográficos (saúde/educação/empresas)

| Fonte | Módulo | Workflow | Cron |
|---|---|---|---|
| MEC datos portal (escolas, matrículas) | `mec.run` | `etl-mec-datos-portal.yml` | seg 05:00 UTC |
| MEC GitHub metadata | `mec_github.run` | `etl-mec-github-mirror.yml` | dom 04:00 UTC |
| MEC GitHub conteúdo CSV | `mec_github.run_content` | `etl-mec-github-content.yml` | dom 04:30 UTC |
| MSPBS USFs (saúde) | `mspbs.run` | `etl-mspbs-usf.yml` | mensal 05:00 UTC |
| DNIT consultaRUC (empresas) | `dnit_ruc.run` | `etl-dnit-ruc.yml` | diário 06:00 UTC |

## Rodar local

```bash
cd scrapers
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export SUPABASE_URL=... SUPABASE_SERVICE_ROLE=...
python -m presidencia.run
```

## Adicionar novo scraper

1. Criar pasta `scrapers/<fonte>/` com `__init__.py` e `run.py`.
2. Registrar fonte em `nanduti.fontes_dados` (UPSERT idempotente —
   `0001_init_nanduti.sql` já fez seed).
3. Copiar `.github/workflows/_etl-template.yml` → `etl-<fonte>.yml`,
   ajustar cron + path.
4. Documentar URL canônica + user-agent em comentário no topo de `run.py`.

## Skills relacionadas

- `/skill-python-pydantic` — validação obrigatória
- `/skill-python-quality` — Ruff + Black
- `/skill-rag-ingestion` — idempotência por SHA256
- `/skill-injection-defense` — sanitização de input externo
