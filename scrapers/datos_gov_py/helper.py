"""Helper para datos.gov.py (DKAN com fachada CKAN parcial).

API funcional:
- package_list (JSON)
- package_show?id=<slug> (JSON)

API NÃO funcional:
- package_search (retorna HTML — DKAN antigo não respeita Accept)
- organization_show (retorna HTML)

Strategy: descoberta via package_list + filtro Python; metadata via
package_show. Resources com format=html são salvos como ponteiros (TODO
parsear conteúdo). Resources com format=csv/json são baixados e parseados
em iterações futuras.
"""
from __future__ import annotations
from typing import Any
import httpx

from _lib.http import make_client, get

BASE_URL = "https://www.datos.gov.py/api/3/action"


def package_list(client: httpx.Client, limit: int = 500) -> list[str]:
    """Retorna slugs de todos os datasets."""
    resp = get(client, f"{BASE_URL}/package_list", params={"limit": limit})
    j = resp.json()
    if not j.get("success"):
        raise RuntimeError(f"package_list failed: {j}")
    return j.get("result", [])


def package_show(client: httpx.Client, slug: str) -> dict[str, Any]:
    """Retorna metadata + resources de um dataset."""
    resp = get(client, f"{BASE_URL}/package_show", params={"id": slug})
    j = resp.json()
    if not j.get("success"):
        raise RuntimeError(f"package_show failed for {slug}: {j}")
    res = j.get("result")
    if isinstance(res, list):
        res = res[0] if res else {}
    return res or {}


def filter_slugs(all_slugs: list[str], keywords: list[str]) -> list[str]:
    """Filtra slugs que contenham qualquer keyword (case-insensitive)."""
    kws = [k.lower() for k in keywords]
    return [s for s in all_slugs if any(k in s.lower() for k in kws)]


def normalize_dataset(meta: dict[str, Any], domain: str) -> dict[str, Any]:
    """Reduz metadata a um shape canônico estável (pra sha256).

    `domain` é uma tag (ex.: 'mec', 'mspbs') usada pra rotear o raw_table.
    """
    return {
        "domain": domain,
        "slug": meta.get("name"),
        "title": (meta.get("title") or "").strip(),
        "author": meta.get("author"),
        "author_email": meta.get("author_email"),
        "metadata_modified": meta.get("metadata_modified"),
        "url": meta.get("url"),
        "resources": [
            {
                "id": r.get("id"),
                "format": (r.get("format") or "").lower(),
                "url": r.get("url"),
                "name": r.get("name"),
                "description": (r.get("description") or "")[:1000],
            }
            for r in (meta.get("resources") or [])
        ],
        "tags": [t.get("name") for t in (meta.get("tags") or []) if t.get("name")],
    }
