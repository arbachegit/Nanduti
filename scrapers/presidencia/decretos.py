"""Decretos Presidência — implementação real com fallback graceful.

Fonte: https://decretos.presidencia.gov.py/

Status do meu IP local (BR): geo-bloqueado em nível TCP — IP `201.217.52.222`
(Tigo PY) recusa SYN. Mas runners do GitHub Actions ficam em datacenters
Azure US — pode passar o firewall.

API descoberta via agente de pesquisa (extraída do bundle Angular):
- GET /api/norma/list             → lista todas normas
- GET /api/norma/getById/{id}     → detalhe (Mongo ObjectId 24 hex)
- GET /api/norma/download/{id}    → PDF
- GET /api/oee/list               → órgãos públicos
- GET /api/etiqueta/list          → tags

Estratégia: tentar /api/norma/list. Se falhar (timeout/connection refused),
retornar [] sem quebrar — Gaceta Oficial cobre 100% dos decretos via PDF.
"""
from __future__ import annotations
import logging
from pydantic import BaseModel, Field

from _lib.http import make_client, get

log = logging.getLogger("decretos")

API_BASE = "https://decretos.presidencia.gov.py"
LIST_URL = f"{API_BASE}/api/norma/list"
FONTE_NOME = "decretos_presidencia"


class DecretoItem(BaseModel):
    fonte_nome: str = FONTE_NOME
    norma_id: str               # Mongo ObjectId
    numero: str | None = None
    fecha: str | None = None
    titulo: str | None = None
    oee: str | None = None
    tipo_documento: str | None = None
    pdf_url: str | None = None
    raw: dict = Field(default_factory=dict)


def fetch() -> list[dict]:
    try:
        with make_client(timeout=45.0) as client:
            resp = get(client, LIST_URL, headers={
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Nanduti/1.0)",
            })
            normas = resp.json()
    except Exception as e:
        log.warning("decretos fetch failed (geo-block esperado em IPs não-PY): %s",
                    str(e)[:200])
        return []

    if not isinstance(normas, list):
        log.warning("response unexpected shape: %s", type(normas).__name__)
        return []

    out: list[dict] = []
    for n in normas[:200]:  # safety cap pro primeiro fetch grande
        nid = n.get("_id") or n.get("id")
        if not nid:
            continue
        try:
            item = DecretoItem(
                norma_id=str(nid),
                numero=n.get("numero"),
                fecha=n.get("fecha"),
                titulo=n.get("nombre") or n.get("descripcion"),
                oee=(n.get("oee") or {}).get("nombre") if isinstance(n.get("oee"), dict) else n.get("oee"),
                tipo_documento=(n.get("tipoDocumento") or {}).get("nombre") if isinstance(n.get("tipoDocumento"), dict) else None,
                pdf_url=f"{API_BASE}/api/norma/download/{nid}",
                raw=n,
            )
        except Exception:
            continue
        out.append(item.model_dump())
    log.info("fetched %d decretos", len(out))
    return out
