/**
 * /api/harnesses — 목록(GET) · 생성(POST)
 * 근거: docs/service-dev/02_design/api.md §2-2
 *
 * NOTE: 설계 정본은 `/api/v1/harness` (단수). 요청서 지시대로 `/api/harnesses` 스캐폴딩.
 *       W1 중 `/api/v1/harness` 로 rewrite 또는 통일 예정.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { problem, notImplemented } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';

/** 하네스 생성 요청 스키마 (api.md §2-2 POST 본문) */
const HarnessCreateSchema = z.object({
  title: z.string().min(1).max(120),
  persona_name: z.string().max(40).optional(),
  one_liner: z.string().min(1).max(200),
  purpose: z.string().min(1).max(5000),
  persona_job: z
    .enum(['florist', 'pharmacist', 'teacher', 'student', 'owner', 'planner', 'developer', 'other'])
    .optional(),
  structure_mermaid: z.string().optional(),
  components: z.array(z.string()).default([]),
  prompt_snippet: z.string().max(4000).optional(),
  media_urls: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(['public', 'link', 'private']).default('public'),
});

export type HarnessCreateInput = z.infer<typeof HarnessCreateSchema>;

export async function GET(req: NextRequest) {
  // Rate limit: public GET — 60/60s/IP
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  const rl = await checkRateLimit('pub', ip);
  if (!rl.ok) {
    return problem('rate-limit', { detail: '잠시 후 다시 시도해 주세요.' });
  }

  // TODO: 구현 — parseCursor + supabase 쿼리
  //   sp.get('sort') | 'job' | 'component' | 'tag' | 'cursor' | 'limit'
  //   RLS: published + visibility=public + deleted_at is null
  return notImplemented('GET /api/harnesses — 구현 대기 (api.md §2-2)');
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return problem('unauthorized', { detail: '로그인이 필요해요.' });
  }

  // Rate limit: write — 30/60s/user
  const rl = await checkRateLimit('write', (session.user as { id?: string }).id ?? 'unknown');
  if (!rl.ok) {
    return problem('rate-limit');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return problem('validation', { detail: 'JSON 본문을 파싱할 수 없어요.' });
  }

  const parsed = HarnessCreateSchema.safeParse(body);
  if (!parsed.success) {
    return problem('validation', {
      detail: '입력값을 확인해 주세요.',
      errors: parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // TODO: 구현 — supabase.insert(posts) → insert(harnesses) 트랜잭션
  //   status=draft, author_id=session.user.id, content_hash 계산
  return notImplemented('POST /api/harnesses — 구현 대기 (api.md §2-2)');
}
