/**
 * /api/harnesses/[id] — 상세 조회(GET) · 수정(PATCH) · 삭제(DELETE)
 * 근거: docs/service-dev/02_design/api.md §2-2
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { problem, notImplemented } from '@/lib/problem';

type RouteContext = { params: { id: string } };

/** 하네스 수정 스키마 (status 전환 포함) */
const HarnessPatchSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    persona_name: z.string().max(40).optional(),
    one_liner: z.string().min(1).max(200).optional(),
    purpose: z.string().min(1).max(5000).optional(),
    persona_job: z.string().optional(),
    structure_mermaid: z.string().optional(),
    components: z.array(z.string()).optional(),
    prompt_snippet: z.string().max(4000).optional(),
    media_urls: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional(),
    visibility: z.enum(['public', 'link', 'private']).optional(),
    status: z.enum(['draft', 'published']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: '최소 1개 필드 필요' });

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = params;
  if (!id) return problem('validation', { detail: 'id 필수' });
  // TODO: 구현 — slug 또는 id 로 조회 (published+public 또는 본인)
  return notImplemented(`GET /api/harnesses/${id} — 구현 대기`);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session) return problem('unauthorized');

  const { id } = params;
  if (!id) return problem('validation', { detail: 'id 필수' });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return problem('validation', { detail: 'JSON 본문을 파싱할 수 없어요.' });
  }

  const parsed = HarnessPatchSchema.safeParse(body);
  if (!parsed.success) {
    return problem('validation', {
      errors: parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // TODO: 구현 — 본인 확인 (posts.author_id = session.user.id)
  //   status=published 전환 시 slug 자동 생성 + Discord 크로스포스트 큐
  return notImplemented(`PATCH /api/harnesses/${id} — 구현 대기`);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session) return problem('unauthorized');

  const { id } = params;
  if (!id) return problem('validation', { detail: 'id 필수' });

  // TODO: 구현 — 본인 확인 후 soft delete (deleted_at=now)
  return notImplemented(`DELETE /api/harnesses/${id} — 구현 대기`);
}
