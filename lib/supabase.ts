/**
 * Ñandutí Supabase clients.
 *
 * - serverClient: service-role, NUNCA exposto pro browser. Usa em route
 *   handlers, em scrapers Node, em jobs. Bypassa RLS.
 * - anonClient: chave pública, RLS aplicada. Para SSR de dados públicos.
 *
 * Tabelas vivem em schema `nanduti.*`. RLS ligada em tudo user-scoped.
 *
 * Lazy: só instancia quando chamado. Falha silenciosa quando env vazia
 * (modo mock/dev sem banco).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Schema custom 'nanduti' — generic deve aceitar qualquer schema.
type NandutiClient = SupabaseClient<any, 'nanduti', any>;

let _server: NandutiClient | null = null;
let _anon: NandutiClient | null = null;

export function serverClient(): NandutiClient | null {
  if (_server) return _server;
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE?.trim();
  if (!url || !key) return null;
  _server = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'nanduti' },
  });
  return _server;
}

export function anonClient(): NandutiClient | null {
  if (_anon) return _anon;
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  _anon = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'nanduti' },
  });
  return _anon;
}

export function dbAvailable(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE);
}
