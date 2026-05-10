/**
 * Data-source: alerts (SEN + DINAC consolidados).
 *
 * Lê de `nanduti.v_alerta`. Severity e categoria já vêm inferidas no SQL.
 * Retorna `null` quando Supabase ausente.
 */
import { serverClient } from '@/lib/supabase';

export interface AlertItem {
  id: string;
  fonte: 'sen' | 'dinac' | string;
  titulo: string;
  descricao: string | null;
  url_oficial: string;
  ts_evento: string;
  severity: 'info' | 'watch' | 'severe' | 'extreme';
  categoria: string;
  geo_dpto: string | null;
}

export async function listAlerts(opts: { limit?: number; severity?: AlertItem['severity']; geo?: string } = {}): Promise<AlertItem[] | null> {
  const sb = serverClient();
  if (!sb) return null;

  const limit = Math.min(Math.max(opts.limit ?? 10, 1), 50);
  let q = sb
    .from('v_alerta')
    .select('id,fonte,titulo,descricao,url_oficial,ts_evento,severity,categoria,geo_dpto')
    .order('ts_evento', { ascending: false })
    .limit(limit);

  if (opts.severity) q = q.eq('severity', opts.severity);
  if (opts.geo) q = q.eq('geo_dpto', opts.geo);

  const { data, error } = await q;
  if (error) {
    console.error('[data-source/alerts] listAlerts error', error);
    return null;
  }
  return (data ?? []) as AlertItem[];
}
