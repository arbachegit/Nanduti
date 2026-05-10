"""Agencia IP — feed RSS WordPress.

Fonte: https://www.ip.gov.py/ip/feed/

Por que RSS e não HTML? A homepage do `ip.gov.py` é WordPress puro com feed
padrão. RSS é estruturado, estável e dispensa scraping fragile. Mudança de
template não quebra o scraper.

Cada item retorna shape canônico para `nanduti.raw_presidencia_feed`:
{
  "fonte_nome": "agencia_ip",
  "title": str,
  "link": str,
  "pub_date": ISO8601 str,
  "categories": [str],
  "creator": str | None,
  "summary": str,
  "guid": str
}
"""
from __future__ import annotations
from datetime import datetime, timezone
import feedparser
from pydantic import BaseModel, Field

from _lib.http import USER_AGENT

FEED_URL = "https://www.ip.gov.py/ip/feed/"
FONTE_NOME = "agencia_ip"


class AgenciaIpItem(BaseModel):
    fonte_nome: str = FONTE_NOME
    title: str
    link: str
    pub_date: str   # ISO8601 UTC
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
    """Busca feed RSS e retorna lista de items canônicos (já validados).

    Não lança exceção em entrada malformada — items inválidos são pulados,
    e o caller decide o que fazer com `len(items) == 0`.
    """
    feed = feedparser.parse(FEED_URL, request_headers={"User-Agent": USER_AGENT})
    if feed.bozo and not feed.entries:
        raise RuntimeError(f"feed_parse_error: {feed.bozo_exception}")

    out: list[dict] = []
    for entry in feed.entries:
        try:
            item = AgenciaIpItem(
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
