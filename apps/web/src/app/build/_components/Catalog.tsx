'use client';

// 카탈로그 — 좌측 패널.
// 탭: 추천·기성·이식·직접 작성. Phase 1에서는 "직접 작성"만 작동.

import { useState } from 'react';
import type { BlockKind } from '@/lib/build/draft';
import type { ArraySlot, ActiveSlot } from '../use-build-state';
import { genBlockId } from '../use-build-state';
import type { Block } from '@/lib/build/draft';
import { SLOT_META } from './Canvas';

// BlockKind → ArraySlot 매핑 (persona 제외)
const KIND_TO_SLOT: Record<Exclude<BlockKind, 'persona'>, ArraySlot> = {
  memory:  'memory',
  skill:   'skills',
  agent:   'agents',
  tool:    'tools',
  gate:    'gates',
};

const SLOT_TO_KIND: Record<ArraySlot, Exclude<BlockKind, 'persona'>> = {
  memory:  'memory',
  skills:  'skill',
  agents:  'agent',
  tools:   'tool',
  gates:   'gate',
};

type TabKey = '추천' | '기성' | '이식' | '직접 작성';
const TABS: TabKey[] = ['추천', '기성', '이식', '직접 작성'];

interface CatalogProps {
  activeSlot: ActiveSlot;
  onAddBlock: (slot: ArraySlot, block: Block) => void;
}

export function Catalog({ activeSlot, onAddBlock }: CatalogProps) {
  const [tab, setTab] = useState<TabKey>('직접 작성');
  const [kind, setKind] = useState<Exclude<BlockKind, 'persona'>>('skill');
  const [label, setLabel] = useState('');
  const [body, setBody] = useState('');

  // 추가 버튼 클릭
  const handleAdd = () => {
    const trimLabel = label.trim();
    if (!trimLabel) return;
    const slot = KIND_TO_SLOT[kind];
    const block: Block = {
      id: genBlockId(kind),
      kind,
      label: trimLabel,
      body: body.trim(),
      source: 'custom',
    };
    onAddBlock(slot, block);
    setLabel('');
    setBody('');
  };

  // activeSlot 변경 시 kind 동기화
  const handleSlotKindSync = (s: ArraySlot) => {
    setKind(SLOT_TO_KIND[s]);
  };

  const currentSlotMeta = activeSlot
    ? SLOT_META.find((m) => m.key === activeSlot)
    : null;

  return (
    <div className="flex flex-col gap-3">
      {/* 현재 활성 슬롯 표시 */}
      <div className="rounded-card bg-brand-50 px-3 py-2 text-xs text-brand-700">
        {currentSlotMeta ? (
          <span>
            활성 슬롯: <strong>{currentSlotMeta.emoji} {currentSlotMeta.label}</strong>
          </span>
        ) : (
          <span className="text-brand-400">슬롯을 선택하세요</span>
        )}
      </div>

      {/* 탭 */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-pill px-3 py-1.5 text-xs font-semibold transition ${
              tab === t
                ? 'bg-brand-600 text-white'
                : 'border border-brand-200 bg-white text-brand-600 hover:bg-brand-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {tab !== '직접 작성' ? (
        <div className="card md:p-4 text-center">
          <p className="text-2xl">🔒</p>
          <p className="mt-2 text-sm font-semibold text-brand-800">{tab}</p>
          <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">Phase 3에서 열려요</p>
        </div>
      ) : (
        /* 직접 작성 폼 */
        <div className="card md:p-4 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">직접 작성</p>

          {/* kind 선택 */}
          <fieldset>
            <legend className="text-[10px] font-bold text-brand-600 mb-1.5">종류</legend>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(KIND_TO_SLOT) as Exclude<BlockKind, 'persona'>[]).map((k) => {
                const meta = SLOT_META.find((m) => SLOT_TO_KIND[m.key] === k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setKind(k);
                      handleSlotKindSync(KIND_TO_SLOT[k]);
                    }}
                    className={`rounded-[8px] border px-2 py-1.5 text-xs font-semibold transition text-left ${
                      kind === k
                        ? 'border-brand-500 bg-brand-50 text-brand-800'
                        : 'border-brand-100 bg-white text-brand-600 hover:border-brand-300'
                    }`}
                  >
                    {meta ? `${meta.emoji} ${meta.label}` : k}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 라벨 */}
          <label className="block">
            <span className="text-[10px] font-bold text-brand-600">라벨 *</span>
            <input
              type="text"
              className="mt-0.5 w-full rounded-[8px] border border-brand-200 bg-cream-50 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="블록 이름"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            />
          </label>

          {/* 설명 */}
          <label className="block">
            <span className="text-[10px] font-bold text-brand-600">설명</span>
            <textarea
              className="mt-0.5 w-full rounded-[8px] border border-brand-200 bg-cream-50 px-3 py-2 text-xs text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="블록이 하는 일을 간략히 설명"
            />
          </label>

          {/* 추가 버튼 */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!label.trim()}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + 추가
          </button>
        </div>
      )}
    </div>
  );
}
