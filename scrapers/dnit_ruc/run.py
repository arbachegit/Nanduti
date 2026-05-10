"""ETL DNIT consultaRUC — dados cadastrais de empresas paraguayas.

Fonte: API DNIT/SET — consulta RUC (Registro Único do Contribuinte).
URL canônica: https://www.set.gov.py/portal/PARAGUAY-SET/Servicios+Online/Consulta+RUC

Endpoint REST consumido (proxy oficial DNIT):
    GET https://servicios.set.gov.py/eset-publico/consultaRUCServlet?ruc=<RUC>

Auth: apiKey via header `apikey: $DNIT_API_KEY` (variável obrigatória em
prod; em dev/dry-run não é exigida).

Estratégia:
1. Lê lista de RUCs do env `DNIT_RUC_LIST` (CSV: "80012345-1,80098765-2").
   Em ausência dela, usa um seed mínimo voltado a saúde/educação.
2. Pra cada RUC, faz 1 GET (rate-limit 1 req/s) + retry exponencial.
3. Persiste payload em `nanduti.raw_dnit_ruc`.

Idempotência: SHA256 do payload normalizado (sem timestamps).

Rate-limit: 1 req/s (sleep entre chamadas). DNIT não documenta limite
público — adotamos política conservadora.

Uso:
    python -m dnit_ruc.run
    DRY_RUN=1 python -m dnit_ruc.run
    DNIT_RUC_LIST="80012345-1,80098765-2" python -m dnit_ruc.run
"""
from __future__ import annotations
import os
import sys
import time
import logging

import httpx

from _lib.http import make_client, is_dry_run, USER_AGENT
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

log = logging.getLogger("dnit_ruc")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

FONTE_NOME = "dnit_ruc"
RAW_TABLE = "raw_dnit_ruc"
ENDPOINT = "https://servicios.set.gov.py/eset-publico/consultaRUCServlet"

# Seed mínimo: alguns RUCs públicos de instituições paraguayas (governo,
# educação, saúde) usados como smoke-test. Lista real vem de
# DNIT_RUC_LIST em produção, alimentada por descobertas do scraper DNCP.
DEFAULT_RUCS = [
    "80017557-9",  # MEC — Ministerio de Educación y Ciencias
    "80017551-0",  # MSPBS — Ministerio de Salud Pública y Bienestar Social
    "80018652-0",  # MITIC
]


def _ruc_list() -> list[str]:
    raw = os.environ.get("DNIT_RUC_LIST", "").strip()
    if not raw:
        return DEFAULT_RUCS
    return [x.strip() for x in raw.split(",") if x.strip()]


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=20),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    reraise=True,
)
def _consulta(client: httpx.Client, ruc: str, api_key: str | None) -> dict:
    headers = {"User-Agent": USER_AGENT}
    if api_key:
        headers["apikey"] = api_key
    resp = client.get(ENDPOINT, params={"ruc": ruc}, headers=headers)
    resp.raise_for_status()
    # Endpoint retorna JSON ou HTML conforme RUC. Tratamos ambos.
    ct = resp.headers.get("content-type", "")
    if "json" in ct.lower():
        return resp.json()
    return {"raw_html": resp.text[:5000], "content_type": ct}


def fetch() -> list[dict]:
    api_key = os.environ.get("DNIT_API_KEY", "").strip() or None
    out: list[dict] = []
    rucs = _ruc_list()
    log.info("rucs_to_query=%d api_key_present=%s", len(rucs), bool(api_key))

    with make_client(timeout=30.0) as client:
        for i, ruc in enumerate(rucs):
            try:
                body = _consulta(client, ruc, api_key)
            except Exception as e:
                log.warning("skip ruc=%s err=%s", ruc, e)
                out.append({
                    "fonte_nome": FONTE_NOME,
                    "ruc": ruc,
                    "error": str(e)[:300],
                    "url": f"{ENDPOINT}?ruc={ruc}",
                })
                continue
            payload = {
                "fonte_nome": FONTE_NOME,
                "ruc": ruc,
                "response": body,
                "url": f"{ENDPOINT}?ruc={ruc}",
            }
            out.append(payload)
            # rate-limit 1 req/s — exceto último.
            if i < len(rucs) - 1:
                time.sleep(1.0)
    return out


def run() -> int:
    dry = is_dry_run()
    sb = None if dry else server_client()
    log.info("starting (dry=%s)", dry)

    try:
        items = fetch()
    except Exception as e:
        log.exception("fetch_failed")
        if not dry and sb:
            fid = fonte_id_por_nome(sb, FONTE_NOME)
            if fid:
                registrar_coleta(sb, fid, "error", 0, 0, 0, erro=str(e)[:500])
        return 1

    log.info("fetched ruc_payloads=%d", len(items))

    if dry:
        for it in items[:3]:
            preview = it.get("response") or it.get("error")
            log.info("ruc=%s :: %s", it["ruc"], str(preview)[:200])
        return 0

    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos = dups = 0
    for item in items:
        sha = sha256_payload(item)
        result = upsert_raw(sb, RAW_TABLE, item["url"], item, sha)
        if result.get("inserted", 0) > 0:
            novos += 1
        else:
            dups += 1

    log.info("persisted novos=%d dups=%d", novos, dups)
    fid = fonte_id_por_nome(sb, FONTE_NOME)
    if fid:
        registrar_coleta(sb, fid, "ok" if items else "partial",
                         len(items), novos, dups)
    return 0


if __name__ == "__main__":
    sys.exit(run())
