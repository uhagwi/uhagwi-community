/**
 * /api/reactions — 리액션 토글 (POST)
 * 근거: docs/service-dev/02_design/api.md §2-4
 *
 * unique(harness_id, user_id, type) 제약으로 멱등 보장.
 * Idempotency-Key 헤더 있으면 5초 캐시.
 *
 * NOTE: 설계 정본은 `/api/v1/reaction/toggle`. 요청서 지시대로 `/api/reactions` 스캐폴딩.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { problem, notImplemented } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';

const ReactionToggleSchema = z.object({
  harness_id: z.string().uuid(),
  type: z.enum(['heart', 'fire', 'bow', 'pinch']),
});

export type ReactionToggleInput = z.infer<typeof ReactionToggleSchema>;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return problem('unauthorized', { detail: '로그인이 필요해요.' });

  const userId = (session.user as { id?: string }).id ?? 'unknown';
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

  // TODO: 구현
  //   1) Idempotency-Key 헤더 조회 → 5초 캐시 히트 시 동일 응답
  //   2) reactions upsert/delete (unique 제약 활용)
  //   3) 응답: { type, active, count } (ui 낙관적 업데이트와 reconcile)
  return notImplemented('POST /api/reactions — 구현 대기 (api.md §2-4)');
}
