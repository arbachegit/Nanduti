"""ETL SEN scraping — SKELETON.

Substituto temporário pra ReliefWeb (que está bloqueado por appname approval).

Fonte: https://www.sen.gov.py/

Status (2026-05-10): página explorada superficialmente. Estrutura HTML
ainda não mapeada. Precisa:
1. Identificar feed/lista de notícias/alertas
2. Mapear seletores estáveis
3. Lidar com paginação e categorias (alerta vs aviso)

Persiste em nanduti.raw_reliefweb_sen (fonte_nome=sen_scraping pra
distinguir do appname-aprovado).

Quando ReliefWeb v2 destravar, esse scraper pode ser desativado ou
ficar como segundo backup pra resiliência.

Workflow YAML pendente: criar `.github/workflows/etl-sen-scraping.yml`
quando implementação estiver pronta.
"""
from __future__ import annotations
import sys
import logging

log = logging.getLogger("sen")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")


def fetch() -> list[dict]:
    log.warning("sen scraping NÃO IMPLEMENTADO — esperando ReliefWeb v2")
    return []


def run() -> int:
    items = fetch()
    log.info("fetched=%d (skeleton)", len(items))
    return 0


if __name__ == "__main__":
    sys.exit(run())
