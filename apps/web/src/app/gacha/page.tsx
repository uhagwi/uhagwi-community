'use client';

/**
 * /gacha — 우하귀 가챠 페이지.
 * 사용자 정의: "기존에 적용을 바로 할 수 있는 하네스를 뽑는 곳" (인터뷰는 맞춤 제작).
 *
 * 1년차 시드: 사람 빌더(본인 33+개) + AI 빌더 하이브리드 18개.
 * 매일 1장 무료, 풀 N장 = Pro (placeholder).
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HarnessGradeCard } from '@/components/HarnessGradeCard';
import {
  CATALOG_SIZE,
  addToCollection,
  drawCards,
  filterCatalog,
  type BuilderFilter,
  type GachaHarness,
} from '@/lib/gacha/catalog-seed';

const STORAGE_KEY = 'uhagwi.gacha.v0_1';
const FREE_DAILY_LIMIT = 1; // 무료 매일 1장
const PRO_DRAW_COUNT = 5; // Pro 1회 5장

type GachaState = {
  /** 마지막 무료 뽑기 ISO 날짜 (YYYY-MM-DD) */
  last_free_draw_date: string | null;
  /** 누적 뽑은 카드 수 */
  total_drawn: number;
};

const INITIAL: GachaState = { last_free_draw_date: null, total_drawn: 0 };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function GachaPage() {
  const [state, setState] = useState<GachaState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<BuilderFilter>('all');
  const [drawn, setDrawn] = useState<GachaHarness[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...INITIAL, ...(JSON.parse(raw) as Partial<GachaState>) });
    } catch {
      /* 무시 */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 무시 */
    }
  }, [state, hydrated]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[760px] py-16 text-center">
        <p className="text-sm text-[color:var(--color-ink-600)]">불러오는 중…</p>
      </div>
    );
  }

  const today = todayISO();
  const usedFreeToday = state.last_free_draw_date === today;
  const remainingFree = usedFreeToday ? 0 : FREE_DAILY_LIMIT;

  function drawFree() {
    if (usedFreeToday) return;
    const pool = filterCatalog(filter);
    if (pool.length === 0) return;
    const cards = drawCards(pool, 1);
    setDrawn(cards);
    setFlipped(new Set());
    setState((s) => ({
      last_free_draw_date: today,
      total_drawn: s.total_drawn + 1,
    }));
    // 마이 컬렉션에 누적
    addToCollection(cards.map((c) => c.id));
  }

  function drawPro() {
    alert(
      'Pro 구독 시 매번 ' +
        PRO_DRAW_COUNT +
        '장 뽑기 + 무제한 호출량 + Premium S 풀 ($9/월)\n\n다음 세션 결제 연동 예정.',
    );
  }

  function flip(id: string) {
    setFlipped((s) => new Set(s).add(id));
  }

  function reset() {
    setDrawn([]);
    setFlipped(new Set());
  }

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-4rem)] flex-col md:-mx-6 md:-my-12">
      {/* 헤더 */}
      <header className="border-b border-brand-100 bg-cream-50 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <div>
            <p className="text-sm font-bold text-brand-900">🎴 우하귀 가챠</p>
            <p className="text-xs text-[color:var(--color-ink-600)]">
              검증된 등급 하네스 {CATALOG_SIZE}장 풀 — 바로 쓸 수 있는 자동화
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost text-xs">
              홈
            </Link>
            <Link href="/gallery" className="btn-ghost text-xs">
              🖼 갤러리
            </Link>
            <Link href="/interview" className="btn-ghost text-xs">
              맞춤 진단 →
            </Link>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[1100px] space-y-5">
          {/* 안내 */}
          {drawn.length === 0 ? (
            <IntroPanel
              filter={filter}
              setFilter={setFilter}
              remainingFree={remainingFree}
              totalDrawn={state.total_drawn}
              onDrawFree={drawFree}
              onDrawPro={drawPro}
            />
          ) : null}

          {/* 뽑힌 카드 */}
          {drawn.length > 0 ? (
            <div className="space-y-4">
              <p className="text-center text-sm font-bold text-brand-900">
                🎉 {drawn.length}장 뽑았어요! 카드를 탭해서 등급을 확인하세요
              </p>
              <div className="mx-auto grid max-w-[700px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {drawn.map((h) => (
                  <HarnessGradeCard
                    key={h.id}
                    title={h.title}
                    domain={h.domain}
                    description={h.description}
                    grade={h.grade}
                    score={{
                      total: h.total,
                      axes: h.axes,
                      auto_score: h.total,
                      user_score: null,
                      user_review_count: 0,
                      measured_at: h.verified_at,
                    }}
                    creature_emoji={h.creature_emoji}
                    builder_type={h.builder_type}
                    builder_name={h.builder_name}
                    flipped={flipped.has(h.id)}
                    onClick={() => flip(h.id)}
                  />
                ))}
              </div>

              {flipped.size === drawn.length ? (
                <div className="card text-center md:p-5">
                  <p className="text-sm font-bold text-brand-900">마음에 드는 하네스를 골라보세요</p>
                  <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
                    실제 자동화 가동은 Pro 구독 ($9/월) — Claude Desktop·Cursor MCP 연동.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <button type="button" onClick={drawPro} className="btn-cta">
                      Pro 구독하기
                    </button>
                    <button type="button" onClick={reset} className="btn-ghost">
                      다시 뽑기 (다른 필터)
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function IntroPanel({
  filter,
  setFilter,
  remainingFree,
  totalDrawn,
  onDrawFree,
  onDrawPro,
}: {
  filter: BuilderFilter;
  setFilter: (f: BuilderFilter) => void;
  remainingFree: number;
  totalDrawn: number;
  onDrawFree: () => void;
  onDrawPro: () => void;
}) {
  const poolSize = filterCatalog(filter).length;

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

      {/* 필터 */}
      <div className="card md:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">빌더 종류</p>
        <div className="mt-2 flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            전체
          </FilterButton>
          <FilterButton active={filter === 'human'} onClick={() => setFilter('human')}>
            👤 사람 빌더
          </FilterButton>
          <FilterButton active={filter === 'ai'} onClick={() => setFilter('ai')}>
            🤖 AI 빌더
          </FilterButton>
        </div>
        <p className="mt-2 text-[11px] text-[color:var(--color-ink-600)]">
          사람 빌더 = 도메인 깊이·실 운영 검증. AI 빌더 = 표준화·일관성·즉시 가동.
        </p>
      </div>

      {/* 뽑기 버튼 */}
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
              disabled={remainingFree === 0 || poolSize === 0}
              className="btn-cta mt-3 w-full disabled:opacity-50"
            >
              {remainingFree === 0 ? '내일 다시' : poolSize === 0 ? '풀 비어있음' : '🎴 무료 1장 뽑기'}
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

      {/* 인터뷰 추천 */}
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
