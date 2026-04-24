/**
 * HarnessCard — 갤러리·프로필 공용 카드
 * 근거: docs/service-dev/02_design/ui.md §3-5, §2-2
 *
 * 구성: 썸네일(16:9) + 🌊 + 의인화 이름/제목 + 한줄요약 + 리액션 요약 + 작성자·경과시간
 * TODO: 구현 — next/image 썸네일 · Link 상세 이동 · prefers-reduced-motion 지원
 */
import Link from 'next/link';

export type HarnessCardProps = {
  slug: string;
  title: string;
  personaName?: string | null;
  oneLiner: string;
  thumbnailUrl?: string | null;
  authorHandle: string;
  publishedAt: string; // ISO
  reactionCounts: {
    heart: number;
    fire: number;
    bow: number;
    pinch: number;
  };
};

export function HarnessCard(props: HarnessCardProps) {
  const { slug, title, personaName, oneLiner, authorHandle, reactionCounts } = props;
  const displayName = personaName ? `🌊 ${personaName}` : '🌊';
  // TODO: 구현 — published_at 상대 시간 포매터 (e.g. "3일 전")

  return (
    <article
      role="article"
      aria-label={`${title} 하네스 카드`}
      className="card flex flex-col gap-3 transition hover:shadow-float"
    >
      <Link href={`/harnesses/${slug}`} className="block space-y-3">
        {/* 썸네일 */}
        <div
          aria-hidden="true"
          className="aspect-video w-full overflow-hidden rounded-[10px] bg-cream-100"
        >
          {/* TODO: 구현 — next/image fill + alt 필수 */}
        </div>
        <div>
          <p className="font-display text-sm text-brand-700">{displayName}</p>
          <h3 className="mt-1 font-semibold text-brand-900">{title}</h3>
          <p className="mt-1 text-sm text-[color:var(--color-ink-600)] line-clamp-2">
            {oneLiner}
          </p>
        </div>
      </Link>
      <footer className="flex items-center justify-between text-xs text-[color:var(--color-ink-600)]">
        <span>@{authorHandle}</span>
        <span className="flex items-center gap-2" aria-label="리액션 요약">
          <span>❤ {reactionCounts.heart}</span>
          <span>🔥 {reactionCounts.fire}</span>
          <span>🙇 {reactionCounts.bow}</span>
          <span>🤌 {reactionCounts.pinch}</span>
        </span>
      </footer>
    </article>
  );
}
