'use client';

/**
 * /gallery — 우하귀 전체 카탈로그 갤러리.
 * 4 필터(전체·내 컬렉션·사람·AI) + 도메인 필터 + 정렬 + 그리드.
 * 섹션은 _components/ (FilterBar · GalleryGrid · types)로 분할.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  CATALOG_SIZE,
  GACHA_CATALOG,
  loadCollection,
  type GachaHarness,
} from '@/lib/gacha/catalog-seed';
import { FilterBar } from './_components/FilterBar';
import { GalleryGrid } from './_components/GalleryGrid';
import {
  GRADE_ORDER,
  type DomainFilter,
  type GalleryFilter,
  type SortBy,
} from './_components/types';

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

    if (filter === 'mine') list = list.filter((h) => collection.includes(h.id));
    else if (filter === 'human') list = list.filter((h) => h.builder_type === 'human');
    else if (filter === 'ai') list = list.filter((h) => h.builder_type === 'ai');

    if (domainFilter !== 'all') list = list.filter((h) => h.domain === domainFilter);

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
      <header className="border-b border-brand-100 bg-cream-50 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <div>
            <p className="text-sm font-bold text-brand-900">🖼 우하귀 갤러리</p>
            <p className="text-xs text-[color:var(--color-ink-600)]">
              전체 {CATALOG_SIZE}장 · 내 컬렉션 {collection.length}/{CATALOG_SIZE} ({collectionPct}%)
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost text-xs">홈</Link>
            <Link href="/gacha" className="btn-cta text-xs">🎴 뽑기</Link>
          </div>
        </div>
      </header>

      <FilterBar
        filter={filter}
        setFilter={setFilter}
        domainFilter={domainFilter}
        setDomainFilter={setDomainFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={CATALOG_SIZE}
        myCount={collection.length}
      />

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[1100px]">
          <GalleryGrid filtered={filtered} collection={collection} filter={filter} />
        </div>
      </main>

      <footer className="border-t border-brand-100 bg-cream-50 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-2">
          <p className="text-xs text-[color:var(--color-ink-600)]">
            컬렉션 {collection.length}/{CATALOG_SIZE} 채우셨어요
          </p>
          <Link href="/gacha" className="btn-cta text-xs">🎴 더 뽑기</Link>
        </div>
      </footer>
    </div>
  );
}
