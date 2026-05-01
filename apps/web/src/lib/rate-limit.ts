/**
 * Rate Limit — sliding window (Upstash REST 우선, in-memory 폴백).
 * 근거: docs/service-dev/02_design/api.md §1-4
 *
 * 스코프별 정책:
 *   pub      : 60/60s/IP
 *   write    : 30/60s/user
 *   juzzep   : 20/60s/user
 *   reaction : 60/60s/user
 *   publish  : 5/10min/user
 *   bot      : 120/60s/global
 */

export type RateLimitScope = 'pub' | 'write' | 'juzzep' | 'reaction' | 'publish' | 'bot';

export type RateLimitResult = {
  /** true: 통과 · false: 초과 */
  ok: boolean;
  /** 남은 요청 수 */
  remaining: number;
  /** reset 초 단위 epoch */
  reset: number;
  /** Retry-After 초 */
  retryAfter?: number;
};

const POLICIES: Record<RateLimitScope, { limit: number; windowSec: number }> = {
  pub: { limit: 60, windowSec: 60 },
  write: { limit: 30, windowSec: 60 },
  juzzep: { limit: 20, windowSec: 60 },
  reaction: { limit: 60, windowSec: 60 },
  publish: { limit: 5, windowSec: 600 },
  bot: { limit: 120, windowSec: 60 },
};

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const UPSTASH_ENABLED = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

const memBuckets = new Map<string, number[]>();
const MEM_MAX_KEYS = 10_000;

function buildKey(scope: RateLimitScope, identifier: string): string {
  return `rl:${scope}:${identifier}`;
}

function memCheck(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowSec * 1000;
  const arr = memBuckets.get(key) ?? [];
  const fresh = arr.filter((t) => t > cutoff);

  if (fresh.length >= limit) {
    const oldest = fresh[0] ?? now;
    const resetMs = oldest + windowSec * 1000;
    return {
      ok: false,
      remaining: 0,
      reset: Math.floor(resetMs / 1000),
      retryAfter: Math.max(1, Math.ceil((resetMs - now) / 1000)),
    };
  }

  fresh.push(now);
  memBuckets.set(key, fresh);

  if (memBuckets.size > MEM_MAX_KEYS) {
    const stalest = [...memBuckets.entries()]
      .sort((a, b) => (a[1][a[1].length - 1] ?? 0) - (b[1][b[1].length - 1] ?? 0))
      .slice(0, Math.floor(MEM_MAX_KEYS / 4));
    for (const [k] of stalest) memBuckets.delete(k);
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - fresh.length),
    reset: Math.floor((now + windowSec * 1000) / 1000),
  };
}

async function upstashCheck(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const nowMs = Date.now();
  const member = `${nowMs}-${Math.random().toString(36).slice(2, 10)}`;
  const cutoff = nowMs - windowSec * 1000;

  const pipeline = [
    ['ZREMRANGEBYSCORE', key, '0', String(cutoff)],
    ['ZADD', key, String(nowMs), member],
    ['ZCARD', key],
    ['EXPIRE', key, String(windowSec)],
  ];

  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${UPSTASH_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(pipeline),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
  const out = (await res.json()) as Array<{ result: number | string }>;
  const count = Number(out[2]?.result ?? 0);
  const ok = count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - count),
    reset: Math.floor((nowMs + windowSec * 1000) / 1000),
    retryAfter: ok ? undefined : windowSec,
  };
}

export async function checkRateLimit(
  scope: RateLimitScope,
  identifier: string,
): Promise<RateLimitResult> {
  const policy = POLICIES[scope];
  const key = buildKey(scope, identifier);

  if (UPSTASH_ENABLED) {
    try {
      return await upstashCheck(key, policy.limit, policy.windowSec);
    } catch (err) {
      console.warn('[rate-limit] Upstash 실패 → 메모리 폴백', err);
    }
  }
  return memCheck(key, policy.limit, policy.windowSec);
}
