"""ETL MSPBS — Unidades de Salud Familiar (USFs).

Fonte canônica: datos.gov.py CKAN, organização MSPBS.
URL: https://www.datos.gov.py/api/3/action/organization_show?id=ministerio-de-salud-publica-y-bienestar-social-mspbs

Estratégia:
1. Pega org `ministerio-de-salud-publica-y-bienestar-social-mspbs` via CKAN.
2. Pra cada package (dataset), pega `package_show`.
3. Filtra datasets relevantes pra USF / estabelecimentos / cobertura.
4. Persiste payload em `nanduti.raw_mspbs_usf`.

Diferença vs `datos_gov_py.run`:
- Aquele faz catalog discovery global por keywords.
- Este foca exclusivamente na org MSPBS e captura TODOS os datasets
  da org, não só os keyword-match. Útil pra descobrir novos datasets
  sem precisar atualizar lista de keywords.

Idempotência: SHA256 do payload.

Uso:
    python -m mspbs.run
    DRY_RUN=1 python -m mspbs.run
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

log = logging.getLogger("mspbs")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

FONTE_NOME = "mspbs_datos_abiertos"
RAW_TABLE = "raw_mspbs_usf"
BASE = "https://www.datos.gov.py"
ORG_ID = "ministerio-de-salud-publica-y-bienestar-social-mspbs"
ORG_URL = f"{BASE}/api/3/action/organization_show"
PKG_URL = f"{BASE}/api/3/action/package_show"


def fetch() -> list[dict]:
    out: list[dict] = []
    with make_client(timeout=30.0) as client:
        org_resp = get(client, ORG_URL, params={"id": ORG_ID, "include_datasets": "true"})
        body = org_resp.json()
        if not body.get("success"):
            raise RuntimeError(f"ckan_org_failed: {body}")
        result = body.get("result") or {}
        packages = result.get("packages") or []
        log.info("org=%s datasets=%d", ORG_ID, len(packages))

        for pkg_summary in packages:
            pkg_id = pkg_summary.get("id") or pkg_summary.get("name")
            if not pkg_id:
                continue
            try:
                pkg_resp = get(client, PKG_URL, params={"id": pkg_id})
                pkg_body = pkg_resp.json()
            except Exception as e:
                log.warning("skip pkg=%s err=%s", pkg_id, e)
                continue
            if not pkg_body.get("success"):
                continue
            pkg = pkg_body.get("result") or {}

            payload = {
                "fonte_nome": FONTE_NOME,
                "org_id": ORG_ID,
                "dataset_id": pkg.get("id"),
                "name": pkg.get("name"),
                "title": pkg.get("title"),
                "notes": pkg.get("notes"),
                "license": pkg.get("license_title") or pkg.get("license_id"),
                "metadata_modified": pkg.get("metadata_modified"),
                "tags": [t.get("name") for t in (pkg.get("tags") or [])],
                "groups": [g.get("name") for g in (pkg.get("groups") or [])],
                "resources": [
                    {
                        "id": r.get("id"),
                        "name": r.get("name"),
                        "description": r.get("description"),
                        "format": r.get("format"),
                        "url": r.get("url"),
                        "size": r.get("size"),
                        "last_modified": r.get("last_modified"),
                    }
                    for r in (pkg.get("resources") or [])
                ],
                "url": f"{BASE}/dataset/{pkg.get('name')}",
            }
            out.append(payload)
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

    log.info("fetched datasets=%d", len(items))

    if dry:
        for it in items[:5]:
            log.info("dataset: %s (%d resources)",
                     it["title"], len(it["resources"]))
        return 0

    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos = dups = 0
    for item in items:
        sha = sha256_payload(item)
        result = upsert_raw(sb, RAW_TABLE, item["url"], item, sha)
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
