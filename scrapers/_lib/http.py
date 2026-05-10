"""Cliente HTTP padrão para scrapers Ñandutí.

User-Agent identificado, timeouts duros, retry exponencial via tenacity.
"""
import os
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

USER_AGENT = "Nanduti/1.0 (+https://nanduti.iconsai.ai; contato@iconsai.ai)"


def make_client(timeout: float = 30.0) -> httpx.Client:
    return httpx.Client(
        timeout=timeout,
        follow_redirects=True,
        headers={"User-Agent": USER_AGENT, "Accept-Language": "es-PY,es;q=0.9"},
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=20),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    reraise=True,
)
def get(client: httpx.Client, url: str, **kwargs) -> httpx.Response:
    resp = client.get(url, **kwargs)
    resp.raise_for_status()
    return resp


def is_dry_run() -> bool:
    return os.environ.get("DRY_RUN", "").lower() in ("1", "true", "yes")
