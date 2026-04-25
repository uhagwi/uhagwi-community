/**
 * HarnessCard — 갤러리·프로필 공용 카드
 * 근거: docs/service-dev/02_design/ui.md §3-5, §2-2
 *
 * Phase 2: Supabase fetch 결과(`HarnessFeedRow`) 직접 수신.
 * - tagline 필드 부재 → `one_liner`를 카드 보조 카피로 사용 (line-clamp-2)
 * - comments 미동봉 → 댓글 평균은 `avg_juzzep`(서버 집계) 사용
 * - 작성자 핸들은 `author?.handle` (없으면 익명)
 */
import Link from 'next/link';
import { CharacterThumbnail } from '@/components/character-thumbnail';
import type { HarnessFeedRow } from '@/lib/db/harnesses';

export type HarnessCardProps = {
  harness: HarnessFeedRow;
};

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const FALLBACK_EMOJI = '🌊';

function totalReactions(counts: HarnessFeedRow['reaction_counts']): number {
  return counts.heart + counts.fire + counts.bow + counts.pinch;
}

export function HarnessCard({ harness }: HarnessCardProps) {
  const {
    slug,
    title,
    persona_name,
    one_liner,
    published_at,
    created_at,
    reaction_counts,
    avg_juzzep,
    thumbnail_emoji,
    thumbnail_url,
    tags,
    view_count,
    author,
  } = harness;

  const displayName = persona_name ? `🌊 ${persona_name}` : '🌊';
  const totalReact = totalReactions(reaction_counts);
  const juzzep = Math.round(avg_juzzep ?? 0);
  const dateSource = published_at ?? created_at;
  const formattedDate = dateSource
    ? dateFormatter.format(new Date(dateSource))
    : '';
  const handleLabel = author?.handle ?? '익명';
  const fallbackEmoji = thumbnail_emoji ?? FALLBACK_EMOJI;

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
        {/* 썸네일 — 캐릭터 이미지 우선, 404·없으면 emoji fallback */}
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-brand-100 via-cream-100 to-mint-400/30 transition group-hover:scale-[1.02]">
          <CharacterThumbnail
            src={thumbnail_url}
            fallbackEmoji={fallbackEmoji}
            alt={`${title} 캐릭터`}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <p className="font-display text-sm text-brand-700">{displayName}</p>
          <h3 className="text-base font-semibold text-brand-900 md:text-lg">
            {title}
          </h3>
          <p className="mt-1 text-sm text-[color:var(--color-ink-600)] line-clamp-2">
            {one_liner}
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
            <span>@{handleLabel}</span>
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
          {formattedDate ? (
            <div className="text-[10px] text-[color:var(--color-ink-600)]/80">
              {formattedDate} 발행
            </div>
          ) : null}
        </footer>
      </Link>
    </article>
  );
}
