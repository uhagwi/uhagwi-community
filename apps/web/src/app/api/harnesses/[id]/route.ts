/**
 * /api/harnesses/[id] — 상세 조회(GET) · 수정(PATCH) · 삭제(DELETE)
 * 근거: docs/service-dev/02_design/api.md §2-2
 *
 * 본 라우트의 [id] 는 harnesses.id (UUID) 기준. slug 조회는 상세 페이지 측에서.
 * PATCH/DELETE 는 본인(posts.author_id == session.user.id) 만 가능.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/auth-user';
import {
  problem,
  notImplemented,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  internal,
} from '@/lib/problem';
import { getDb } from '@/lib/db/index';

export const runtime = 'nodejs';

type RouteContext = { params: { id: string } };

/** 하네스 수정 스키마 */
const HarnessPatchSchema = z
  .object({
    title: z.string().min(2).max(120).optional(),
    one_liner: z.string().min(1).max(200).optional(),
    persona_name: z.string().max(40).nullable().optional(),
    persona_job: z.string().max(40).nullable().optional(),
    purpose: z.string().min(1).max(2000).optional(),
    body_md: z.string().max(20000).optional(),
    components: z.array(z.string().max(40)).max(20).optional(),
    category: z
      .enum(['verify', 'improve', 'proposal', 'develop', 'other'])
      .optional(),
    visibility: z.enum(['public', 'link', 'private']).optional(),
    status: z.enum(['draft', 'published']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: '최소 1개 필드 필요',
  });

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = params;
  if (!id) return badRequest('id 필수');
  return notImplemented(`GET /api/harnesses/${id} — 상세는 /harnesses/[slug] 페이지 사용`);
}

/** 본인 소유 여부 검증: harnesses.id → posts.author_id 비교 */
async function ensureOwner(harnessId: string, userId: string) {
  const db = getDb();
  const { data, error } = await db
    .from('harnesses')
    .select('id, post_id, posts!inner(id, author_id, status)')
    .eq('id', harnessId)
    .maybeSingle();
  if (error) {
    return { ok: false as const, status: 'error' as const, message: error.message };
  }
  if (!data) {
    return { ok: false as const, status: 'not-found' as const };
  }
  // posts 는 !inner 이므로 단일 객체로 옴
  const post = data.posts as unknown as { id: string; author_id: string; status: string } | null;
  if (!post) return { ok: false as const, status: 'not-found' as const };
  if (post.author_id !== userId) {
    return { ok: false as const, status: 'forbidden' as const };
  }
  return { ok: true as const, postId: post.id, postStatus: post.status };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const { id } = params;
  if (!id) return badRequest('id 필수');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('JSON 본문을 파싱할 수 없어요.');
  }

  const parsed = HarnessPatchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(
      '입력값을 확인해 주세요.',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
  }

  const owner = await ensureOwner(id, userId);
  if (!owner.ok) {
    if (owner.status === 'not-found') return notFound('하네스를 찾을 수 없어요.');
    if (owner.status === 'forbidden') return forbidden('본인 하네스만 수정할 수 있어요.');
    return internal(owner.message ?? '소유자 검증 실패');
  }

  const input = parsed.data;
  const db = getDb();

  // posts 측 업데이트 (visibility, status)
  const postsPatch: Record<string, unknown> = {};
  if (input.visibility) postsPatch.visibility = input.visibility;
  if (input.status) {
    postsPatch.status = input.status;
    if (input.status === 'published') {
      postsPatch.published_at = new Date().toISOString();
    }
  }
  if (Object.keys(postsPatch).length > 0) {
    const { error: pErr } = await db.from('posts').update(postsPatch).eq('id', owner.postId);
    if (pErr) return internal(`포스트 수정 실패: ${pErr.message}`);
  }

  // harnesses 측 업데이트
  const hPatch: Record<string, unknown> = {};
  if (input.title !== undefined) hPatch.title = input.title;
  if (input.one_liner !== undefined) hPatch.one_liner = input.one_liner;
  if (input.persona_name !== undefined) hPatch.persona_name = input.persona_name;
  if (input.persona_job !== undefined) hPatch.persona_job = input.persona_job;
  if (input.purpose !== undefined) hPatch.purpose = input.purpose;
  if (input.body_md !== undefined) hPatch.body_md = input.body_md;
  if (input.components !== undefined) hPatch.components = input.components;
  if (input.category !== undefined) hPatch.category = input.category;

  if (Object.keys(hPatch).length > 0) {
    const { error: hErr } = await db.from('harnesses').update(hPatch).eq('id', id);
    if (hErr) return internal(`하네스 수정 실패: ${hErr.message}`);
  }

  return new Response(JSON.stringify({ id, ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const { id } = params;
  if (!id) return badRequest('id 필수');

  const owner = await ensureOwner(id, userId);
  if (!owner.ok) {
    if (owner.status === 'not-found') return notFound('하네스를 찾을 수 없어요.');
    if (owner.status === 'forbidden') return forbidden('본인 하네스만 삭제할 수 있어요.');
    return internal(owner.message ?? '소유자 검증 실패');
  }

  // soft delete: posts.status='deleted', deleted_at=now()
  const db = getDb();
  const nowIso = new Date().toISOString();
  const { error } = await db
    .from('posts')
    .update({ status: 'deleted', deleted_at: nowIso })
    .eq('id', owner.postId);
  if (error) {
    return problem('internal', { detail: `삭제 실패: ${error.message}` });
  }
  return new Response(JSON.stringify({ id, ok: true, deleted_at: nowIso }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
