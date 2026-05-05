'use client';

import { HarnessGradeCard } from '@/components/HarnessGradeCard';
import type { GachaHarness } from '@/lib/gacha/catalog-seed';

interface Props {
  drawn: GachaHarness[];
  flipped: Set<string>;
  collected: Set<string>;
  onFlip: (id: string) => void;
  onCollectOne: (id: string) => void;
  onCollectAll: () => void;
  onDrawPro: () => void;
  onReset: () => void;
}

export function DrawnGrid({
  drawn,
  flipped,
  collected,
  onFlip,
  onCollectOne,
  onCollectAll,
  onDrawPro,
  onReset,
}: Props) {
  const allFlipped = flipped.size === drawn.length;
  const allCollected = drawn.every((c) => collected.has(c.id));

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-bold text-brand-900">
        🎉 {drawn.length}장 뽑았어요! 카드를 탭해서 등급을 확인하세요
      </p>
      <div className="mx-auto grid max-w-[700px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {drawn.map((h) => {
          const isFlipped = flipped.has(h.id);
          const isCollected = collected.has(h.id);
          return (
            <div key={h.id} className="space-y-2">
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
                flipped={isFlipped}
                onClick={() => onFlip(h.id)}
              />
              {isFlipped ? (
                <button
                  type="button"
                  onClick={() => onCollectOne(h.id)}
                  disabled={isCollected}
                  className={`w-full rounded-card border px-2 py-1.5 text-[11px] font-bold transition disabled:cursor-default ${
                    isCollected
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-brand-400 bg-white text-brand-800 hover:bg-brand-50'
                  }`}
                >
                  {isCollected ? '✅ 컬렉션에 있음' : '📦 내 컬렉션에 등록'}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {allFlipped ? (
        <div className="card text-center md:p-5">
          <p className="text-sm font-bold text-brand-900">
            마음에 드는 카드를 내 컬렉션에 등록하세요
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
            <strong>등록은 무료·무제한</strong> · 뽑기 횟수와 분리.
            <br />
            실제 자동화 가동(MCP 연동)은 Pro 구독 ($9/월) — 별도.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onCollectAll}
              disabled={allCollected}
              className="btn-cta disabled:opacity-50"
            >
              📦 전부 등록 (무료)
            </button>
            <button type="button" onClick={onDrawPro} className="btn-ghost">
              Pro 구독 (자동화 가동)
            </button>
            <button type="button" onClick={onReset} className="btn-ghost">
              다시 뽑기
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
