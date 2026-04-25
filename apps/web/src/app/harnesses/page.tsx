/**
 * 하네스 갤러리 `/harnesses`
 * 근거: docs/service-dev/02_design/ui.md §2-2 갤러리 와이어프레임
 *
 * MVP Phase 1: 하드코딩 샘플 4종 + "곧 공개" placeholder 2종.
 * - 필터 바는 시각적 목업 (실동작은 Phase 2 QS 파라미터로 교체)
 * - 카드 그리드: 1col / 2col / 3col (md / lg)
 * - 서버 컴포넌트 기본, 인터랙션 없음
 *
 * 설계 문서 스펙 경로는 `/gallery`이지만 요청서 준수 차원에서 `/harnesses`로 유지.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { HarnessCard } from '@/components/harness-card';
import {
  SAMPLE_HARNESSES,
  CATEGORY_LABELS,
  type SampleHarness,
} from '@/data/sample-harnesses';

export const metadata: Metadata = {
  title: '하네스 갤러리',
  description:
    '우하귀에서 운영 중인 AI 하네스들을 둘러보세요. 검증·개선·제안서·서비스 개발까지 전부.',
};

const CATEGORIES: Array<SampleHarness['category'] | 'all'> = [
  'all',
  'verify',
  'improve',
  'proposal',
  'develop',
];

export default function HarnessGalleryPage() {
  const harnesses = SAMPLE_HARNESSES;

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <header className="space-y-3 text-center md:text-left">
        <h1 className="font-display text-[28px] font-bold text-brand-900 md:text-[36px]">
          하네스 갤러리
        </h1>
        <p className="mx-auto max-w-[640px] text-sm text-[color:var(--color-ink-600)] md:mx-0 md:text-base">
          꽃집·교사·개발자·기획자 — 누구든 자기만의 AI 하네스를 자랑하는 곳.
          {' '}
          <strong className="text-brand-700">이번 주는 운영자 이진명</strong>
          의 범용 하네스 4종을 맛보기로 공개합니다.
        </p>
      </header>

      {/* 필터 바 (시각적 목업) */}
      <nav
        aria-label="카테고리 필터"
        className="flex flex-wrap gap-2 rounded-card bg-white p-3 shadow-card"
      >
        {CATEGORIES.map((cat, idx) => (
          <button
            key={cat}
            type="button"
            disabled
            aria-pressed={idx === 0}
            className={`rounded-pill px-4 py-1.5 text-sm font-medium transition ${
              idx === 0
                ? 'bg-brand-600 text-white shadow-card'
                : 'bg-cream-100 text-brand-800 hover:bg-brand-100'
            }`}
            title="필터는 Phase 2에 연동 예정"
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-[color:var(--color-ink-600)]">
          총 {harnesses.length}개 하네스
        </span>
      </nav>

      {/* 카드 그리드 */}
      <section
        aria-label="하네스 목록"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
      >
        {harnesses.map((harness) => (
          <HarnessCard key={harness.id} harness={harness} />
        ))}

        {/* Placeholder: 곧 공개 */}
        <ComingSoonCard
          emoji="🌱"
          title="우리동네 약국 하네스"
          hint="약사 김선생의 복약지도 자동화 — 검토 중"
        />
        <ComingSoonCard
          emoji="🎨"
          title="플로리스트 주문이"
          hint="꽃집 주문·배송·고객 CS 통합 — 5월 공개"
        />
      </section>

      {/* 발행 유도 CTA */}
      <section className="card flex flex-col items-center gap-3 border-2 border-dashed border-brand-200 bg-cream-50 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h2 className="text-lg font-semibold text-brand-900">
            내 하네스도 여기 올리고 싶다면?
          </h2>
          <p className="mt-1 text-sm text-[color:var(--color-ink-600)]">
            Discord 로그인 후 3-step Wizard 로 5분 안에 발행 가능합니다.
          </p>
        </div>
        <Link
          href="/harnesses/new"
          className="btn-primary"
          aria-label="새 하네스 작성 페이지로 이동"
        >
          하네스 자랑하기 🚀
        </Link>
      </section>
    </div>
  );
}

function ComingSoonCard({
  emoji,
  title,
  hint,
}: {
  emoji: string;
  title: string;
  hint: string;
}) {
  return (
    <article
      role="article"
      aria-label={`준비 중: ${title}`}
      className="card flex h-full flex-col items-center justify-center gap-2 border-2 border-dashed border-[color:var(--color-ink-300)] bg-cream-50 text-center opacity-80"
    >
      <span className="text-5xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="inline-flex items-center rounded-pill bg-mint-400/40 px-2 py-0.5 text-xs font-medium text-brand-800">
        곧 공개
      </span>
      <h3 className="font-semibold text-brand-800">{title}</h3>
      <p className="text-xs text-[color:var(--color-ink-600)]">{hint}</p>
    </article>
  );
}
