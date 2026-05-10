"""ETL MEC datos.mec.gov.py — diretório de instituições (escolas).

Fonte: https://datos.mec.gov.py/ (DKAN do Ministério de Educación)
Fonte canônica: https://datos.mec.gov.py/data/directorios_instituciones

Estratégia:
1. Lista datasets via API DKAN (`/api/3/action/package_list`).
2. Filtra por keywords ligadas a instituições/matrículas/escolas.
3. Para cada dataset relevante, pega `package_show` (metadata + recursos).
4. Persiste payload completo em `nanduti.raw_mec_instituciones` ou
   `nanduti.raw_mec_matriculas` conforme heurística do dataset.

Idempotência: SHA256 do payload (sort_keys, sem timestamp). Re-run não
duplica.

Conteúdo dos recursos (CSV/XLS) NÃO é baixado aqui — fica como TODO.
Esta camada é "catalog discovery" pra alimentar `gov.escola_search` e
disclaimers contextuais. Download de CSV demanda parsing por dataset
e migra pra job separado.

Uso:
    python -m mec.run
    DRY_RUN=1 python -m mec.run
"""
from __future__ import annotations
import sys
import logging

from _lib.http import make_client, get, is_dry_run
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)

log = logging.getLogger("mec")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

FONTE_NOME = "mec_datos_portal"
BASE = "https://datos.mec.gov.py"
LIST_URL = f"{BASE}/api/3/action/package_list"
SHOW_URL = f"{BASE}/api/3/action/package_show"

# Heurística: dataset cujo id/title bate com qualquer keyword vai pra
# tabela raw correspondente. Ordem importa — primeiro match ganha.
ROUTING = [
    ("raw_mec_matriculas", ("matricul", "matrícul", "matriculaciones")),
    ("raw_mec_instituciones", (
        "institucion", "directorio", "establecimiento", "escolar",
        "escuela", "centros-educativos", "centro-educativo",
    )),
]


def _route(dataset_id: str, title: str | None) -> str | None:
    haystack = f"{dataset_id} {title or ''}".lower()
    for raw_table, keywords in ROUTING:
        if any(k in haystack for k in keywords):
            return raw_table
    return None


def fetch() -> list[tuple[str, dict]]:
    """Retorna lista de (raw_table, payload) já roteada."""
    out: list[tuple[str, dict]] = []
    with make_client(timeout=30.0) as client:
        list_resp = get(client, LIST_URL)
        body = list_resp.json()
        if not body.get("success"):
            raise RuntimeError(f"dkan_list_failed: {body}")
        ids = body.get("result") or []
        log.info("discovered datasets=%d", len(ids))

        for dataset_id in ids:
            try:
                show_resp = get(client, SHOW_URL, params={"id": dataset_id})
                show_body = show_resp.json()
            except Exception as e:
                log.warning("skip dataset=%s err=%s", dataset_id, e)
                continue
            if not show_body.get("success"):
                continue
            pkg = show_body.get("result") or {}
            raw_table = _route(dataset_id, pkg.get("title"))
            if not raw_table:
                continue

            payload = {
                "fonte_nome": FONTE_NOME,
                "dataset_id": dataset_id,
                "title": pkg.get("title"),
                "notes": pkg.get("notes"),
                "organization": (pkg.get("organization") or {}).get("title"),
                "license": pkg.get("license_title") or pkg.get("license_id"),
                "metadata_modified": pkg.get("metadata_modified"),
                "tags": [t.get("name") for t in (pkg.get("tags") or [])],
                "resources": [
                    {
                        "id": r.get("id"),
                        "name": r.get("name"),
                        "format": r.get("format"),
                        "url": r.get("url"),
                        "size": r.get("size"),
                        "last_modified": r.get("last_modified"),
                    }
                    for r in (pkg.get("resources") or [])
                ],
                "url": f"{BASE}/dataset/{dataset_id}",
            }
            out.append((raw_table, payload))
    return out


def run() -> int:
    dry = is_dry_run()
    sb = None if dry else server_client()
    log.info("starting (dry=%s)", dry)

    try:
        items = fetch()
    except Exception as e:
        log.exception("fetch_failed")
        if not dry and sb:
            fid = fonte_id_por_nome(sb, FONTE_NOME)
            if fid:
                registrar_coleta(sb, fid, "error", 0, 0, 0, erro=str(e)[:500])
        return 1

    log.info("routed datasets=%d", len(items))

    if dry:
        for raw_table, payload in items[:5]:
            log.info("→ %s :: %s (%d resources)",
                     raw_table, payload["title"], len(payload["resources"]))
        return 0

    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos = dups = 0
    for raw_table, payload in items:
        sha = sha256_payload(payload)
        result = upsert_raw(sb, raw_table, payload["url"], payload, sha)
        if result.get("inserted", 0) > 0:
            novos += 1
        else:
            dups += 1

    log.info("persisted novos=%d dups=%d", novos, dups)
    fid = fonte_id_por_nome(sb, FONTE_NOME)
    if fid:
        registrar_coleta(sb, fid, "ok" if items else "partial",
                         len(items), novos, dups)
    return 0


if __name__ == "__main__":
    sys.exit(run())
