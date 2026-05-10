"""ETL BCP — orquestrador.

Roda cotacao.fetch() e persiste em nanduti.raw_bcp_cotacao.
Idempotente por sha256.

Uso:
    python -m bcp.run
    DRY_RUN=1 python -m bcp.run
"""
from __future__ import annotations
import sys
import logging

from _lib.http import is_dry_run
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)
from bcp import cotacao

log = logging.getLogger("bcp")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

RAW_TABLE = "raw_bcp_cotacao"


def _persist(sb, items: list[dict]) -> tuple[int, int]:
    novos = dups = 0
    for item in items:
        sha = sha256_payload(item)
        result = upsert_raw(sb, RAW_TABLE, cotacao.URL, item, sha)
        if result.get("inserted", 0) > 0:
            novos += 1
        else:
            dups += 1
    return novos, dups


def run() -> int:
    dry = is_dry_run()
    sb = None if dry else server_client()
    log.info("source=%s starting (dry=%s)", cotacao.FONTE_NOME, dry)

    try:
        items = cotacao.fetch()
    except Exception as e:
        log.exception("fetch_failed")
        if not dry and sb:
            fid = fonte_id_por_nome(sb, cotacao.FONTE_NOME)
            if fid:
                registrar_coleta(sb, fid, "error", 0, 0, 0, erro=str(e)[:500])
        return 1

    log.info("fetched=%d", len(items))

    if dry:
        for it in items[:3]:
            log.info("sample: %s = %s PYG (unid=%s, fecha=%s)",
                     it["moeda_codigo"], it["valor_pyg"], it["unidade"], it["fecha_planilla"])
        return 0

    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos, dups = _persist(sb, items)
    log.info("persisted novos=%d dups=%d", novos, dups)
    fid = fonte_id_por_nome(sb, cotacao.FONTE_NOME)
    if fid:
        status = "ok" if items else "partial"
        registrar_coleta(sb, fid, status, len(items), novos, dups)
    return 0


if __name__ == "__main__":
    sys.exit(run())
