/**
 * /api/reactions — 리액션 토글 (POST)
 * 근거: docs/service-dev/02_design/api.md §2-4
 *
 * unique(harness_id, user_id, type) 제약으로 멱등 보장.
 * Idempotency-Key 헤더 있으면 60초 in-memory 캐시 히트 시 동일 응답 재사용.
 *
 * NOTE: 설계 정본은 `/api/v1/reaction/toggle`. 요청서 지시대로 `/api/reactions` 스캐폴딩.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { problem } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';
import { toggleReaction, type ReactionCounts } from '@/lib/db/reactions';

export const runtime = 'nodejs';

const ReactionToggleSchema = z.object({
  harness_id: z.string().uuid(),
  type: z.enum(['heart', 'fire', 'bow', 'pinch']),
});

export type ReactionToggleInput = z.infer<typeof ReactionToggleSchema>;

type ReactionToggleResult = { active: boolean; counts: ReactionCounts };

// ---------------------------------------------------------------------------
// Idempotency 캐시 (in-memory, 1분 TTL)
//   MVP 수준: 단일 인스턴스 가정. 멀티 인스턴스화 시 Upstash Redis 로 전환.
// ---------------------------------------------------------------------------
type CacheEntry = { result: ReactionToggleResult; expiresAt: number };
const idempotencyCache = new Map<string, CacheEntry>();
const IDEMPOTENCY_TTL_MS = 60_000;

function cacheGet(key: string): ReactionToggleResult | null {
  const hit = idempotencyCache.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    idempotencyCache.delete(key);
    return null;
  }
  return hit.result;
}

function cacheSet(key: string, result: ReactionToggleResult): void {
  idempotencyCache.set(key, {
    result,
    expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
  });
  // 단순 사이즈 가드 — 1000건 초과 시 가장 오래된 항목 정리
  if (idempotencyCache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of idempotencyCache.entries()) {
      if (v.expiresAt < now) idempotencyCache.delete(k);
    }
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return problem('unauthorized', { detail: '로그인이 필요해요.' });

  const userId = session.user?.id;
  if (!userId) {
    return problem('unauthorized', { detail: '사용자 식별 실패 — 다시 로그인해주세요.' });
  }

  const rl = await checkRateLimit('reaction', userId);
  if (!rl.ok) return problem('rate-limit');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return problem('validation', { detail: 'JSON 본문 필요' });
  }

  const parsed = ReactionToggleSchema.safeParse(body);
  if (!parsed.success) {
    return problem('validation', {
      errors: parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Idempotency-Key — user 단위로 스코프 (사용자별 충돌 방지)
  const idemKey = req.headers.get('idempotency-key');
  const cacheKey = idemKey ? `${userId}:${idemKey}` : null;
  if (cacheKey) {
    const cached = cacheGet(cacheKey);
    if (cached) return jsonOk(cached);
  }

  try {
    const result = await toggleReaction({
      harnessId: parsed.data.harness_id,
      userId,
      type: parsed.data.type,
    });
    if (cacheKey) cacheSet(cacheKey, result);
    return jsonOk(result);
  } catch (err) {
    console.error('[POST /api/reactions] toggleReaction 실패', err);
    return problem('internal', { detail: '리액션 토글 중 오류가 발생했어요.' });
  }
}

function jsonOk(result: ReactionToggleResult): Response {
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
