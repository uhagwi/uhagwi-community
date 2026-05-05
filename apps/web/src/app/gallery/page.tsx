'use client';

/**
 * /gallery — 우하귀 전체 카탈로그 갤러리.
 * 사용자 정의: "다른 사람들이 만든 거 + 내가 뽑은 거 보기".
 *
 * 4 필터: 전체 / 내 컬렉션 / 사람 빌더 / AI 빌더
 * 도메인 필터, 등급 정렬도 추가.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { HarnessGradeCard } from '@/components/HarnessGradeCard';
import {
  CATALOG_SIZE,
  GACHA_CATALOG,
  loadCollection,
  type GachaHarness,
} from '@/lib/gacha/catalog-seed';
import type { BenchmarkDomain, Grade } from '@/lib/grades';

type GalleryFilter = 'all' | 'mine' | 'human' | 'ai';
type DomainFilter = 'all' | BenchmarkDomain;
type SortBy = 'grade' | 'recent' | 'domain';

const DOMAIN_LABELS: Record<BenchmarkDomain, { emoji: string; label: string }> = {
  education: { emoji: '🎓', label: '교육' },
  admin: { emoji: '🏛', label: '행정' },
  cafe_business: { emoji: '☕', label: '자영업' },
  research: { emoji: '🔬', label: '연구' },
  design: { emoji: '🎨', label: '디자인' },
  engineering: { emoji: '💻', label: '개발' },
  general: { emoji: '🌐', label: '일반' },
};

const GRADE_ORDER: Record<Grade, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };

export default function GalleryPage() {
  const [collection, setCollection] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [domainFilter, setDomainFilter] = useState<DomainFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('grade');

  useEffect(() => {
    setCollection(loadCollection());
    setHydrated(true);
  }, []);

  const filtered = useMemo(() => {
    let list: GachaHarness[] = [...GACHA_CATALOG];

    // 빌더·컬렉션 필터
    if (filter === 'mine') list = list.filter((h) => collection.includes(h.id));
    else if (filter === 'human') list = list.filter((h) => h.builder_type === 'human');
    else if (filter === 'ai') list = list.filter((h) => h.builder_type === 'ai');

    // 도메인 필터
    if (domainFilter !== 'all') list = list.filter((h) => h.domain === domainFilter);

    // 정렬
    if (sortBy === 'grade') {
      list.sort((a, b) => GRADE_ORDER[b.grade] - GRADE_ORDER[a.grade] || b.total - a.total);
    } else if (sortBy === 'recent') {
      list.sort((a, b) => (a.verified_at < b.verified_at ? 1 : -1));
    } else {
      list.sort((a, b) => a.domain.localeCompare(b.domain));
    }

    return list;
  }, [filter, domainFilter, sortBy, collection]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[760px] py-16 text-center">
        <p className="text-sm text-[color:var(--color-ink-600)]">불러오는 중…</p>
      </div>
    );
  }

  const collectionPct = Math.round((collection.length / CATALOG_SIZE) * 100);

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-4rem)] flex-col md:-mx-6 md:-my-12">
      {/* 헤더 */}
      <header className="border-b border-brand-100 bg-cream-50 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <div>
            <p className="text-sm font-bold text-brand-900">🖼 우하귀 갤러리</p>
            <p className="text-xs text-[color:var(--color-ink-600)]">
              전체 {CATALOG_SIZE}장 · 내 컬렉션 {collection.length}/{CATALOG_SIZE} ({collectionPct}%)
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost text-xs">
              홈
            </Link>
            <Link href="/gacha" className="btn-cta text-xs">
              🎴 뽑기
            </Link>
          </div>
        </div>
      </header>

      {/* 필터 */}
      <div className="border-b border-brand-100 bg-white px-4 py-3 md:px-6">
        <div className="mx-auto max-w-[1100px] space-y-3">
          {/* 1차 필터: 빌더·컬렉션 */}
          <div className="flex flex-wrap gap-2">
            <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
              전체 ({CATALOG_SIZE})
            </FilterBtn>
            <FilterBtn active={filter === 'mine'} onClick={() => setFilter('mine')}>
              ✨ 내 컬렉션 ({collection.length})
            </FilterBtn>
            <FilterBtn active={filter === 'human'} onClick={() => setFilter('human')}>
              👤 사람 빌더
            </FilterBtn>
            <FilterBtn active={filter === 'ai'} onClick={() => setFilter('ai')}>
              🤖 AI 빌더
            </FilterBtn>
          </div>

          {/* 2차 필터: 도메인 */}
          <div className="flex flex-wrap gap-1.5">
            <DomainBtn active={domainFilter === 'all'} onClick={() => setDomainFilter('all')}>
              전체 도메인
            </DomainBtn>
            {(Object.entries(DOMAIN_LABELS) as Array<[BenchmarkDomain, { emoji: string; label: string }]>).map(
              ([d, meta]) => (
                <DomainBtn key={d} active={domainFilter === d} onClick={() => setDomainFilter(d)}>
                  {meta.emoji} {meta.label}
                </DomainBtn>
              ),
            )}
          </div>

          {/* 정렬 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[color:var(--color-ink-600)]">정렬:</span>
            <SortBtn active={sortBy === 'grade'} onClick={() => setSortBy('grade')}>
              등급순
            </SortBtn>
            <SortBtn active={sortBy === 'recent'} onClick={() => setSortBy('recent')}>
              최신순
            </SortBtn>
            <SortBtn active={sortBy === 'domain'} onClick={() => setSortBy('domain')}>
              도메인순
            </SortBtn>
          </div>
        </div>
      </div>

      {/* 본문 그리드 */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[1100px]">
          {filtered.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <>
              <p className="mb-3 text-xs text-[color:var(--color-ink-600)]">
                {filtered.length}장 표시 중
              </p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {filtered.map((h) => {
                  const isCollected = collection.includes(h.id);
                  return (
                    <div key={h.id}>
                      <HarnessGradeCard
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
                        flipped={isCollected}
                        lockedHint={!isCollected}
                        onClick={
                          !isCollected
                            ? () => {
                                window.location.href = '/gacha';
                              }
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* 푸터 CTA */}
      <footer className="border-t border-brand-100 bg-cream-50 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-2">
          <p className="text-xs text-[color:var(--color-ink-600)]">
            컬렉션 {collection.length}/{CATALOG_SIZE} 채우셨어요
          </p>
          <Link href="/gacha" className="btn-cta text-xs">
            🎴 더 뽑기
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FilterBtn({
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
      className={`rounded-card border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-brand-200 bg-cream-50 text-brand-800 hover:bg-brand-50'
      }`}
    >
      {children}
    </button>
  );
}

function DomainBtn({
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
      className={`rounded-pill border px-2.5 py-1 text-[11px] transition ${
        active
          ? 'border-brand-400 bg-brand-100 text-brand-800'
          : 'border-brand-100 bg-white text-[color:var(--color-ink-600)] hover:bg-cream-50'
      }`}
    >
      {children}
    </button>
  );
}

function SortBtn({
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
      className={`rounded-card px-2 py-0.5 transition ${
        active ? 'bg-brand-100 font-bold text-brand-800' : 'text-[color:var(--color-ink-600)] hover:bg-cream-50'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ filter }: { filter: GalleryFilter }) {
  return (
    <div className="card text-center md:p-10">
      <p className="text-4xl">🌊</p>
      <p className="mt-3 text-sm font-bold text-brand-900">
        {filter === 'mine' ? '아직 뽑은 카드가 없어요' : '필터에 맞는 카드가 없어요'}
      </p>
      <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
        {filter === 'mine'
          ? '가챠에서 1장 뽑으면 여기에 모입니다.'
          : '다른 필터를 선택해보세요.'}
      </p>
      {filter === 'mine' ? (
        <Link href="/gacha" className="btn-cta mt-4 inline-flex">
          🎴 가챠로 첫 카드 뽑기 →
        </Link>
      ) : null}
    </div>
  );
}
