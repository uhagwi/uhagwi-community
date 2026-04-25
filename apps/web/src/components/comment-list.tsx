/**
 * CommentList — 주접 댓글 리스트
 * 근거: docs/service-dev/02_design/ui.md §2-3, §3-5 JuzzepComment
 *
 * 각 댓글: 아바타 + handle + 본문 + 주접지수 게이지(0~100, 핫핑크) + 작성 시각.
 */
import type { SampleComment } from '@/data/sample-harnesses';
import { JuzzepBadge } from '@uhagwi/ui';

export type CommentListProps = {
  comments: SampleComment[];
};

const relativeFormatter = new Intl.RelativeTimeFormat('ko-KR', { numeric: 'auto' });

function formatRelative(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMin = Math.round(diffMs / 1000 / 60);
  const absMin = Math.abs(diffMin);
  if (absMin < 60) return relativeFormatter.format(diffMin, 'minute');
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return relativeFormatter.format(diffHour, 'hour');
  const diffDay = Math.round(diffHour / 24);
  return relativeFormatter.format(diffDay, 'day');
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-[color:var(--color-ink-600)]">
        아직 주접이 없어요. 첫 주접의 주인공이 되어주세요 🤌
      </p>
    );
  }

  return (
    <ul className="space-y-4" aria-label={`주접 댓글 ${comments.length}개`}>
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="card flex gap-3 border border-transparent transition hover:border-brand-100"
        >
          {/* 아바타 */}
          <div
            aria-hidden="true"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-cream-100 text-xl"
          >
            {comment.author.avatar_emoji}
          </div>

          {/* 본문 */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <header className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-brand-900">
                {comment.author.display_name}
              </span>
              <span className="text-xs text-[color:var(--color-ink-600)]">
                @{comment.author.handle}
              </span>
              <span
                className="text-xs text-[color:var(--color-ink-600)]/80"
                aria-label={`작성 시각 ${comment.created_at}`}
              >
                · {formatRelative(comment.created_at)}
              </span>
            </header>
            <p className="text-sm leading-relaxed text-[color:var(--color-ink-900)]">
              {comment.body}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <JuzzepBadge score={comment.juzzep_score} />
              <JuzzepGauge score={comment.juzzep_score} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

// 주접지수 게이지 — 핫핑크 0~100 시각화
function JuzzepGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div
      className="h-1.5 w-24 flex-none overflow-hidden rounded-pill bg-cream-100"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`주접지수 ${clamped}`}
    >
      <div
        className="h-full bg-juzzep-500 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
