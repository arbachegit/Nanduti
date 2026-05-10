"""Backfill — baixa CSVs reais do datos.gov.py + populi linha-por-linha.

Pula o catalog (metadata) e vai pro CONTEÚDO: peritos, traductores,
abogados, padrón electoral, candidatos, etc. Cada linha do CSV vira
um row em nanduti.raw_paraguay_gov.

Idempotente via sha256(slug + row_data).
"""
from __future__ import annotations
import os
import sys
import csv
import io
import time
import logging
from typing import Any

from _lib.http import make_client, get
from _lib.idempotency import sha256_payload
from _lib.supabase_client import server_client, fonte_id_por_nome, registrar_coleta

log = logging.getLogger("datos_csvs")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

API_BASE = "https://www.datos.gov.py/api/3/action"
FONTE_NOME = "paraguay_gov_oees"
RAW_TABLE = "raw_paraguay_gov"
BATCH_SIZE = 500            # rows per supabase upsert call
MAX_ROWS_PER_DATASET = 200_000  # lifted — full datasets

# Priority datasets (slug → expected volume hint)
PRIORITY_SLUGS = [
    "instituciones-del-portal-unico-de-gobierno-2025",
    "peritos",
    "traductores",
    "escribanos",
    "abogados",
    "rematadores",
    "procuradores",
    "defensores-públicos",
    "magistrados",
    "facilitadores",
    "candidatos-1998-2023",
    "candidatos-electos-en-las-elecciones-generales-1998-2018",
    "convocatorias-licitaciones-del-estado",
    "instituciones-adheridas-al-portal-de-acceso-la-información-pública",
    "instituciones-del-portal-de-gobernaciones-y-municipios-2025",
    "establecimientos-escolares",  # may be html, will skip if so
    "directorio-de-instituciones",
    "fonacide-establecimientos-sin-datos-en-el-mec-de-la-ejecución-de-obras",
    "servicios-básicos-de-los-establecimientos-según-fonacide",
    "datos-específicos-de-instituciones-educativas",
    "nómina-de-instituciones-educativas-de-capital-beneficiadas-con-el-programa-de-alimentación",
    "datos-estadísticos-de-padrón-1996-2023-de-paraguayos-y-extranjeros-padrón-participación-y",
    "boletín-técnico-trimestral-n°-5-al-8-registro-de-inscripciones-de-establecimientos-y-puestos",
]


def package_show(client, slug: str) -> dict[str, Any]:
    resp = get(client, f"{API_BASE}/package_show", params={"id": slug})
    j = resp.json()
    if not j.get("success"):
        return {}
    r = j.get("result")
    if isinstance(r, list):
        r = r[0] if r else {}
    return r or {}


def pick_csv_resource(meta: dict) -> str | None:
    """Find best CSV (or fallback) resource URL."""
    resources = meta.get("resources") or []
    for fmt_pref in ("csv", "json"):
        for r in resources:
            if (r.get("format") or "").lower() == fmt_pref:
                url = r.get("url")
                if url and url.startswith("http"):
                    return url
    return None


def parse_csv(text: str) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    # Try common delimiters
    sniffer = csv.Sniffer()
    try:
        dialect = sniffer.sniff(text[:4096], delimiters=",;\t|")
    except Exception:
        dialect = csv.excel
    reader = csv.DictReader(io.StringIO(text), dialect=dialect)
    for i, row in enumerate(reader):
        if i >= MAX_ROWS_PER_DATASET:
            break
        # Strip whitespace from keys and values
        clean = {(k or "").strip(): (v or "").strip() if isinstance(v, str) else v for k, v in row.items()}
        if not clean or all(not v for v in clean.values()):
            continue
        out.append(clean)
    return out


def main() -> int:
    sb = server_client()
    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos_total = dups_total = 0
    datasets_processed = 0
    datasets_with_csv = 0
    rows_seen_total = 0

    with make_client(timeout=60.0) as client:
        for slug in PRIORITY_SLUGS:
            log.info("→ %s", slug)
            try:
                meta = package_show(client, slug)
            except Exception as e:
                log.warning("  package_show failed: %s", e)
                continue

            datasets_processed += 1
            if not meta:
                continue

            csv_url = pick_csv_resource(meta)
            if not csv_url:
                log.info("  no CSV resource, skipping")
                continue

            log.info("  downloading %s", csv_url)
            try:
                resp = get(client, csv_url)
            except Exception as e:
                log.warning("  download failed: %s", e)
                continue

            # Detect encoding
            text = resp.text
            try:
                rows = parse_csv(text)
            except Exception as e:
                log.warning("  parse failed: %s", e)
                continue

            datasets_with_csv += 1
            rows_seen_total += len(rows)
            log.info("  parsed %d rows", len(rows))

            # Batch upsert
            batch: list[dict] = []
            slug_id = slug[:80]
            for idx, row in enumerate(rows):
                payload = {
                    "fonte_nome": "datos_gov_py_csv_row",
                    "slug": slug_id,
                    "row_idx": idx,
                    "row": row,
                }
                sha = sha256_payload({"slug": slug_id, "row_idx": idx, "row": row})
                batch.append({
                    "source_url": csv_url,
                    "payload": payload,
                    "sha256": sha,
                })

                if len(batch) >= BATCH_SIZE:
                    n, d = _flush(sb, batch)
                    novos_total += n; dups_total += d
                    batch = []

            if batch:
                n, d = _flush(sb, batch)
                novos_total += n; dups_total += d

            time.sleep(0.5)  # be polite

    log.info("=== DATOS.GOV.PY BACKFILL DONE ===")
    log.info("datasets_processed=%d datasets_with_csv=%d", datasets_processed, datasets_with_csv)
    log.info("rows_seen=%d novos=%d dups=%d", rows_seen_total, novos_total, dups_total)

    fid = fonte_id_por_nome(sb, FONTE_NOME)
    if fid:
        registrar_coleta(sb, fid, "ok" if novos_total + dups_total > 0 else "partial",
                         rows_seen_total, novos_total, dups_total)
    return 0


def _flush(sb, batch: list[dict]) -> tuple[int, int]:
    """Bulk upsert batch. Returns (novos, dups)."""
    try:
        res = sb.schema("nanduti").table(RAW_TABLE).upsert(
            batch, on_conflict="sha256", ignore_duplicates=True
        ).execute()
        inserted = len(res.data or [])
        return inserted, len(batch) - inserted
    except Exception as e:
        log.warning("  flush err: %s", str(e)[:200])
        return 0, 0


if __name__ == "__main__":
    sys.exit(main())
