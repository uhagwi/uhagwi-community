'use client';

// 슬롯 카드 — 헤더(이모지+라벨+개수) + 블록 칩 목록 + 인라인 편집

import type { Block } from '@/lib/build/draft';
import type { ArraySlot, EditTarget } from '../use-build-state';

interface SlotCardProps {
  slot: ArraySlot;
  emoji: string;
  label: string;
  blocks: Block[];
  isActive: boolean;
  editTarget: EditTarget | null;
  onActivate: () => void;
  onRemove: (id: string) => void;
  onToggleEdit: (id: string) => void;
  onUpdateBlock: (id: string, patch: Partial<Pick<Block, 'label' | 'body'>>) => void;
}

export function SlotCard({
  slot,
  emoji,
  label,
  blocks,
  isActive,
  editTarget,
  onActivate,
  onRemove,
  onToggleEdit,
  onUpdateBlock,
}: SlotCardProps) {
  const borderCls = isActive
    ? 'border-2 border-brand-500 shadow-card'
    : 'border border-brand-100';

  return (
    <div
      className={`rounded-card bg-white p-4 transition-all cursor-pointer ${borderCls}`}
      onClick={onActivate}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
          {emoji} {label}
          <span className="ml-1.5 rounded-pill bg-brand-100 px-2 py-0.5 text-[10px] text-brand-700">
            {blocks.length}
          </span>
        </p>
        {isActive && (
          <span className="rounded-pill bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
            활성
          </span>
        )}
      </div>

      {/* 블록 칩 목록 */}
      <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
        {blocks.length === 0 ? (
          <p className="text-xs text-[color:var(--color-ink-600)]">비어 있음 — 왼쪽에서 블록 추가</p>
        ) : (
          blocks.map((b) => {
            const isEditing = editTarget?.id === b.id && editTarget?.slot === slot;
            return (
              <div key={b.id}>
                {/* 칩 행 */}
                <div className="flex items-center gap-2 rounded-card border border-brand-100 bg-cream-50 px-3 py-2">
                  <button
                    type="button"
                    className="flex-1 text-left text-sm font-semibold text-brand-900 hover:text-brand-600"
                    onClick={() => onToggleEdit(b.id)}
                    title="클릭하여 편집"
                  >
                    {b.label || <span className="text-brand-400">(라벨 없음)</span>}
                  </button>
                  <span className="rounded-pill border border-brand-200 px-1.5 py-0.5 text-[9px] text-brand-500">
                    {b.source === 'recommended' ? '추천' : b.source === 'custom' ? '직접' : b.source}
                  </span>
                  <button
                    type="button"
                    aria-label="블록 삭제"
                    className="text-brand-400 hover:text-red-500 transition-colors text-sm font-bold leading-none"
                    onClick={() => onRemove(b.id)}
                  >
                    ×
                  </button>
                </div>

                {/* 인라인 편집 패널 */}
                {isEditing && (
                  <div className="mt-1.5 rounded-card border border-brand-300 bg-white p-3 space-y-2">
                    <label className="block">
                      <span className="text-[10px] font-bold text-brand-600">라벨</span>
                      <input
                        type="text"
                        className="mt-0.5 w-full rounded-[8px] border border-brand-200 bg-cream-50 px-3 py-1.5 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
                        value={b.label}
                        onChange={(e) => onUpdateBlock(b.id, { label: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="라벨 입력"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold text-brand-600">설명</span>
                      <textarea
                        className="mt-0.5 w-full rounded-[8px] border border-brand-200 bg-cream-50 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                        rows={3}
                        value={b.body}
                        onChange={(e) => onUpdateBlock(b.id, { body: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="설명 입력"
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
