/**
 * Rate Limit — Upstash Redis sliding window
 * 근거: docs/service-dev/02_design/api.md §1-4
 *
 * 스코프별 정책:
 *   pub      : 60/60s/IP
 *   write    : 30/60s/user
 *   juzzep   : 20/60s/user
 *   reaction : 60/60s/user
 *   publish  : 5/10min/user
 *   bot      : 120/60s/global
 *
 * TODO: 구현 — @upstash/ratelimit 패키지 도입 또는 REST 직접 호출
 *   - Idempotency-Key 헤더 병행 (reaction·comment 낙관적 업데이트 중복 방지)
 */

export type RateLimitScope = 'pub' | 'write' | 'juzzep' | 'reaction' | 'publish' | 'bot';

export type RateLimitResult = {
  /** true: 통과 · false: 초과 */
  ok: boolean;
  /** 남은 요청 수 */
  remaining: number;
  /** reset 초 단위 epoch */
  reset: number;
  /** 사람이 읽을 Retry-After 초 */
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

/**
 * 키 구성: `rl:{scope}:{identifier}` (identifier 는 user_id, ip, 또는 "global")
 * TODO: 구현 — Upstash Redis sliding window 알고리즘
 */
export async function checkRateLimit(
  scope: RateLimitScope,
  identifier: string,
): Promise<RateLimitResult> {
  const policy = POLICIES[scope];
  // TODO: 구현 — Upstash fetch(REST) 또는 SDK 호출
  // 임시: 항상 통과. 실제 운영 전 반드시 구현 필요.
  void identifier;
  return {
    ok: true,
    remaining: policy.limit,
    reset: Math.floor(Date.now() / 1000) + policy.windowSec,
  };
}
