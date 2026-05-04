/**
 * Universal Ñandutí tool dispatcher.
 * URL pattern /api/<segment>/<segment>... maps to tool name "segment.segment".
 * Handles 27 of the 28 declared routes (chat is a separate streaming endpoint).
 *
 * Examples:
 *   POST /api/wallet/balance     -> wallet.balance
 *   POST /api/auth/cic-otp       -> auth.cic_otp
 *   POST /api/police/panic       -> police.panic
 */
import { NextRequest } from 'next/server';
import { TOOLS, getTool } from '@/lib/tool-registry';
import { rateLimit } from '@/lib/redis-cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ipFrom(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'demo';
}

function segmentsToToolName(segments: string[]): string {
  if (segments.length === 0) return '';
  const head = segments[0];
  const tail = segments.slice(1).join('_').replace(/-/g, '_');
  return tail ? `${head}.${tail}` : head;
}

async function handle(req: NextRequest, segments: string[]) {
  const ip = ipFrom(req);
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers: { 'content-type': 'application/json' } });
  }

  if (segments.length === 0 || segments[0] === '__catalog') {
    return new Response(JSON.stringify({ tools: TOOLS.map((t) => ({ name: t.name, miniapp: t.miniapp, description: t.description })) }), { headers: { 'content-type': 'application/json' } });
  }

  const name = segmentsToToolName(segments);
  const tool = getTool(name);
  if (!tool) {
    return new Response(JSON.stringify({ error: 'unknown_tool', name, hint: TOOLS.map((t) => t.name) }), { status: 404, headers: { 'content-type': 'application/json' } });
  }

  let body: Record<string, unknown> = {};
  if (req.method !== 'GET') {
    try { body = await req.json(); } catch { body = {}; }
  } else {
    const url = new URL(req.url);
    body = Object.fromEntries(url.searchParams.entries());
  }

  try {
    const result = await tool.handler(body);
    return new Response(JSON.stringify({ ok: true, tool: name, result }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, tool: name, error: String(e) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handle(req, path ?? []);
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handle(req, path ?? []);
}
