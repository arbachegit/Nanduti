"""ETL DNCP OCDS — SKELETON BLOQUEADO.

Status (2026-05-10): API v3 documentada retorna 404. Endpoint atual
desconhecido sem investigação extra.

Histórico:
- contrataciones.gov.py/datos/api/v3/ → 404 Not Found (doc/search/processes
  e variantes) Squid/2.4 antigo
- Provavelmente migrou pra outra estrutura (v4? endpoint próprio?)

Próximos passos:
1. Investigar via https://data.open-contracting.org/en/publication/63
   (Open Contracting Data Registry mantém URL atualizada)
2. Email institucional pra DNCP solicitando endpoint atual
3. Mirror estático: data.open-contracting.org publica releases mensais

Endpoint alvo (quando descoberto):
    GET <base>/releases.json?date_gte=YYYY-MM-DD&page=1
    [...itera páginas...]
    Persiste cada release em nanduti.raw_dncp_contratos.
"""
from __future__ import annotations
import sys
import logging

log = logging.getLogger("dncp")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")


def fetch() -> list[dict]:
    log.warning("dncp api v3 BLOQUEADO — endpoint atual desconhecido")
    return []


def run() -> int:
    items = fetch()
    log.info("fetched=%d (skeleton)", len(items))
    return 0


if __name__ == "__main__":
    sys.exit(run())
