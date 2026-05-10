"""ETL Presidência — orquestrador.

Roda os 3 sub-scrapers (agencia_ip, decretos, gaceta_oficial), persiste
items em `nanduti.raw_presidencia_feed` (idempotente por sha256) e
registra cada coleta em `nanduti.fontes_dados_coletas`.

Uso:
    python -m presidencia.run            # produção
    DRY_RUN=1 python -m presidencia.run  # local sem escrever no banco

Idempotente: rodar 2× seguidos não duplica items (UNIQUE em sha256).
"""
from __future__ import annotations
import os
import sys
import logging
from typing import Callable

from _lib.http import is_dry_run
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)
from presidencia import agencia_ip, decretos, gaceta_oficial

log = logging.getLogger("presidencia")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

RAW_TABLE = "raw_presidencia_feed"
RAW_TABLE_GACETA = "raw_gaceta_oficial"

# (fonte_nome, fetch_fn, raw_table) — gaceta tem tabela própria
SOURCES: list[tuple[str, Callable[[], list[dict]], str]] = [
    (agencia_ip.FONTE_NOME, agencia_ip.fetch, RAW_TABLE),
    (decretos.FONTE_NOME, decretos.fetch, RAW_TABLE),
    (gaceta_oficial.FONTE_NOME, gaceta_oficial.fetch, RAW_TABLE_GACETA),
]


def _persist(sb, items: list[dict], raw_table: str) -> tuple[int, int]:
    """Retorna (novos, duplicados)."""
    novos = dups = 0
    for item in items:
        sha = sha256_payload(item)
        link = item.get("link") or item.get("detalhe_url") or ""
        result = upsert_raw(sb, raw_table, link, item, sha)
        if result.get("inserted", 0) > 0:
            novos += 1
        else:
            dups += 1
    return novos, dups


def run() -> int:
    """Executa o pipeline. Retorna exit code (0 = ok, 1 = falha total)."""
    dry = is_dry_run()
    sb = None if dry else server_client()
    fail_count = 0

    for fonte_nome, fetch_fn, raw_table in SOURCES:
        log.info("source=%s starting", fonte_nome)
        try:
            items = fetch_fn()
        except Exception as e:
            log.exception("source=%s fetch_failed", fonte_nome)
            if not dry and sb:
                fid = fonte_id_por_nome(sb, fonte_nome)
                if fid:
                    registrar_coleta(sb, fid, "error", 0, 0, 0, erro=str(e)[:500])
            fail_count += 1
            continue

        log.info("source=%s fetched=%d", fonte_nome, len(items))

        if dry:
            log.info("source=%s DRY_RUN — skipping persist. sample=%s",
                     fonte_nome, items[:1])
            continue

        if not sb:
            log.error("supabase client unavailable; aborting persist")
            fail_count += 1
            continue

        try:
            novos, dups = _persist(sb, items, raw_table)
            log.info("source=%s persisted novos=%d dups=%d", fonte_nome, novos, dups)
            fid = fonte_id_por_nome(sb, fonte_nome)
            if fid:
                status = "ok" if items else "partial"
                registrar_coleta(sb, fid, status, len(items), novos, dups)
        except Exception as e:
            log.exception("source=%s persist_failed", fonte_nome)
            if sb:
                fid = fonte_id_por_nome(sb, fonte_nome)
                if fid:
                    registrar_coleta(sb, fid, "error", len(items), 0, 0, erro=str(e)[:500])
            fail_count += 1

    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(run())
