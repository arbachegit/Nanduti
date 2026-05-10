"""ETL MEC GitHub — download de conteúdo de arquivos (CSV/JSON).

Complementa `mec_github.run` (que só guarda metadata): este baixa o
conteúdo bruto de arquivos CSV/JSON dos repos da org `mecpy`.

Estratégia:
1. Lista repos via GitHub API.
2. Pra cada repo, lê o tree do default_branch (recursive).
3. Filtra arquivos por extensão (.csv, .json, .geojson) e tamanho
   máximo (`MAX_FILE_BYTES`, default 5 MB).
4. Baixa via download_url (raw.githubusercontent.com).
5. Persiste payload {repo, path, content, sha} em
   `nanduti.raw_github_mirror`. Idempotente por SHA256.

Conteúdo binário (xlsx, pdf) é IGNORADO — fica como TODO. Esta camada é
focada em dados estruturados (CSV/JSON).

Uso:
    python -m mec_github.run_content
    DRY_RUN=1 python -m mec_github.run_content
    MEC_GITHUB_REPO_LIMIT=3 python -m mec_github.run_content
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

log = logging.getLogger("mec_github.content")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

ORG = "mecpy"
FONTE_NOME = "mec_github"
RAW_TABLE = "raw_github_mirror"
GH_API = "https://api.github.com"

ALLOWED_EXTS = (".csv", ".json", ".geojson", ".tsv")
MAX_FILE_BYTES = int(os.environ.get("MEC_GITHUB_MAX_BYTES", str(5 * 1024 * 1024)))
MAX_TEXT_CHARS = int(os.environ.get("MEC_GITHUB_MAX_CHARS", "200000"))
REPO_LIMIT = int(os.environ.get("MEC_GITHUB_REPO_LIMIT", "10"))
FILES_PER_REPO = int(os.environ.get("MEC_GITHUB_FILES_PER_REPO", "20"))


def _gh_headers() -> dict[str, str]:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def _allowed(path: str, size: int | None) -> bool:
    if not path:
        return False
    p = path.lower()
    if not p.endswith(ALLOWED_EXTS):
        return False
    if size is not None and size > MAX_FILE_BYTES:
        return False
    return True


def fetch() -> list[dict]:
    out: list[dict] = []
    headers = _gh_headers()
    with make_client(timeout=60.0) as client:
        repos_resp = get(
            client, f"{GH_API}/users/{ORG}/repos",
            params={"per_page": REPO_LIMIT}, headers=headers,
        )
        repos = repos_resp.json()
        if not isinstance(repos, list):
            raise RuntimeError(f"github_unexpected_response: {repos}")

        for r in repos[:REPO_LIMIT]:
            full_name = r.get("full_name")
            default_branch = r.get("default_branch") or "main"
            try:
                tree_resp = get(
                    client,
                    f"{GH_API}/repos/{full_name}/git/trees/{default_branch}",
                    params={"recursive": "1"}, headers=headers,
                )
                tree = tree_resp.json()
            except Exception as e:
                log.warning("skip_tree repo=%s err=%s", full_name, e)
                continue

            files = [
                f for f in (tree.get("tree") or [])
                if f.get("type") == "blob" and _allowed(f.get("path"), f.get("size"))
            ][:FILES_PER_REPO]

            for f in files:
                path = f["path"]
                raw_url = f"https://raw.githubusercontent.com/{full_name}/{default_branch}/{path}"
                try:
                    body = get(client, raw_url)
                except Exception as e:
                    log.warning("skip_file repo=%s path=%s err=%s", full_name, path, e)
                    continue
                text = body.text[:MAX_TEXT_CHARS]
                truncated = len(body.text) > MAX_TEXT_CHARS

                payload = {
                    "fonte_nome": FONTE_NOME,
                    "kind": "file_content",
                    "repo": full_name,
                    "branch": default_branch,
                    "path": path,
                    "blob_sha": f.get("sha"),
                    "size": f.get("size"),
                    "content": text,
                    "content_truncated": truncated,
                    "raw_url": raw_url,
                }
                out.append(payload)
    return out


def run() -> int:
    dry = is_dry_run()
    sb = None if dry else server_client()
    log.info("starting (dry=%s repo_limit=%d)", dry, REPO_LIMIT)

    try:
        items = fetch()
    except Exception as e:
        log.exception("fetch_failed")
        if not dry and sb:
            fid = fonte_id_por_nome(sb, FONTE_NOME)
            if fid:
                registrar_coleta(sb, fid, "error", 0, 0, 0, erro=str(e)[:500])
        return 1

    log.info("downloaded files=%d", len(items))

    if dry:
        for it in items[:3]:
            log.info("file: %s/%s size=%s truncated=%s",
                     it["repo"], it["path"], it.get("size"),
                     it["content_truncated"])
        return 0

    if not sb:
        log.error("supabase client unavailable")
        return 1

    novos = dups = 0
    for item in items:
        sha = sha256_payload(item)
        result = upsert_raw(sb, RAW_TABLE, item["raw_url"], item, sha)
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
