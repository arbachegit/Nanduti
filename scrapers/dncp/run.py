"""ETL DNCP OCDS — implementação real.

Fonte: https://www.contrataciones.gov.py/datos/api/v3/doc/

Descoberto via agente de pesquisa em 2026-05-10:
- Endpoint correto está atrás do prefixo Swagger UI `/doc/`
- 4 req/s sem autenticação
- OCDS 1.1 compliant, prefixo `ocds-03ad3f-` (Paraguay-DNCP)
- Filtro de data obrigatório

Cron 1d. Busca o dia anterior completo (00:00 → 23:59 UTC-3).
Persiste cada record em nanduti.raw_dncp_contratos (idempotente sha256).
"""
from __future__ import annotations
import sys
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Any
from pydantic import BaseModel, Field

from _lib.http import make_client, get, is_dry_run
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)

log = logging.getLogger("dncp")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

API_BASE = "https://www.contrataciones.gov.py/datos/api/v3/doc"
SEARCH_URL = f"{API_BASE}/search/processes"
FONTE_NOME = "dncp_ocds"
RAW_TABLE = "raw_dncp_contratos"
ITEMS_PER_PAGE = 50
MAX_PAGES = 50            # safety cap (50 × 50 = 2500 records/dia max)
RATE_LIMIT_S = 0.30        # ~3.3 req/s, abaixo do 4 req/s livre


class DncpRecord(BaseModel):
    fonte_nome: str = FONTE_NOME
    ocid: str
    publishedDate: str | None = None
    fecha_lote: str
    releases: list[dict[str, Any]] = Field(default_factory=list)
    compiledRelease: dict[str, Any] | None = None
    raw_record: dict[str, Any] = Field(default_factory=dict)


def _yesterday_window() -> tuple[str, str]:
    """Retorna (fecha_desde, fecha_hasta) ISO sem timezone, do dia anterior."""
    today = datetime.now(timezone.utc).date()
    y = today - timedelta(days=1)
    desde = f"{y.isoformat()}T00:00:00"
    hasta = f"{y.isoformat()}T23:59:59"
    return desde, hasta


def fetch_window(fecha_desde: str, fecha_hasta: str) -> list[dict[str, Any]]:
    """Pagina releases por janela de data. Retorna list de records OCDS."""
    out: list[dict] = []
    seen_ocids: set[str] = set()
    with make_client(timeout=60.0) as client:
        for page in range(1, MAX_PAGES + 1):
            params = {
                "fecha_desde": fecha_desde,
                "fecha_hasta": fecha_hasta,
                "tipo_fecha": "fecha_release",
                "items_per_page": ITEMS_PER_PAGE,
                "page": page,
            }
            try:
                resp = get(client, SEARCH_URL, params=params, headers={"Accept": "application/json"})
            except Exception as e:
                log.warning("page=%d fetch_failed: %s", page, e)
                break
            j = resp.json()
            records = j.get("records") or []
            log.info("page=%d records=%d", page, len(records))
            if not records:
                break
            for r in records:
                ocid = r.get("ocid")
                if not ocid or ocid in seen_ocids:
                    continue
                seen_ocids.add(ocid)
                out.append(r)
            # Stop quando última página
            current_page = j.get("current_page") or page
            total_pages = j.get("total_pages") or 1
            if current_page >= total_pages:
                break
            time.sleep(RATE_LIMIT_S)
    return out


def normalize(record: dict[str, Any], fecha_lote: str) -> dict[str, Any]:
    return DncpRecord(
        ocid=record.get("ocid", ""),
        publishedDate=record.get("publishedDate"),
        fecha_lote=fecha_lote,
        releases=record.get("releases", []),
        compiledRelease=record.get("compiledRelease"),
        raw_record=record,
    ).model_dump()


def run() -> int:
    dry = is_dry_run()
    sb = None if dry else server_client()
    log.info("source=%s starting (dry=%s)", FONTE_NOME, dry)

    desde, hasta = _yesterday_window()
    log.info("window: %s → %s", desde, hasta)

    try:
        records = fetch_window(desde, hasta)
    except Exception as e:
        log.exception("fetch_failed")
        if not dry and sb:
            fid = fonte_id_por_nome(sb, FONTE_NOME)
            if fid:
                registrar_coleta(sb, fid, "error", 0, 0, 0, erro=str(e)[:500])
        return 1

    log.info("fetched records=%d", len(records))

    if dry:
        for r in records[:3]:
            log.info("sample ocid=%s releases=%d", r.get("ocid"), len(r.get("releases") or []))
        return 0

    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos = dups = 0
    fecha_lote = desde[:10]
    for r in records:
        item = normalize(r, fecha_lote)
        sha = sha256_payload({"ocid": item["ocid"], "fecha_lote": fecha_lote})
        # sha sobre (ocid, fecha) — duas runs no mesmo dia são idempotentes
        result = upsert_raw(sb, RAW_TABLE, f"{API_BASE}/ocds/record/{item['ocid']}", item, sha)
        if result.get("inserted", 0) > 0:
            novos += 1
        else:
            dups += 1

    log.info("persisted novos=%d dups=%d", novos, dups)
    fid = fonte_id_por_nome(sb, FONTE_NOME)
    if fid:
        registrar_coleta(sb, fid, "ok" if records else "partial", len(records), novos, dups)
    return 0


if __name__ == "__main__":
    sys.exit(run())
