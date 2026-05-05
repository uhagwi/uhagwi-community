'use client';

import Link from 'next/link';
import { filterCatalog, type BuilderFilter } from '@/lib/gacha/catalog-seed';

interface Props {
  filter: BuilderFilter;
  setFilter: (f: BuilderFilter) => void;
  remainingFree: number;
  totalDrawn: number;
  onDrawFree: () => void;
  onDrawPro: () => void;
  isAdmin: boolean;
}

export function IntroPanel({
  filter,
  setFilter,
  remainingFree,
  totalDrawn,
  onDrawFree,
  onDrawPro,
  isAdmin,
}: Props) {
  const poolSize = filterCatalog(filter).length;
  const canDrawFree = isAdmin || remainingFree > 0;

  return (
    <div className="space-y-4">
      <div className="card text-center md:p-6">
        <p className="text-4xl">🎴</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-brand-900 md:text-3xl">
          검증된 하네스 뽑기
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-600)] md:text-base">
          벤치마크 통과한 등급 S/A/B/C/D 하네스 카탈로그.
          <br />
          오늘 풀 크기: <strong className="text-brand-700">{poolSize}장</strong> · 누적 뽑은 횟수:{' '}
          <strong className="text-brand-700">{totalDrawn}회</strong>
        </p>
      </div>

      <div className="card md:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">빌더 종류</p>
        <div className="mt-2 flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>전체</FilterButton>
          <FilterButton active={filter === 'human'} onClick={() => setFilter('human')}>👤 사람 빌더</FilterButton>
          <FilterButton active={filter === 'ai'} onClick={() => setFilter('ai')}>🤖 AI 빌더</FilterButton>
        </div>
        <p className="mt-2 text-[11px] text-[color:var(--color-ink-600)]">
          사람 빌더 = 도메인 깊이·실 운영 검증. AI 빌더 = 표준화·일관성·즉시 가동.
        </p>
      </div>

      <div className="card md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-card border border-brand-200 bg-cream-50 p-4">
            <p className="text-sm font-bold text-brand-900">🎁 매일 무료 1장</p>
            <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
              오늘 남은 횟수: <strong>{remainingFree}/1</strong>
              <br />
              내일 다시 1장 뽑기 가능
            </p>
            <button
              type="button"
              onClick={onDrawFree}
              disabled={!canDrawFree || poolSize === 0}
              className="btn-cta mt-3 w-full disabled:opacity-50"
            >
              {!canDrawFree
                ? '내일 다시'
                : poolSize === 0
                  ? '풀 비어있음'
                  : isAdmin
                    ? '🛠 관리자 1장 뽑기 (무제한)'
                    : '🎴 무료 1장 뽑기'}
            </button>
          </div>
          <div className="rounded-card border-2 border-brand-500 bg-brand-50 p-4">
            <p className="text-sm font-bold text-brand-900">⭐ Pro 5장 뽑기</p>
            <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
              한 번에 5장 + Premium S 풀 + 무제한
              <br />
              $9/월 (다음 세션 결제 연동)
            </p>
            <button type="button" onClick={onDrawPro} className="btn-cta mt-3 w-full">
              Pro 구독하기
            </button>
          </div>
        </div>
      </div>

      <div className="card md:p-5">
        <p className="text-sm font-bold text-brand-900">💡 가챠 vs 인터뷰</p>
        <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
          <strong>가챠</strong> (지금 여기): 1~5분, 검증된 기성품 하네스 — 바로 사용
          <br />
          <strong>인터뷰</strong>: 30~40분, AI가 내 일을 분석해 *나만의 맞춤* 자동화 제작
        </p>
        <Link href="/interview" className="btn-ghost mt-3 inline-flex text-xs">
          맞춤 진단도 받아보기 →
        </Link>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-card border px-3 py-2 text-xs font-medium transition ${
        active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-brand-200 bg-cream-50 text-brand-800 hover:bg-brand-50'
      }`}
    >
      {children}
    </button>
  );
}
