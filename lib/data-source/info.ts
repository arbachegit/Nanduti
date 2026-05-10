/**
 * Data-source: info (feed do Estado paraguaio).
 *
 * Lê de `nanduti.v_feed_estado` (view sobre raw_presidencia_feed +
 * raw_reliefweb_sen). Retorna `null` quando Supabase ausente — caller
 * faz fallback para mock.
 */
import { serverClient } from '@/lib/supabase';

export interface FeedItem {
  id: string;
  oee: string;
  titulo: string;
  resumo: string | null;
  url_oficial: string;
  publicado_em: string;
  categoria: string;
  autor: string | null;
}

export async function listFeed(opts: { category?: string; limit?: number } = {}): Promise<FeedItem[] | null> {
  const sb = serverClient();
  if (!sb) return null;

  const limit = Math.min(Math.max(opts.limit ?? 10, 1), 50);
  let q = sb
    .from('v_feed_estado')
    .select('id,oee,titulo,resumo,url_oficial,publicado_em,categoria,autor')
    .order('publicado_em', { ascending: false })
    .limit(limit);

  if (opts.category) q = q.eq('categoria', opts.category);

  const { data, error } = await q;
  if (error) {
    console.error('[data-source/info] listFeed error', error);
    return null;
  }
  return (data ?? []) as FeedItem[];
}

/** Para info.weekly_summary: últimos 7 dias agrupados por categoria. */
export async function lastWeek(): Promise<FeedItem[] | null> {
  const sb = serverClient();
  if (!sb) return null;

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data, error } = await sb
    .from('v_feed_estado')
    .select('id,oee,titulo,resumo,url_oficial,publicado_em,categoria,autor')
    .gte('publicado_em', since)
    .order('publicado_em', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[data-source/info] lastWeek error', error);
    return null;
  }
  return (data ?? []) as FeedItem[];
}
