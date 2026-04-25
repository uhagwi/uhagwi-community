/**
 * /api/comments/[id] — 댓글 삭제(DELETE)
 * 근거: docs/service-dev/02_design/api.md §2-5 (소프트 삭제)
 *
 * 본인 댓글만 삭제 가능. softDeleteComment 가 false 반환 시 403.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { problem } from '@/lib/problem';
import { softDeleteComment } from '@/lib/db/comments';

export const runtime = 'nodejs';

type RouteContext = { params: { id: string } };

const CommentIdSchema = z.string().uuid();

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session) {
    return problem('unauthorized', { detail: '로그인이 필요해요.' });
  }

  const userId = session.user?.id;
  if (!userId) {
    return problem('unauthorized', { detail: '사용자 식별 실패 — 다시 로그인해주세요.' });
  }

  const idParse = CommentIdSchema.safeParse(params.id);
  if (!idParse.success) {
    return problem('validation', { detail: 'comment id 형식 오류 (uuid)' });
  }

  try {
    const ok = await softDeleteComment(idParse.data, userId);
    if (!ok) {
      // false → 본인 댓글이 아니거나 이미 삭제됨
      return problem('forbidden', { detail: '본인 댓글만 삭제할 수 있어요.' });
    }
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE /api/comments/[id]] 실패', err);
    return problem('internal', { detail: '댓글 삭제 중 오류가 발생했어요.' });
  }
}
