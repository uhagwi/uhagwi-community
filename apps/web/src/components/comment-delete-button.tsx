/**
 * CommentDeleteButton — 본인 댓글 삭제 버튼 ('use client')
 * 근거: docs/service-dev/02_design/api.md §2-5 DELETE /comments/[id]
 *
 * CommentList 와 분리해서 prop 타입 충돌 회피.
 * 클릭 시 confirm() 후 fetch DELETE → router.refresh().
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export type CommentDeleteButtonProps = {
  commentId: string;
  className?: string;
};

export function CommentDeleteButton({ commentId, className = '' }: CommentDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (isPending) return;
    if (!confirm('이 주접 댓글을 삭제하시겠어요?')) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) {
          const detail = await safeProblemDetail(res);
          throw new Error(detail);
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : '삭제 실패');
      }
    });
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-busy={isPending}
        className="text-xs text-[color:var(--color-ink-600)] underline-offset-2 hover:text-red-600 hover:underline disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? '삭제 중…' : '삭제'}
      </button>
      {error ? (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </span>
  );
}

async function safeProblemDetail(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { title?: string; detail?: string };
    return j.detail ?? j.title ?? `요청 실패 (${res.status})`;
  } catch {
    return `요청 실패 (${res.status})`;
  }
}
