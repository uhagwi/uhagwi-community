'use client';

import type { BenchmarkDomain } from '@/lib/grades';
import {
  DOMAIN_LABELS,
  type DomainFilter,
  type GalleryFilter,
  type SortBy,
} from './types';

interface Props {
  filter: GalleryFilter;
  setFilter: (f: GalleryFilter) => void;
  domainFilter: DomainFilter;
  setDomainFilter: (d: DomainFilter) => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  totalCount: number;
  myCount: number;
}

export function FilterBar({
  filter,
  setFilter,
  domainFilter,
  setDomainFilter,
  sortBy,
  setSortBy,
  totalCount,
  myCount,
}: Props) {
  return (
    <div className="border-b border-brand-100 bg-white px-4 py-3 md:px-6">
      <div className="mx-auto max-w-[1100px] space-y-3">
        <div className="flex flex-wrap gap-2">
          <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
            전체 ({totalCount})
          </FilterBtn>
          <FilterBtn active={filter === 'mine'} onClick={() => setFilter('mine')}>
            ✨ 내 컬렉션 ({myCount})
          </FilterBtn>
          <FilterBtn active={filter === 'human'} onClick={() => setFilter('human')}>
            👤 사람 빌더
          </FilterBtn>
          <FilterBtn active={filter === 'ai'} onClick={() => setFilter('ai')}>
            🤖 AI 빌더
          </FilterBtn>
        </div>

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

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[color:var(--color-ink-600)]">정렬:</span>
          <SortBtn active={sortBy === 'grade'} onClick={() => setSortBy('grade')}>등급순</SortBtn>
          <SortBtn active={sortBy === 'recent'} onClick={() => setSortBy('recent')}>최신순</SortBtn>
          <SortBtn active={sortBy === 'domain'} onClick={() => setSortBy('domain')}>도메인순</SortBtn>
        </div>
      </div>
    </div>
  );
}

function FilterBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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
