"""SHA256 normalizado para idempotência de payloads JSON."""
import hashlib
import json
from typing import Any


def sha256_payload(payload: Any) -> str:
    """SHA256 hex do payload com JSON canonical (sort_keys + sem whitespace)."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()
