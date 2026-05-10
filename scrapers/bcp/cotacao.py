"""BCP — cotações diárias de moedas vs guaraní (PYG).

Fonte: https://www.bcp.gov.py/webapps/web/cotizacion/monedas

Estrutura HTML:
- 1 <table> com header "PLANILLA DE COTIZACIONES AL [DIA] DE [MES] DEL [ANO]"
- 30 rows de moedas com 4 colunas: [nome, codigo, unidade, valor_pyg]
- Ex: ['DÓLAR ESTADOUNIDENSE', 'USD', '1,0000', '6.159,41']
- Semântica: <unidade> da moeda = <valor_pyg> guaraníes

Cron 1h. O BCP atualiza 1×/dia útil (sexta-feira mantém cotação até segunda),
mas roda de hora em hora pra capturar a atualização imediatamente quando sair.
"""
from __future__ import annotations
import re
from bs4 import BeautifulSoup
from pydantic import BaseModel

from _lib.http import make_client, get

URL = "https://www.bcp.gov.py/webapps/web/cotizacion/monedas"
FONTE_NOME = "bcp_cotacao_diaria"

MONTH_PT_TO_NUM = {
    "ENERO": 1, "FEBRERO": 2, "MARZO": 3, "ABRIL": 4, "MAYO": 5, "JUNIO": 6,
    "JULIO": 7, "AGOSTO": 8, "SEPTIEMBRE": 9, "OCTUBRE": 10, "NOVIEMBRE": 11, "DICIEMBRE": 12,
}


class Cotacao(BaseModel):
    fonte_nome: str = FONTE_NOME
    moeda_nome: str
    moeda_codigo: str
    unidade: float
    valor_pyg: float
    fecha_planilla: str   # ISO date YYYY-MM-DD
    # Nota: collected_at fica em raw.collected_at (row metadata), NUNCA no
    # payload — senão sha256 muda a cada run e idempotência quebra.


def _parse_pt_number(s: str) -> float:
    """'6.159,41' -> 6159.41. '1,0000' -> 1.0."""
    return float(s.replace(".", "").replace(",", "."))


def _parse_planilla_date(header: str) -> str | None:
    """'PLANILLA DE COTIZACIONES AL VIERNES 08 DE MAYO DEL 2026' -> '2026-05-08'."""
    m = re.search(r"(\d{1,2})\s+DE\s+([A-ZÁÉÍÓÚÑ]+)\s+DEL?\s+(\d{4})", header.upper())
    if not m:
        return None
    day, month_name, year = m.group(1), m.group(2), m.group(3)
    month = MONTH_PT_TO_NUM.get(month_name)
    if not month:
        return None
    return f"{year}-{month:02d}-{int(day):02d}"


def fetch() -> list[dict]:
    with make_client(timeout=30.0) as client:
        resp = get(client, URL)
    soup = BeautifulSoup(resp.text, "html.parser")
    tables = soup.find_all("table")
    if not tables:
        raise RuntimeError("bcp: nenhuma tabela encontrada")

    table = tables[0]
    rows = table.find_all("tr")
    if not rows:
        raise RuntimeError("bcp: tabela vazia")

    header_text = rows[0].get_text(" ", strip=True)
    fecha = _parse_planilla_date(header_text)
    if not fecha:
        raise RuntimeError(f"bcp: nao consegui parsear data: {header_text!r}")

    out: list[dict] = []
    for r in rows[1:]:
        cells = [td.get_text(strip=True) for td in r.find_all("td")]
        if len(cells) != 4:
            continue
        nome, codigo, unidade_s, valor_s = cells
        if not codigo or len(codigo) != 3:
            continue
        try:
            cot = Cotacao(
                moeda_nome=nome,
                moeda_codigo=codigo.upper(),
                unidade=_parse_pt_number(unidade_s),
                valor_pyg=_parse_pt_number(valor_s),
                fecha_planilla=fecha,
            )
        except Exception:
            continue
        out.append(cot.model_dump())
    return out
