'use client';

// 캔버스 — 중앙 패널. 페르소나 편집 + 5개 SlotCard 표시.

import type { HarnessDraft, Block } from '@/lib/build/draft';
import type { ArraySlot, ActiveSlot, EditTarget } from '../use-build-state';
import { SlotCard } from './SlotCard';

// 슬롯 메타 순서 (이모지·라벨)
export const SLOT_META: Array<{ key: ArraySlot; emoji: string; label: string }> = [
  { key: 'memory',  emoji: '🧠', label: '메모리' },
  { key: 'skills',  emoji: '📋', label: '스킬' },
  { key: 'agents',  emoji: '🤖', label: '에이전트' },
  { key: 'tools',   emoji: '🛠',  label: '도구' },
  { key: 'gates',   emoji: '✅', label: '가드레일' },
];

interface CanvasProps {
  draft: HarnessDraft;
  activeSlot: ActiveSlot;
  editTarget: EditTarget | null;
  onUpdatePersona: (patch: Partial<HarnessDraft['persona']>) => void;
  onSetActiveSlot: (slot: ArraySlot) => void;
  onRemoveBlock: (slot: ArraySlot, id: string) => void;
  onToggleEdit: (slot: ArraySlot, id: string) => void;
  onUpdateBlock: (slot: ArraySlot, id: string, patch: Partial<Pick<Block, 'label' | 'body'>>) => void;
}

export function Canvas({
  draft,
  activeSlot,
  editTarget,
  onUpdatePersona,
  onSetActiveSlot,
  onRemoveBlock,
  onToggleEdit,
  onUpdateBlock,
}: CanvasProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 페르소나 편집 */}
      <div className="card md:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">🎭 페르소나</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-bold text-brand-600">이름</span>
            <input
              type="text"
              className="mt-0.5 w-full rounded-[8px] border border-brand-200 bg-cream-50 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={draft.persona.name}
              onChange={(e) => onUpdatePersona({ name: e.target.value })}
              placeholder="예: 리서치봇"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-brand-600">직업</span>
            <input
              type="text"
              className="mt-0.5 w-full rounded-[8px] border border-brand-200 bg-cream-50 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={draft.persona.job}
              onChange={(e) => onUpdatePersona({ job: e.target.value })}
              placeholder="예: 리서처"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-brand-600">톤</span>
            <input
              type="text"
              className="mt-0.5 w-full rounded-[8px] border border-brand-200 bg-cream-50 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={draft.persona.tone}
              onChange={(e) => onUpdatePersona({ tone: e.target.value })}
              placeholder="예: 침착하고 논리적"
            />
          </label>
        </div>
      </div>

      {/* 5슬롯 */}
      {SLOT_META.map(({ key, emoji, label }) => (
        <SlotCard
          key={key}
          slot={key}
          emoji={emoji}
          label={label}
          blocks={draft[key]}
          isActive={activeSlot === key}
          editTarget={editTarget}
          onActivate={() => onSetActiveSlot(key)}
          onRemove={(id) => onRemoveBlock(key, id)}
          onToggleEdit={(id) => onToggleEdit(key, id)}
          onUpdateBlock={(id, patch) => onUpdateBlock(key, id, patch)}
        />
      ))}
    </div>
  );
}
