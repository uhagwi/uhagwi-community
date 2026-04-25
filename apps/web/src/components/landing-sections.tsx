/**
 * 랜딩 전용 하위 섹션 컴포넌트 모음
 * 근거: docs/service-dev/02_design/ui.md §2-1
 *
 * page.tsx 250줄 제한을 지키기 위해 순수 프레젠테이션 조각을 분리.
 * 데이터·상태 없이 Props만 받는 서버 컴포넌트.
 */
import Link from 'next/link';

// ------------------------------------------------------------
// 자동차 비유 카드 (§2. 하네스란?)
// ------------------------------------------------------------
export function AnalogyCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card text-center transition hover:shadow-float md:p-6">
      <p className="text-4xl md:text-5xl" aria-hidden="true">
        {icon}
      </p>
      <p className="mt-4 text-base font-bold text-brand-900 md:text-lg">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-600)]">{body}</p>
    </div>
  );
}

// ------------------------------------------------------------
// 타겟 페르소나 카드 (§3. 두 사람)
// ------------------------------------------------------------
export function TargetCard({
  badge,
  badgeTone,
  title,
  subtitle,
  lead,
  bullets,
}: {
  badge: string;
  badgeTone: 'mint' | 'juzzep';
  title: string;
  subtitle: string;
  lead: string;
  bullets: readonly string[];
}) {
  const toneClass =
    badgeTone === 'mint'
      ? 'bg-mint-400/40 text-brand-800'
      : 'bg-juzzep-400/20 text-juzzep-500';

  return (
    <article className="card flex h-full flex-col gap-4 md:p-8">
      <span
        className={`inline-flex w-fit items-center rounded-pill px-3 py-1 text-xs font-semibold ${toneClass}`}
      >
        {badge}
      </span>
      <div>
        <h3 className="text-display text-2xl text-brand-900 md:text-3xl">{title}</h3>
        <p className="mt-1 text-sm text-[color:var(--color-ink-600)]">{subtitle}</p>
      </div>
      <p className="text-base font-medium text-brand-800 md:text-lg">{lead}</p>
      <ul className="mt-auto space-y-2 text-sm text-[color:var(--color-ink-900)]">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span aria-hidden="true" className="text-juzzep-500">
              ✦
            </span>
            <span className="leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

// ------------------------------------------------------------
// Teaser 카드 (§4. 오늘의 하네스)
// 갤러리 진짜 데이터는 /harnesses 쪽에서 sample-harnesses.ts로 렌더.
// 여기는 랜딩 노출용 하드코드 3종.
// ------------------------------------------------------------
export type TeaserCardProps = {
  readonly slug: string;
  readonly emoji: string;
  readonly title: string;
  readonly tagline: string;
  readonly juzzep: number;
  readonly author: string;
};

export const TEASER_CARDS: readonly TeaserCardProps[] = [
  {
    slug: 'verify',
    emoji: '🛡️',
    title: '범용 검증 하네스',
    tagline: '산출물 나가기 전 마지막 문지기. 6개 감사 에이전트가 동시에 본다.',
    juzzep: 92,
    author: '@이진명',
  },
  {
    slug: 'improve',
    emoji: '✨',
    title: '범용 개선 하네스',
    tagline: '다듬어줘 한마디면 문서·코드·구조를 전부 손봐준다. 되돌림 보장.',
    juzzep: 88,
    author: '@이진명',
  },
  {
    slug: 'service-dev',
    emoji: '🏗️',
    title: '범용 서비스 개발 하네스',
    tagline: '기획부터 배포까지, 서비스 한 벌을 짧게 돌려주는 개발 파이프라인.',
    juzzep: 81,
    author: '@이진명',
  },
];

export function TeaserCard({ emoji, title, tagline, juzzep, author }: TeaserCardProps) {
  return (
    <article
      role="article"
      className="group flex h-full flex-col gap-3 rounded-card bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-float md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-4xl" aria-hidden="true">
          {emoji}
        </span>
        <span className="inline-flex items-center gap-1 rounded-pill bg-juzzep-400/15 px-2.5 py-1 text-xs font-semibold text-juzzep-500">
          🔥 주접지수 {juzzep}
        </span>
      </div>
      <h3 className="text-display text-xl leading-snug text-brand-900 md:text-2xl">{title}</h3>
      <p className="text-sm leading-relaxed text-[color:var(--color-ink-600)]">{tagline}</p>
      <p className="mt-auto text-xs text-[color:var(--color-ink-600)]">
        by <span className="font-semibold text-brand-700">{author}</span>
      </p>
    </article>
  );
}

// ------------------------------------------------------------
// 주접 댓글 비교 블록 (§5. 우하귀의 말투)
// ------------------------------------------------------------
export function JuzzepCompare() {
  return (
    <div className="relative mt-12 grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-6">
      {/* 좌: 보통 커뮤니티 */}
      <article className="space-y-3 text-left">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[color:var(--color-ink-600)] md:text-left">
          보통 커뮤니티
        </p>
        <div className="comment-bubble">
          <p className="font-medium text-[color:var(--color-ink-900)]">좋은 시스템이네요.</p>
          <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">— user_3148</p>
        </div>
        <div className="comment-bubble">
          <p className="text-[color:var(--color-ink-900)]">참고하겠습니다.</p>
          <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">— anon</p>
        </div>
      </article>

      {/* 중: 화살표 */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center text-3xl text-brand-400 md:pt-16"
      >
        <span className="hidden md:inline">→</span>
        <span className="md:hidden">↓</span>
      </div>

      {/* 우: 우하귀 */}
      <article className="space-y-3 text-left">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-juzzep-500 md:text-left">
          우하귀
        </p>
        <div className="comment-bubble comment-bubble--juzzep">
          <p className="font-medium text-brand-900">
            이 하네스 진짜 조각이다 🔥 검증이 형 일 잘하시네
          </p>
          <p className="mt-1 text-xs text-juzzep-500">주접지수 ███████░ 87 · @소영</p>
        </div>
        <div className="comment-bubble comment-bubble--juzzep">
          <p className="text-brand-900">
            이 YAML 내가 키울게... 들여쓰기 너무 단정해 🤌
          </p>
          <p className="mt-1 text-xs text-juzzep-500">주접지수 ██████░░ 74 · @하네</p>
        </div>
      </article>
    </div>
  );
}

// ------------------------------------------------------------
// 최종 CTA 블록 (§6. Footer CTA)
// ------------------------------------------------------------
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-brand-800 px-4 py-20 text-center text-white md:px-6 md:py-28"
    >
      <div className="mx-auto max-w-[720px]">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-mint-400">
          우리 하네스 귀엽지
        </p>
        <h2 id="final-cta-title" className="text-display text-3xl leading-tight md:text-[44px]">
          내 하네스
          <br className="md:hidden" /> 자랑하러 가자
        </h2>
        <p className="mx-auto mt-5 max-w-[520px] text-base text-cream-100/90 md:text-lg">
          Discord 서버에서 먼저 만나자. 웹 플랫폼은 2026년 6월 오픈.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="#"
            className="inline-flex w-full items-center justify-center rounded-[12px] bg-juzzep-500 px-6 py-3.5 font-semibold text-white shadow-float transition hover:bg-juzzep-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-mint-400 sm:w-auto"
          >
            Discord 입장하기 →
          </Link>
          <Link
            href="/about"
            className="inline-flex w-full items-center justify-center rounded-[12px] border border-cream-100/40 bg-white/0 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            우하귀에 대해 알아보기
          </Link>
        </div>
      </div>
    </section>
  );
}
