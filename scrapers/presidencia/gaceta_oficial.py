"""Gaceta Oficial — TODO.

Fonte: https://www.gacetaoficial.gov.py/

Status atual (2026-05-10): site é SPA jQuery, homepage vazia (~16KB),
dados carregados via AJAX (`/index/buscarContenido` POST). Precisa
inspeção de DevTools pra mapear endpoint real.

Próximos passos:
1. Capturar request AJAX da página de busca por categoria
2. Reproduzir POST com payload mínimo
3. Parsear lista de gacetas (data, número, link PDF)

Por enquanto retorna lista vazia — o orquestrador registra coleta como
'partial' sem quebrar o pipeline.
"""
from __future__ import annotations

FONTE_NOME = "gaceta_oficial"


def fetch() -> list[dict]:
    # TODO(onda 1+): mapear endpoint AJAX e implementar
    return []
