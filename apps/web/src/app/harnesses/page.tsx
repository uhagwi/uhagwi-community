/**
 * 하네스 갤러리 `/harnesses`
 * 근거: docs/service-dev/02_design/ui.md §2-2 갤러리 와이어프레임
 *
 * Phase 2: Supabase 실 DB fetch (force-dynamic).
 * - 발행된(public·published) 하네스 최신순
 * - 환경변수 미설정·DB 오류 시 빈 배열로 fallback (서비스 무중단)
 * - 0건일 때: 안내 카드 1장 + "곧 공개" 플레이스홀더 유지
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { HarnessCard } from '@/components/harness-card';
import {
  listPublishedHarnesses,
  type HarnessFeedRow,
} from '@/lib/db/harnesses';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '하네스 갤러리',
  description:
    '우하귀에서 운영 중인 AI 하네스들을 둘러보세요. 검증·개선·제안서·서비스 개발까지 전부.',
};

type CategoryKey = 'all' | 'verify' | 'improve' | 'proposal' | 'develop';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  all: '전체',
  verify: '검증',
  improve: '개선',
  proposal: '기획',
  develop: '개발',
};

const CATEGORIES: CategoryKey[] = ['all', 'verify', 'improve', 'proposal', 'develop'];

async function safeListHarnesses(): Promise<HarnessFeedRow[]> {
  try {
    return await listPublishedHarnesses();
  } catch (err) {
    console.error('[gallery] listPublishedHarnesses failed:', err);
    return [];
  }
}

export default async function HarnessGalleryPage() {
  const harnesses = await safeListHarnesses();

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
          <strong className="text-brand-700">발행된 하네스</strong>를 최신순으로
          소개합니다.
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
        {harnesses.length === 0 ? <EmptyStateCard /> : null}

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

function EmptyStateCard() {
  return (
    <article
      role="article"
      aria-label="첫 하네스를 기다리는 중"
      className="card col-span-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-brand-200 bg-cream-50 py-12 text-center"
    >
      <span className="text-6xl" aria-hidden="true">
        🌊
      </span>
      <h2 className="text-lg font-semibold text-brand-900">
        곧 첫 하네스가 등록됩니다
      </h2>
      <p className="max-w-[420px] text-sm text-[color:var(--color-ink-600)]">
        지금은 뼈대만 깔린 상태예요. 첫 발행자가 되어 자랑하러 오세요 🤌
      </p>
      <Link
        href="/harnesses/new"
        className="btn-primary mt-2"
        aria-label="첫 하네스 작성하기"
      >
        첫 하네스 자랑하기 🚀
      </Link>
    </article>
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
