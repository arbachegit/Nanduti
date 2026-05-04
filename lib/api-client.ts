/**
 * Tiny client-side helper for the dispatched tool endpoints.
 * Tool name "wallet.balance" -> URL /api/wallet/balance
 */
const BASE = '/api';

function urlFromTool(name: string): string {
  return BASE + '/' + name.split('.').map((s) => s.replace(/_/g, '-')).join('/');
}

export async function callTool<T = unknown>(name: string, body: Record<string, unknown> = {}): Promise<T | null> {
  try {
    const r = await fetch(urlFromTool(name), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return (j as { result: T }).result ?? null;
  } catch {
    return null;
  }
}

export function chatStreamUrl(): string {
  return BASE + '/chat';
}

export function fmtPyg(v: number): string {
  return new Intl.NumberFormat('es-PY').format(Math.round(v));
}

export function fmtUsdc(v: number): string {
  return v.toFixed(2).replace('.', ',');
}
