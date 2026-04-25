/**
 * HarnessCard — 갤러리·프로필 공용 카드
 * 근거: docs/service-dev/02_design/ui.md §3-5, §2-2
 *
 * MVP Phase 1: 이모지 썸네일 + 의인화 + 제목 + tagline + 리액션 요약 + 주접지수.
 * Phase 2: next/image 썸네일 + 상대 시간 포매터 교체.
 */
import Link from 'next/link';
import type { SampleHarness } from '@/data/sample-harnesses';
import { averageJuzzep, totalReactions } from '@/data/sample-harnesses';

export type HarnessCardProps = {
  harness: SampleHarness;
};

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function HarnessCard({ harness }: HarnessCardProps) {
  const {
    slug,
    title,
    persona_name,
    tagline,
    published_at,
    reaction_counts,
    comments,
    thumbnail_emoji,
    tags,
    view_count,
  } = harness;

  const displayName = persona_name ? `🌊 ${persona_name}` : '🌊';
  const totalReact = totalReactions(reaction_counts);
  const juzzep = averageJuzzep(comments);
  const formattedDate = dateFormatter.format(new Date(published_at));

  return (
    <article
      role="article"
      aria-label={`${title} 하네스 카드`}
      className="group card flex h-full flex-col gap-3 transition hover:shadow-float"
    >
      <Link
        href={`/harnesses/${slug}`}
        className="flex h-full flex-col gap-3"
        aria-label={`${title} 상세 보기`}
      >
        {/* 썸네일 — MVP 이모지 버전 */}
        <div
          aria-hidden="true"
          className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-brand-100 via-cream-100 to-mint-400/30 text-6xl transition group-hover:scale-[1.02]"
        >
          <span>{thumbnail_emoji}</span>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <p className="font-display text-sm text-brand-700">{displayName}</p>
          <h3 className="text-base font-semibold text-brand-900 md:text-lg">
            {title}
          </h3>
          <p className="mt-1 text-sm text-[color:var(--color-ink-600)] line-clamp-2">
            {tagline}
          </p>

          {/* 태그 */}
          {tags.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1" aria-label="태그">
              {tags.slice(0, 3).map((tag) => (
                <li
                  key={tag}
                  className="inline-flex items-center rounded-pill bg-mint-400/30 px-2 py-0.5 text-xs text-brand-800"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="mt-auto flex flex-col gap-2 border-t border-[color:var(--color-ink-300)]/40 pt-3 text-xs text-[color:var(--color-ink-600)]">
          <div className="flex items-center justify-between">
            <span>@{SAMPLE_AUTHOR_HANDLE}</span>
            <span aria-label={`조회수 ${view_count}회`}>👁 {view_count.toLocaleString('ko-KR')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1 rounded-pill bg-juzzep-400/20 px-2 py-0.5 font-medium text-juzzep-500"
              aria-label={`주접지수 ${juzzep}점`}
            >
              주접 {juzzep}
            </span>
            <span className="flex items-center gap-2" aria-label={`총 리액션 ${totalReact}개`}>
              <span>❤ {reaction_counts.heart}</span>
              <span>🔥 {reaction_counts.fire}</span>
              <span>🙇 {reaction_counts.bow}</span>
              <span>🤌 {reaction_counts.pinch}</span>
            </span>
          </div>
          <div className="text-[10px] text-[color:var(--color-ink-600)]/80">
            {formattedDate} 발행
          </div>
        </footer>
      </Link>
    </article>
  );
}

// MVP: 단일 작성자. Phase 2에서 harness.author 연결.
const SAMPLE_AUTHOR_HANDLE = 'jinmyeung';
