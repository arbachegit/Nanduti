/**
 * Data-source: wallet (cotação BCP USD/PYG real).
 *
 * Lê de `nanduti.v_cotacao_atual` — distinct on moeda_codigo, mais
 * recente. Usado por wallet.balance e crypto.balance pra conversão.
 */
import { serverClient } from '@/lib/supabase';

export interface CotacaoAtual {
  moeda_codigo: string;
  moeda_nome: string;
  unidade: number;
  valor_pyg: number;
  fecha_planilla: string;
  collected_at: string;
}

export async function getCotacao(moeda: string): Promise<CotacaoAtual | null> {
  const sb = serverClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('v_cotacao_atual')
    .select('moeda_codigo,moeda_nome,unidade,valor_pyg,fecha_planilla,collected_at')
    .eq('moeda_codigo', moeda.toUpperCase())
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;  // not found
    console.error('[data-source/wallet] getCotacao error', error);
    return null;
  }
  return data as CotacaoAtual;
}

export async function listCotacoes(moedas?: string[]): Promise<CotacaoAtual[] | null> {
  const sb = serverClient();
  if (!sb) return null;

  let q = sb
    .from('v_cotacao_atual')
    .select('moeda_codigo,moeda_nome,unidade,valor_pyg,fecha_planilla,collected_at');

  if (moedas && moedas.length > 0) {
    q = q.in('moeda_codigo', moedas.map((m) => m.toUpperCase()));
  }

  const { data, error } = await q;
  if (error) {
    console.error('[data-source/wallet] listCotacoes error', error);
    return null;
  }
  return (data ?? []) as CotacaoAtual[];
}

/** Conversão USDC (1:1 USD) → PYG usando última cotação real. */
export async function usdcToPyg(usdc: number): Promise<{ pyg: number; rate: number; fecha: string } | null> {
  const cot = await getCotacao('USD');
  if (!cot) return null;
  return {
    pyg: Math.round((usdc / cot.unidade) * cot.valor_pyg),
    rate: cot.valor_pyg / cot.unidade,
    fecha: cot.fecha_planilla,
  };
}
