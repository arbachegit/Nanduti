/**
 * POST /api/chat
 * SSE streaming via simple text frames. Body: { message, lang, history? }
 */
import { NextRequest } from 'next/server';
import { orchestrate, type Lang } from '@/lib/orchestrator';
import { rateLimit } from '@/lib/redis-cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ipFrom(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'demo';
}

export async function POST(req: NextRequest) {
  let body: { message?: string; lang?: Lang; history?: Array<{ role: 'user' | 'assistant'; content: string }> } = {};
  try { body = await req.json(); } catch { /* noop */ }
  const message = String(body.message ?? '').slice(0, 1500);
  const lang: Lang = (body.lang === 'es' || body.lang === 'gn' ? body.lang : 'jopara') as Lang;
  const ip = ipFrom(req);
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers: { 'content-type': 'application/json' } });
  }
  if (!message) {
    return new Response(JSON.stringify({ error: 'empty_message' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const send = (data: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
      orchestrate({ message, lang, history: body.history }, (chunk) => {
        send(chunk);
        if (chunk.type === 'done' || chunk.type === 'error') {
          controller.close();
        }
      }).catch((e) => {
        send({ type: 'error', error: String(e) });
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'connection': 'keep-alive',
    },
  });
}
