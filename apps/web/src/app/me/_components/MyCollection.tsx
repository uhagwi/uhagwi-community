'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HarnessGradeCard } from '@/components/HarnessGradeCard';
import { GACHA_CATALOG, loadCollection } from '@/lib/gacha/catalog-seed';

export function MyCollection() {
  const [hydrated, setHydrated] = useState(false);
  const [collected, setCollected] = useState<string[]>([]);

  useEffect(() => {
    setCollected(loadCollection());
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="card py-8 text-center text-[color:var(--color-ink-600)]">불러오는 중…</div>
    );
  }

  const cards = GACHA_CATALOG.filter((h) => collected.includes(h.id));

  if (cards.length === 0) {
    return (
      <div className="card py-12 text-center">
        <p className="text-4xl">📭</p>
        <p className="mt-3 text-sm text-[color:var(--color-ink-600)]">
          아직 컬렉션에 등록한 하네스가 없어요.
        </p>
        <Link href="/gacha" className="btn-cta mt-4 inline-flex">
          🎴 가챠 뽑으러 가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-[color:var(--color-ink-600)]">
        총 <strong className="text-brand-700">{cards.length}장</strong> · 카드 클릭으로 상세 보기
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {cards.map((h) => (
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
            flipped
          />
        ))}
      </div>
    </div>
  );
}
