"""Gaceta Oficial — scraping HTML SSR.

Fonte: https://www.gacetaoficial.gov.py/

Descoberto via agente de pesquisa em 2026-05-10:
- App Grails SSR (não SPA), homepage 16KB já lista últimas Gacetas
- Endpoint detalhe: /index/detalle_publicacion/{id} → HTML
- Endpoint PDF: /index/getDocumento/{docId}
- IDs sequenciais não-densos (~96173 em 08/05/2026)

Estratégia incremental: parsear homepage e capturar últimas 6-10 gacetas
identificadas pelo ID mais recente. SHA256 sobre {id, numero, fecha}.

A Gaceta publica TODOS os decretos presidenciais (cobre lacuna do site
decretos.presidencia.gov.py geo-bloqueado).
"""
from __future__ import annotations
import re
import logging
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field

from _lib.http import make_client, get

log = logging.getLogger("gaceta_oficial")

URL = "https://www.gacetaoficial.gov.py/"
DETALHE_URL = "https://www.gacetaoficial.gov.py/index/detalle_publicacion/{id}"
PDF_URL = "https://www.gacetaoficial.gov.py/index/getDocumento/{id}"
FONTE_NOME = "gaceta_oficial"


class GacetaItem(BaseModel):
    fonte_nome: str = FONTE_NOME
    publicacion_id: int           # ID interno
    numero: str | None = None     # "117" da string "Gaceta Nº 117"
    fecha: str | None = None      # ISO YYYY-MM-DD
    titulo: str
    detalhe_url: str
    documentos: list[dict] = Field(default_factory=list)


def _parse_fecha_pt(text: str) -> str | None:
    """'08/05/2026' → '2026-05-08'."""
    m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", text.strip())
    if not m:
        return None
    d, mo, y = m.groups()
    return f"{y}-{int(mo):02d}-{int(d):02d}"


def _parse_numero(text: str) -> str | None:
    """'Gaceta Nº 117' → '117'."""
    m = re.search(r"N[º°]\s*(\d+)", text, re.I)
    return m.group(1) if m else None


def _extract_publicaciones_from_home(soup: BeautifulSoup) -> list[dict]:
    """Procura os cards/links da home apontando pra detalle_publicacion/{id}."""
    out: list[dict] = []
    seen_ids: set[int] = set()
    for a in soup.select('a[href*="/index/detalle_publicacion/"]'):
        href = a.get("href", "")
        m = re.search(r"/detalle_publicacion/(\d+)", href)
        if not m:
            continue
        pid = int(m.group(1))
        if pid in seen_ids:
            continue
        seen_ids.add(pid)
        # Procura titulo + data próximos
        # h3 ou texto contendo "Gaceta"
        ctx = a.find_parent(["div", "li", "tr", "td"]) or a
        ctx_text = ctx.get_text(" ", strip=True)[:300]
        out.append({
            "id": pid,
            "ctx_text": ctx_text,
            "href": href if href.startswith("http") else f"https://www.gacetaoficial.gov.py{href}",
        })
    return out


def fetch() -> list[dict]:
    with make_client(timeout=30.0) as client:
        # 1. Homepage → IDs recentes
        resp = get(client, URL, headers={"User-Agent": "Mozilla/5.0 (Nanduti)"})
        soup = BeautifulSoup(resp.text, "html.parser")
        home_pubs = _extract_publicaciones_from_home(soup)
        log.info("home found %d publicaciones", len(home_pubs))

        out: list[dict] = []
        for pub in home_pubs[:8]:   # safety cap
            pid = pub["id"]
            try:
                det_resp = get(client, DETALHE_URL.format(id=pid),
                               headers={"User-Agent": "Mozilla/5.0 (Nanduti)"})
            except Exception as e:
                log.warning("detalhe %d failed: %s", pid, e)
                continue
            d_soup = BeautifulSoup(det_resp.text, "html.parser")
            # h3 com "Gaceta Nº ..."
            h3 = d_soup.find(["h3", "h2", "h1"])
            titulo = h3.get_text(strip=True) if h3 else f"Gaceta {pid}"
            numero = _parse_numero(titulo)
            # data: <small> normalmente
            small = d_soup.find("small")
            fecha = _parse_fecha_pt(small.get_text(strip=True)) if small else None
            # documentos
            docs = []
            for ad in d_soup.select('a[href*="/index/getDocumento/"]'):
                href = ad.get("href", "")
                mid = re.search(r"/getDocumento/(\d+)", href)
                if not mid:
                    continue
                docs.append({
                    "documento_id": int(mid.group(1)),
                    "titulo": ad.get_text(" ", strip=True)[:200],
                    "pdf_url": PDF_URL.format(id=mid.group(1)),
                })
            try:
                item = GacetaItem(
                    publicacion_id=pid,
                    numero=numero,
                    fecha=fecha,
                    titulo=titulo,
                    detalhe_url=pub["href"],
                    documentos=docs,
                )
            except Exception as e:
                log.warning("item validation failed for %d: %s", pid, e)
                continue
            out.append(item.model_dump())
        return out
