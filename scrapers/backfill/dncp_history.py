"""Backfill DNCP — 90 dias de contratos OCDS.

Os scrapers normais pegam só o dia anterior. Pra ter volume real de
contratos públicos paraguaios, este script percorre 90 dias e popula
nanduti.raw_dncp_contratos com milhares de records.

Idempotente: SHA256 (ocid, fecha_lote) evita duplicação. Pode rodar
N vezes — segunda execução = 0 inserts novos.

Rate limit DNCP: 4 req/s sem auth. Este script usa 3 req/s pra margem.

Uso:
    python -m backfill.dncp_history [DAYS=90]
"""
from __future__ import annotations
import os
import sys
import time
import logging
from datetime import datetime, timezone, timedelta

from _lib.http import make_client, get
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)

log = logging.getLogger("dncp_backfill")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

API_BASE = "https://www.contrataciones.gov.py/datos/api/v3/doc"
SEARCH_URL = f"{API_BASE}/search/processes"
FONTE_NOME = "dncp_ocds"
RAW_TABLE = "raw_dncp_contratos"
ITEMS_PER_PAGE = 100
MAX_PAGES = 200
RATE_LIMIT_S = 0.34   # ~2.9 req/s


def fetch_day(client, day_iso: str) -> list[dict]:
    """Fetch all records for a single date (paginated)."""
    desde = f"{day_iso}T00:00:00"
    hasta = f"{day_iso}T23:59:59"
    out: list[dict] = []
    seen: set[str] = set()
    for page in range(1, MAX_PAGES + 1):
        params = {
            "fecha_desde": desde,
            "fecha_hasta": hasta,
            "tipo_fecha": "fecha_release",
            "items_per_page": ITEMS_PER_PAGE,
            "page": page,
        }
        try:
            resp = get(client, SEARCH_URL, params=params, headers={"Accept": "application/json"})
        except Exception as e:
            log.warning("day=%s page=%d failed: %s", day_iso, page, e)
            break
        j = resp.json()
        recs = j.get("records") or []
        if not recs:
            break
        for r in recs:
            ocid = r.get("ocid")
            if not ocid or ocid in seen:
                continue
            seen.add(ocid)
            out.append(r)
        total_pages = j.get("total_pages") or 1
        current = j.get("current_page") or page
        if current >= total_pages:
            break
        time.sleep(RATE_LIMIT_S)
    return out


def main() -> int:
    days = int(os.environ.get("DAYS") or (sys.argv[1] if len(sys.argv) > 1 else 90))
    log.info("backfill range: %d days", days)

    sb = server_client()
    if not sb:
        log.error("supabase client unavailable — set SUPABASE_URL + SUPABASE_SERVICE_ROLE")
        return 1

    today = datetime.now(timezone.utc).date()
    novos_total = dups_total = err_total = 0
    days_with_data = 0

    with make_client(timeout=60.0) as client:
        for offset in range(1, days + 1):
            day = today - timedelta(days=offset)
            day_iso = day.isoformat()
            try:
                records = fetch_day(client, day_iso)
            except Exception as e:
                log.warning("day=%s fetch failed: %s", day_iso, e)
                err_total += 1
                continue

            if not records:
                continue
            days_with_data += 1

            n_day = d_day = 0
            for r in records:
                ocid = r.get("ocid", "")
                item = {
                    "fonte_nome": FONTE_NOME,
                    "ocid": ocid,
                    "publishedDate": r.get("publishedDate"),
                    "fecha_lote": day_iso,
                    "releases": r.get("releases", []),
                    "compiledRelease": r.get("compiledRelease"),
                    "raw_record": r,
                }
                sha = sha256_payload({"ocid": ocid, "fecha_lote": day_iso})
                result = upsert_raw(sb, RAW_TABLE, f"{API_BASE}/ocds/record/{ocid}", item, sha)
                if result.get("inserted", 0) > 0:
                    n_day += 1
                else:
                    d_day += 1
            log.info("day=%s records=%d novos=%d dups=%d", day_iso, len(records), n_day, d_day)
            novos_total += n_day
            dups_total += d_day
            time.sleep(RATE_LIMIT_S)

    log.info("=== BACKFILL DNCP DONE ===")
    log.info("days_with_data=%d errors=%d", days_with_data, err_total)
    log.info("novos=%d dups=%d total_persisted=%d", novos_total, dups_total, novos_total + dups_total)

    fid = fonte_id_por_nome(sb, FONTE_NOME)
    if fid:
        registrar_coleta(sb, fid, "ok" if novos_total + dups_total > 0 else "partial",
                         novos_total + dups_total, novos_total, dups_total,
                         erro=f"backfill {days}d, {err_total} errors" if err_total else None)
    return 0


if __name__ == "__main__":
    sys.exit(main())
