/**
 * Deterministic mock latency derived from input hash. Range 200-1500ms.
 */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function mockDelay(seed: string, min = 200, max = 1500): Promise<void> {
  const ms = min + (hashStr(seed) % (max - min));
  return new Promise((r) => setTimeout(r, ms));
}

export function deterministicPick<T>(seed: string, list: readonly T[]): T {
  return list[hashStr(seed) % list.length];
}
