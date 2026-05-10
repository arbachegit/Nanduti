"""ETL SEN — feed RSS WordPress.

Fonte: https://sen.gov.py/feed/

Confirmação 2026-05-10: SEN é WordPress puro com RSS padrão. Usar RSS
em vez de scraping HTML — estável e estruturado.

Persistido em nanduti.raw_reliefweb_sen com fonte_nome=sen_scraping
(distingue de itens vindos via ReliefWeb v2 quando aprovado).

NOTA: a fonte 'sen_scraping' está em fontes_dados após migration 0003.
Sem 0003, o scraper grava o raw mas pula registrar_coleta com warning.
"""
from __future__ import annotations
import sys
import logging
from datetime import datetime, timezone
import feedparser
from pydantic import BaseModel, Field

from _lib.http import USER_AGENT, is_dry_run
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)

log = logging.getLogger("sen")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

FEED_URL = "https://sen.gov.py/feed/"
FONTE_NOME = "sen_scraping"
RAW_TABLE = "raw_reliefweb_sen"


class SenItem(BaseModel):
    fonte_nome: str = FONTE_NOME
    title: str
    link: str
    pub_date: str
    categories: list[str] = Field(default_factory=list)
    creator: str | None = None
    summary: str = ""
    guid: str


def _to_iso_utc(struct_time) -> str:
    if not struct_time:
        return datetime.now(timezone.utc).isoformat()
    dt = datetime(*struct_time[:6], tzinfo=timezone.utc)
    return dt.isoformat()


def fetch() -> list[dict]:
    feed = feedparser.parse(FEED_URL, request_headers={"User-Agent": USER_AGENT})
    if feed.bozo and not feed.entries:
        raise RuntimeError(f"feed_parse_error: {feed.bozo_exception}")
    out: list[dict] = []
    for entry in feed.entries:
        try:
            item = SenItem(
                title=entry.get("title", "").strip(),
                link=entry.get("link", "").strip(),
                pub_date=_to_iso_utc(entry.get("published_parsed")),
                categories=[t.term for t in entry.get("tags", []) if t.get("term")],
                creator=entry.get("author"),
                summary=(entry.get("summary") or "").strip()[:5000],
                guid=entry.get("id") or entry.get("link", ""),
            )
        except Exception:
            continue
        if not item.title or not item.link:
            continue
        out.append(item.model_dump())
    return out


def run() -> int:
    dry = is_dry_run()
    sb = None if dry else server_client()
    log.info("source=%s starting (dry=%s)", FONTE_NOME, dry)

    try:
        items = fetch()
    except Exception as e:
        log.exception("fetch_failed")
        if not dry and sb:
            fid = fonte_id_por_nome(sb, FONTE_NOME)
            if fid:
                registrar_coleta(sb, fid, "error", 0, 0, 0, erro=str(e)[:500])
        return 1

    log.info("fetched=%d", len(items))

    if dry:
        for it in items[:3]:
            log.info("sample: %s | %s", it["title"][:80], it["pub_date"])
        return 0

    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos = dups = 0
    for item in items:
        sha = sha256_payload(item)
        result = upsert_raw(sb, RAW_TABLE, item.get("link", ""), item, sha)
        if result.get("inserted", 0) > 0:
            novos += 1
        else:
            dups += 1
    log.info("persisted novos=%d dups=%d", novos, dups)

    fid = fonte_id_por_nome(sb, FONTE_NOME)
    if fid:
        registrar_coleta(sb, fid, "ok" if items else "partial", len(items), novos, dups)
    else:
        log.warning("fonte %r ausente em fontes_dados — aplicar migration 0003", FONTE_NOME)
    return 0


if __name__ == "__main__":
    sys.exit(run())
