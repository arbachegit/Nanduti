"""ETL DINAC pronóstico — scraping HTML.

Fonte: https://www.meteorologia.gov.py/pronostico/

Estrutura HTML (validada 2026-05-10):
- Cards `<div class="pronostico--content">` com prosa descritiva
- Headings `<div class="pronostico--title">` com formato:
    "Concepción actualizado el 09/05/2026 11:01 pm"
- Cada card cobre 1 ciudad/dpto + previsão hoje+2 dias

Persistido em nanduti.raw_dinac_clima.
Cron 1h (DINAC atualiza ~6×/dia).
"""
from __future__ import annotations
import re
import sys
import logging
from datetime import datetime, timezone
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field

from _lib.http import make_client, get, is_dry_run
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)

log = logging.getLogger("dinac")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

URL = "https://www.meteorologia.gov.py/pronostico/"
FONTE_NOME = "dinac_pronostico"
RAW_TABLE = "raw_dinac_clima"


class Pronostico(BaseModel):
    fonte_nome: str = FONTE_NOME
    ciudad: str
    actualizado_em: str        # raw "09/05/2026 11:01 pm" (mantido pra rastreabilidade)
    actualizado_iso: str | None = None  # ISO best-effort
    descripcion: str
    icon_alt: str | None = None


def _parse_titulo(text: str) -> tuple[str, str, str | None]:
    """'Concepción actualizado el 09/05/2026 11:01 pm' → (cidade, raw_dt, iso)"""
    m = re.match(r"^(.+?)\s+actualizado el\s+(.+?)$", text.strip(), re.I)
    if not m:
        return text.strip(), "", None
    cidade = m.group(1).strip()
    raw_dt = m.group(2).strip()
    iso = None
    try:
        m2 = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)", raw_dt, re.I)
        if m2:
            dd, mm, yy, hh, mn, ampm = m2.groups()
            hh = int(hh) % 12
            if ampm.lower() == "pm":
                hh += 12
            iso = f"{yy}-{int(mm):02d}-{int(dd):02d}T{hh:02d}:{mn}:00-03:00"
    except Exception:
        pass
    return cidade, raw_dt, iso


def fetch() -> list[dict]:
    with make_client(timeout=30.0) as client:
        resp = get(client, URL)
    soup = BeautifulSoup(resp.text, "html.parser")

    titles = soup.select(".pronostico--title")
    contents = soup.select(".pronostico--content")
    icons = soup.select(".pronostico--icon")

    # Os 3 sets nem sempre alinham 1:1; emparelhamos por ordem (best-effort).
    out: list[dict] = []
    n = max(len(titles), len(contents))
    for i in range(n):
        t = titles[i] if i < len(titles) else None
        c = contents[i] if i < len(contents) else None
        icn = icons[i] if i < len(icons) else None
        if not t or not c:
            continue
        cidade, raw_dt, iso = _parse_titulo(t.get_text(" ", strip=True))
        descr = c.get_text(" ", strip=True)
        # Skip card "geral" sem cidade
        if not cidade or len(cidade) > 80:
            continue
        try:
            p = Pronostico(
                ciudad=cidade,
                actualizado_em=raw_dt,
                actualizado_iso=iso,
                descripcion=descr[:1500],
                icon_alt=(icn.get("alt") if icn else None),
            )
        except Exception:
            continue
        out.append(p.model_dump())
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
            log.info("sample: %s @ %s | %s",
                     it["ciudad"], it["actualizado_em"], it["descripcion"][:80])
        return 0

    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos = dups = 0
    for item in items:
        sha = sha256_payload(item)
        result = upsert_raw(sb, RAW_TABLE, URL, item, sha)
        if result.get("inserted", 0) > 0:
            novos += 1
        else:
            dups += 1
    log.info("persisted novos=%d dups=%d", novos, dups)

    fid = fonte_id_por_nome(sb, FONTE_NOME)
    if fid:
        registrar_coleta(sb, fid, "ok" if items else "partial", len(items), novos, dups)
    return 0


if __name__ == "__main__":
    sys.exit(run())
