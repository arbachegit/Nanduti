"""Decretos Presidencia — TODO.

Fonte: https://decretos.presidencia.gov.py/

Status atual (2026-05-10): site indisponível em timeout 60s a partir do
nosso edge. Possíveis causas: firewall geo-bloqueando IPs externos,
manutenção, ou rate-limit institucional.

Próximos passos quando disponível:
1. Testar via GitHub Actions runner (IPs Azure/US) — pode passar firewall
2. Inspecionar HTML / endpoint AJAX
3. Identificar lista de decretos (numero, data, oee, link PDF)

Por enquanto retorna lista vazia — o orquestrador registra a coleta como
'partial' sem quebrar o pipeline.
"""
from __future__ import annotations

FONTE_NOME = "decretos_presidencia"


def fetch() -> list[dict]:
    # TODO(onda 1+): implementar quando o site responder
    return []
