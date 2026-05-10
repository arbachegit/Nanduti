"""Cliente Supabase service-role + helpers idempotentes."""
import os
from typing import Any
from supabase import create_client, Client


def server_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE"]
    return create_client(url, key)


def upsert_raw(client: Client, table: str, source_url: str, payload: dict, sha256: str) -> dict:
    """INSERT em nanduti.raw_*; conflito em sha256 = no-op (já visto)."""
    full = f"nanduti.{table}" if not table.startswith("nanduti.") else table
    schema, name = full.split(".", 1)
    res = (
        client.schema(schema)
        .table(name)
        .upsert(
            {"source_url": source_url, "payload": payload, "sha256": sha256},
            on_conflict="sha256",
            ignore_duplicates=True,
        )
        .execute()
    )
    return {"inserted": len(res.data or []), "raw": res.data}


def fonte_id_por_nome(client: Client, nome: str) -> str | None:
    res = (
        client.schema("nanduti")
        .table("fontes_dados")
        .select("id")
        .eq("nome", nome)
        .limit(1)
        .execute()
    )
    return (res.data or [{}])[0].get("id")


def registrar_coleta(
    client: Client,
    fonte_id: str,
    status: str,
    raw_count: int,
    novos: int,
    duplicados: int,
    sha256_lote: str | None = None,
    erro: str | None = None,
) -> None:
    client.schema("nanduti").table("fontes_dados_coletas").insert(
        {
            "fonte_id": fonte_id,
            "status": status,
            "raw_count": raw_count,
            "novos": novos,
            "duplicados": duplicados,
            "sha256_lote": sha256_lote,
            "erro": erro,
        }
    ).execute()
