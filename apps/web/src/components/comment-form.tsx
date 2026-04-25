/**
 * CommentForm — 주접 댓글 작성 폼
 * 근거: docs/service-dev/02_design/ui.md §3-5 JuzzepComment · api.md §2-5
 *
 * - textarea + 글자 카운터(1000자 한도)
 * - 작성 후 router.refresh() 로 서버 컴포넌트 다시 렌더 (목록 갱신)
 * - 미인증 사용자에게는 비활성화 + 로그인 안내 노출
 */
'use client';

import { useId, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const MAX_LEN = 1000;

export type CommentFormProps = {
  harnessId: string;
  /** 인증 여부 — 서버 컴포넌트에서 session 보고 주입 */
  isAuthenticated: boolean;
  /** 작성 직후 콜백(옵션). 미지정 시 router.refresh() */
  onCreated?: () => void;
};

export function CommentForm({ harnessId, isAuthenticated, onCreated }: CommentFormProps) {
  const router = useRouter();
  const fieldId = useId();
  const errId = useId();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmed = body.trim();
  const len = body.length;
  const overLen = len > MAX_LEN;
  const canSubmit = isAuthenticated && trimmed.length > 0 && !overLen && !isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/harnesses/${harnessId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: trimmed }),
        });
        if (!res.ok) {
          if (res.status === 401) {
            const next = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?next=${next}`);
            return;
          }
          const detail = await safeProblemDetail(res);
          throw new Error(detail);
        }
        setBody('');
        if (onCreated) onCreated();
        else router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : '댓글 작성 실패 — 잠시 후 다시 시도해주세요.');
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div
        className="card border-2 border-dashed border-brand-200 bg-cream-50 text-center"
        role="status"
      >
        <p className="text-sm text-[color:var(--color-ink-600)]">
          Discord 로그인 후 주접 댓글을 남길 수 있어요 🤌
        </p>
        <a
          href="/login"
          className="btn-primary mt-3 inline-block text-xs"
          aria-label="Discord 로그인 페이지로 이동"
        >
          로그인하고 주접 쓰기
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card space-y-3"
      aria-label="주접 댓글 작성"
    >
      <label htmlFor={fieldId} className="sr-only">
        댓글 내용
      </label>
      <textarea
        id={fieldId}
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={MAX_LEN + 100} // 살짝 여유 둬서 카운터 over 시각화 가능
        placeholder="이 하네스 어떻게 보셨나요? 주접 한 마디 부탁드려요 🤌"
        aria-invalid={overLen ? 'true' : undefined}
        aria-describedby={error ? errId : undefined}
        className="w-full resize-none rounded-[10px] border border-[color:var(--color-ink-300)] bg-white px-3 py-2 text-sm leading-relaxed text-[color:var(--color-ink-900)] placeholder:text-[color:var(--color-ink-300)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      <div className="flex items-center justify-between text-xs">
        <span
          className={overLen ? 'text-red-600 font-medium' : 'text-[color:var(--color-ink-600)]'}
          aria-live="polite"
        >
          {len.toLocaleString('ko-KR')} / {MAX_LEN}
        </span>
        <button
          type="submit"
          disabled={!canSubmit}
          aria-busy={isPending}
          className="btn-primary text-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? '등록 중…' : '주접 등록'}
        </button>
      </div>
      {error ? (
        <p id={errId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}

async function safeProblemDetail(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { title?: string; detail?: string; errors?: { message: string }[] };
    if (j.errors && j.errors.length > 0) return j.errors.map((x) => x.message).join(', ');
    return j.detail ?? j.title ?? `요청 실패 (${res.status})`;
  } catch {
    return `요청 실패 (${res.status})`;
  }
}
