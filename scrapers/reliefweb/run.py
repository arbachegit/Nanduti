"""ETL ReliefWeb SEN — SKELETON BLOQUEADO.

Status (2026-05-10): bloqueado por approval do `appname` em ReliefWeb v2.

Histórico:
- v1 (`https://api.reliefweb.int/v1/...`) DECOMMISSIONED
- v2 retorna HTTP 403 com mensagem:
    "You are not using an approved appname. Kindly request an appname
     from ReliefWeb here: https://apidoc.reliefweb.int/parameters#appname"

Próximos passos:
1. Submeter pedido em https://apidoc.reliefweb.int/parameters#appname
   com appname=`nanduti.iconsai.ai`. Resposta típica: 24-48h.
2. Quando aprovado, descomentar implementação abaixo.
3. Endpoint final: GET https://api.reliefweb.int/v2/reports
   ?appname=nanduti.iconsai.ai
   &filter[field]=primary_country.iso3
   &filter[value]=PRY
   &fields[include][]=title,date,source.shortname,url,body-html
   &limit=50
4. Persistir em nanduti.raw_reliefweb_sen.

Substituto temporário: scraper sen_scraping (ver scrapers/sen/run.py)
extrai do site SEN direto.
"""
from __future__ import annotations
import sys
import logging

log = logging.getLogger("reliefweb")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")


def fetch() -> list[dict]:
    log.warning("reliefweb v2 BLOQUEADO — aguarda approval do appname")
    return []


def run() -> int:
    items = fetch()
    log.info("fetched=%d (skeleton)", len(items))
    return 0


if __name__ == "__main__":
    sys.exit(run())
