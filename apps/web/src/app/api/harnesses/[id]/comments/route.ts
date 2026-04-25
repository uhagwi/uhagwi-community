/**
 * /api/harnesses/[id]/comments — 댓글 목록(GET) · 작성(POST)
 * 근거: docs/service-dev/02_design/api.md §2-5
 *
 * MVP 정책: 페이지네이션 없이 최신순 100개. soft delete 된 댓글 제외.
 * 본문 1~1000자 Zod 검증.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/auth-user';
import { problem } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  insertComment,
  listCommentsByHarness,
  type DbComment,
} from '@/lib/db/comments';

export const runtime = 'nodejs';

type RouteContext = { params: { id: string } };

const HarnessIdSchema = z.string().uuid();
const CommentCreateSchema = z.object({
  body: z.string().min(1, '댓글 내용을 입력해주세요.').max(1000, '1000자 이내로 작성해주세요.'),
});

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const idParse = HarnessIdSchema.safeParse(params.id);
  if (!idParse.success) {
    return problem('validation', { detail: 'harness id 형식 오류 (uuid)' });
  }

  try {
    const comments = await listCommentsByHarness(idParse.data);
    return jsonOk({ items: comments, total: comments.length });
  } catch (err) {
    console.error('[GET /api/harnesses/[id]/comments] 실패', err);
    return problem('internal', { detail: '댓글 목록 조회 중 오류가 발생했어요.' });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return problem('unauthorized', { detail: '로그인 후 댓글 작성이 가능해요.' });
  }

  const rl = await checkRateLimit('write', userId);
  if (!rl.ok) return problem('rate-limit');

  const idParse = HarnessIdSchema.safeParse(params.id);
  if (!idParse.success) {
    return problem('validation', { detail: 'harness id 형식 오류 (uuid)' });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return problem('validation', { detail: 'JSON 본문이 필요해요.' });
  }

  const parsed = CommentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return problem('validation', {
      errors: parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  try {
    const created = await insertComment({
      harnessId: idParse.data,
      authorId: userId,
      body: parsed.data.body,
    });
    return jsonCreated(created);
  } catch (err) {
    console.error('[POST /api/harnesses/[id]/comments] 실패', err);
    return problem('internal', { detail: '댓글 작성 중 오류가 발생했어요.' });
  }
}

function jsonOk(payload: { items: DbComment[]; total: number }): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function jsonCreated(comment: DbComment): Response {
  return new Response(JSON.stringify(comment), {
    status: 201,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
