"""ETL datos.gov.py — catalog metadata MEC + MSPBS.

Estratégia: descobre datasets relevantes por keywords e persiste o
metadata canônico (slug, título, resources) em raw_mec_instituciones
e raw_mspbs_usf. Conteúdo dos resources (HTML/CSV) fica como TODO — esta
camada é "catalog discovery", suficiente pra `gov.tramite_search` listar
fontes oficiais.

Cron 30d (datos.gov.py atualiza raramente).
"""
from __future__ import annotations
import sys
import logging

from _lib.http import make_client, is_dry_run
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)
from datos_gov_py import helper

log = logging.getLogger("datos_gov_py")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

# Mapeamento domínio → fonte_nome → raw_table → keywords pra filtro.
DOMAINS = [
    {
        "domain": "mec",
        "fonte_nome": "mec_instituciones",
        "raw_table": "raw_mec_instituciones",
        "keywords": [
            "establecimientos-escolares",
            "directorio-de-instituciones",
            "instituciones-educativas",
            "datos-específicos-de-instituciones",
            "datos-especificos-de-instituciones",
            "mapa-escolar",
            "fonacide-establecimientos",
            "anuario-2021-educacion",
            "compendio-estadístico-del-paraguay-2019-tema-educacion",
            "informaciones-generales-sobre-centros-educativos",
        ],
    },
    {
        "domain": "mspbs",
        "fonte_nome": "mspbs_datos_abiertos",
        "raw_table": "raw_mspbs_usf",
        "keywords": [
            "salud-y-bienestar",
            "registros-sanitarios",
            "precios-de-medicamentos",
            "anuario-2021-salud",
            "anuario-estadístico-2019-salud",
            "compendio-estadístico-2018-salud",
            "compendio-estadístico-del-paraguay-2019-tema-salud",
            "alcantarillado-sanitario",
        ],
    },
]


def _persist(sb, raw_table: str, items: list[dict], source_url_fn) -> tuple[int, int]:
    novos = dups = 0
    for item in items:
        sha = sha256_payload(item)
        result = upsert_raw(sb, raw_table, source_url_fn(item), item, sha)
        if result.get("inserted", 0) > 0:
            novos += 1
        else:
            dups += 1
    return novos, dups


def run() -> int:
    dry = is_dry_run()
    sb = None if dry else server_client()
    fail = 0

    with make_client(timeout=30.0) as client:
        try:
            slugs = helper.package_list(client, limit=500)
            log.info("package_list total=%d", len(slugs))
        except Exception as e:
            log.exception("package_list_failed")
            return 1

        for cfg in DOMAINS:
            domain = cfg["domain"]
            fonte_nome = cfg["fonte_nome"]
            raw_table = cfg["raw_table"]
            kws = cfg["keywords"]
            target_slugs = helper.filter_slugs(slugs, kws)
            log.info("domain=%s matched=%d slugs=%s", domain, len(target_slugs),
                     target_slugs[:5])

            items: list[dict] = []
            for slug in target_slugs:
                try:
                    meta = helper.package_show(client, slug)
                    norm = helper.normalize_dataset(meta, domain)
                    if norm.get("slug"):
                        items.append(norm)
                except Exception as e:
                    log.warning("domain=%s slug=%s show_failed: %s", domain, slug, e)
                    continue

            log.info("domain=%s normalized=%d", domain, len(items))

            if dry:
                if items:
                    log.info("domain=%s sample: %s | %d resources",
                             domain, items[0]["slug"], len(items[0]["resources"]))
                continue

            if not sb:
                fail += 1
                continue

            try:
                novos, dups = _persist(sb, raw_table, items, lambda i: i.get("url") or "")
                log.info("domain=%s persisted novos=%d dups=%d", domain, novos, dups)
                fid = fonte_id_por_nome(sb, fonte_nome)
                if fid:
                    registrar_coleta(sb, fid, "ok" if items else "partial",
                                     len(items), novos, dups)
            except Exception as e:
                log.exception("domain=%s persist_failed", domain)
                fid = fonte_id_por_nome(sb, fonte_nome)
                if fid:
                    registrar_coleta(sb, fid, "error", len(items), 0, 0,
                                     erro=str(e)[:500])
                fail += 1

    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(run())
