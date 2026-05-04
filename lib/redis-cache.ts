/**
 * Optional Redis cache. Falls back to in-memory Map if REDIS_URL is unset or unreachable.
 * Keys: nanduti:<citizenId>:<intent_hash>:<lang>
 */
import crypto from 'crypto';

const TTL_DEFAULT = 300;
const memory = new Map<string, { v: unknown; exp: number }>();

let redis: { get: (k: string) => Promise<string | null>; set: (k: string, v: string, ...args: unknown[]) => Promise<unknown>; quit?: () => Promise<unknown> } | null = null;
let redisInitTried = false;

async function getRedis() {
  if (redisInitTried) return redis;
  redisInitTried = true;
  if (!process.env.REDIS_URL) return null;
  try {
    const mod: typeof import('ioredis') = await import('ioredis');
    const Redis = (mod as unknown as { default: typeof import('ioredis').default }).default;
    const client = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
    await client.connect();
    redis = client as unknown as typeof redis;
    return redis;
  } catch {
    redis = null;
    return null;
  }
}

export function cacheKey(citizenId: string, intent: string, lang: string): string {
  const hash = crypto.createHash('sha256').update(intent).digest('hex').slice(0, 16);
  return `nanduti:${citizenId}:${hash}:${lang}`;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = await getRedis();
  if (r) {
    try {
      const raw = await r.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      /* fall through */
    }
  }
  const m = memory.get(key);
  if (!m) return null;
  if (m.exp < Date.now()) {
    memory.delete(key);
    return null;
  }
  return m.v as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSec = TTL_DEFAULT): Promise<void> {
  const r = await getRedis();
  if (r) {
    try {
      await r.set(key, JSON.stringify(value), 'EX', ttlSec);
      return;
    } catch {
      /* fall through */
    }
  }
  memory.set(key, { v: value, exp: Date.now() + ttlSec * 1000 });
}

const RATE = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string, limit = 30, windowSec = 60): boolean {
  const now = Date.now();
  const slot = RATE.get(ip);
  if (!slot || slot.reset < now) {
    RATE.set(ip, { count: 1, reset: now + windowSec * 1000 });
    return true;
  }
  if (slot.count >= limit) return false;
  slot.count++;
  return true;
}
