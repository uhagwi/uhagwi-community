'use client';

import Link from 'next/link';
import { HarnessGradeCard } from '@/components/HarnessGradeCard';
import type { GachaHarness } from '@/lib/gacha/catalog-seed';
import type { GalleryFilter } from './types';

interface Props {
  filtered: GachaHarness[];
  collection: string[];
  filter: GalleryFilter;
}

export function GalleryGrid({ filtered, collection, filter }: Props) {
  if (filtered.length === 0) return <EmptyState filter={filter} />;

  return (
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
