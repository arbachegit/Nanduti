"""ETL MEC GitHub mirror.

Fonte: github.com/mecpy/mec-opendata (organização oficial MEC)

Estratégia: GitHub REST API → lista repos da org `mecpy`, e pra cada repo
pega metadata (default_branch, pushed_at) + tree de arquivos. Persiste
em nanduti.raw_github_mirror (tabela genérica criada na migration 0003).

NÃO clona conteúdo dos arquivos — só metadata + paths. Conteúdo individual
fica como TODO; útil quando o app precisar consumir CSVs específicos.

Idempotente por sha256 do payload (repo + commit_sha + tree).

Uso:
    python -m mec_github.run
    DRY_RUN=1 python -m mec_github.run
"""
from __future__ import annotations
import os
import sys
import logging

from _lib.http import make_client, get, is_dry_run
from _lib.idempotency import sha256_payload
from _lib.supabase_client import (
    server_client,
    fonte_id_por_nome,
    upsert_raw,
    registrar_coleta,
)

log = logging.getLogger("mec_github")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

ORG = "mecpy"
FONTE_NOME = "mec_github"
RAW_TABLE = "raw_github_mirror"
GH_API = "https://api.github.com"


def _gh_headers() -> dict[str, str]:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def fetch() -> list[dict]:
    out: list[dict] = []
    with make_client(timeout=30.0) as client:
        repos_resp = get(
            client, f"{GH_API}/users/{ORG}/repos", params={"per_page": 50}
        )
        for r in (repos_resp.headers.get("link") and []) or repos_resp.json():
            pass  # placeholder pra paginação futura
        repos = repos_resp.json()
        if not isinstance(repos, list):
            raise RuntimeError(f"github_unexpected_response: {repos}")

        for r in repos:
            full_name = r.get("full_name")
            default_branch = r.get("default_branch") or "main"
            pushed_at = r.get("pushed_at")
            try:
                tree_resp = get(
                    client,
                    f"{GH_API}/repos/{full_name}/git/trees/{default_branch}",
                    params={"recursive": "1"},
                )
                tree = tree_resp.json()
            except Exception:
                tree = {"tree": []}

            # Nota: captured_at NÃO entra no payload (sha256 mudaria a cada
            # run e quebra idempotência). Usar collected_at do row.
            payload = {
                "fonte_nome": FONTE_NOME,
                "org": ORG,
                "name": r.get("name"),
                "full_name": full_name,
                "html_url": r.get("html_url"),
                "default_branch": default_branch,
                "pushed_at": pushed_at,
                "stargazers_count": r.get("stargazers_count"),
                "description": r.get("description"),
                "tree_sha": tree.get("sha"),
                "tree_truncated": tree.get("truncated", False),
                "files": [
                    {"path": x.get("path"), "size": x.get("size"), "type": x.get("type")}
                    for x in (tree.get("tree") or [])
                ][:200],
            }
            out.append(payload)
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

    log.info("fetched repos=%d", len(items))

    if dry:
        for it in items[:3]:
            log.info("repo: %s files=%d updated=%s",
                     it["full_name"], len(it["files"]), it["pushed_at"])
        return 0

    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos = dups = 0
    for item in items:
        sha = sha256_payload(item)
        result = upsert_raw(sb, RAW_TABLE, item.get("html_url", ""), item, sha)
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
