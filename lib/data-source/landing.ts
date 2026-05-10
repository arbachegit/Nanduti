/**
 * Data-source: landing showcase.
 *
 * Server-side fetcher que busca dados REAIS do Supabase pra popular as
 * slides da landing. Sem isso, os mockups são genéricos. Com isso,
 * cada card mostra um item real: artigo da Agencia IP, alerta DINAC,
 * cotação BCP, dataset MEC.
 *
 * Falla silenciosamente se Supabase ausente — caller usa fallbacks.
 */
import { serverClient } from '@/lib/supabase';

export interface FeedItem {
  titulo: string;
  url_oficial: string;
  publicado_em: string;
  oee: string;
  resumo?: string | null;
  categoria?: string | null;
}

export interface AlertItem {
  titulo: string;
  descricao: string | null;
  severity: 'info' | 'watch' | 'severe' | 'extreme';
  categoria: string;
  fonte: string;
  geo_dpto: string | null;
  ts_evento: string;
}

export interface CotacaoItem {
  moeda_codigo: string;
  moeda_nome: string;
  valor_pyg: number;
  fecha_planilla: string;
}

export interface DatasetItem {
  slug: string;
  titulo: string;
  dominio: string;
  url_oficial: string;
}

export interface LandingData {
  feed: FeedItem[];
  alerts: AlertItem[];
  cotacoes: CotacaoItem[];
  datasets: DatasetItem[];
  totals: {
    feed_rows: number;
    alerts_rows: number;
    bcp_rows: number;
    dncp_rows: number;
    coletas_rows: number;
  };
  collected_at: string;
}

const EMPTY: LandingData = {
  feed: [], alerts: [], cotacoes: [], datasets: [],
  totals: { feed_rows: 0, alerts_rows: 0, bcp_rows: 0, dncp_rows: 0, coletas_rows: 0 },
  collected_at: new Date().toISOString(),
};

export async function getLandingShowcase(): Promise<LandingData> {
  const sb = serverClient();
  if (!sb) return EMPTY;

  try {
    const [feed, alerts, cotacoes, datasets, feedCount, alertCount, bcpCount, dncpCount, coletas] = await Promise.all([
      sb.from('v_feed_estado').select('titulo,url_oficial,publicado_em,oee,resumo,categoria').order('publicado_em', { ascending: false }).limit(8),
      sb.from('v_alerta').select('titulo,descricao,severity,categoria,fonte,geo_dpto,ts_evento').order('ts_evento', { ascending: false }).limit(8),
      sb.from('v_cotacao_atual').select('moeda_codigo,moeda_nome,valor_pyg,fecha_planilla').in('moeda_codigo', ['USD', 'EUR', 'BRL', 'ARS']),
      sb.from('v_dataset_catalog').select('slug,titulo,dominio,url_oficial').limit(8),
      sb.from('raw_presidencia_feed').select('id', { count: 'exact', head: true }),
      sb.from('v_alerta').select('id', { count: 'exact', head: true }),
      sb.from('raw_bcp_cotacao').select('id', { count: 'exact', head: true }),
      sb.from('raw_dncp_contratos').select('id', { count: 'exact', head: true }),
      sb.from('fontes_dados_coletas').select('id', { count: 'exact', head: true }),
    ]);

    return {
      feed: (feed.data ?? []) as FeedItem[],
      alerts: (alerts.data ?? []) as AlertItem[],
      cotacoes: (cotacoes.data ?? []) as CotacaoItem[],
      datasets: (datasets.data ?? []) as DatasetItem[],
      totals: {
        feed_rows: feedCount.count ?? 0,
        alerts_rows: alertCount.count ?? 0,
        bcp_rows: bcpCount.count ?? 0,
        dncp_rows: dncpCount.count ?? 0,
        coletas_rows: coletas.count ?? 0,
      },
      collected_at: new Date().toISOString(),
    };
  } catch (e) {
    console.error('[landing data] fetch failed:', e);
    return EMPTY;
  }
}
