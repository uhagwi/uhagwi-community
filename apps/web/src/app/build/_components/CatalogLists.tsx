'use client';

// 카탈로그 리스트 서브컴포넌트 — 기성(CatalogShelf) / 이식(ImportShelf).
// Catalog.tsx에서 분리해 파일 크기 제한(≤300줄) 충족.

import { useState } from 'react';
import type { BlockKind } from '@/lib/build/draft';
import type { ArraySlot } from '../use-build-state';
import { genBlockId } from '../use-build-state';
import type { Block } from '@/lib/build/draft';
import { SLOT_META } from './Canvas';
import {
  CATALOG_SEED,
  getImportItems,
  type ImportItem,
} from '@/lib/build/catalog-seed';

// BlockKind → ArraySlot 매핑 (persona 제외) — Catalog.tsx와 동일 매핑 재선언
const KIND_TO_SLOT: Record<Exclude<BlockKind, 'persona'>, ArraySlot> = {
  memory: 'memory',
  skill:  'skills',
  agent:  'agents',
  tool:   'tools',
  gate:   'gates',
};

interface ShelfProps {
  onAddBlock: (slot: ArraySlot, block: Block) => void;
}

// ─── 기성 블록 선반 ────────────────────────────────────────────────────────

/** kind별로 그룹핑해 SLOT_META 순서대로 렌더링 */
export function CatalogShelf({ onAddBlock }: ShelfProps) {
  // 마지막으로 클릭한 블록 id 추적 (클릭 피드백용)
  const [recentId, setRecentId] = useState<string | null>(null);

  const handleAdd = (kind: Exclude<BlockKind, 'persona'>, label: string, body: string) => {
    const id = genBlockId(kind);
    const slot = KIND_TO_SLOT[kind];
    onAddBlock(slot, { id, kind, label, body, source: 'catalog' });
    // 0.8초 강조 후 초기화
    setRecentId(`${kind}:${label}`);
    setTimeout(() => setRecentId(null), 800);
  };

  return (
    <div className="flex flex-col gap-4">
      {SLOT_META.map(({ key: slotKey, emoji, label: slotLabel }) => {
        // slotKey → kind 변환
        const kindMap: Record<ArraySlot, Exclude<BlockKind, 'persona'>> = {
          memory: 'memory',
          skills: 'skill',
          agents: 'agent',
          tools:  'tool',
          gates:  'gate',
        };
        const kind = kindMap[slotKey];
        const items = CATALOG_SEED.filter((s) => s.kind === kind);
        if (items.length === 0) return null;

        return (
          <div key={slotKey} className="card md:p-4">
            {/* 그룹 헤더 */}
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-600">
              {emoji} {slotLabel}
            </p>
            <div className="flex flex-col gap-1.5">
              {items.map((item) => {
                const uid = `${item.kind}:${item.label}`;
                const isRecent = recentId === uid;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleAdd(item.kind, item.label, item.body)}
                    className={`w-full rounded-[8px] border px-3 py-2.5 text-left text-xs transition ${
                      isRecent
                        ? 'border-brand-500 bg-brand-100 text-brand-900'
                        : 'border-brand-100 bg-white text-brand-800 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    <span className="font-semibold">{item.label}</span>
                    <span className="ml-2 text-[10px] text-brand-500 line-clamp-1">{item.body}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 이식 선반 ─────────────────────────────────────────────────────────────

/** 쇼케이스 하네스 목록을 스킬로 이식 */
export function ImportShelf({ onAddBlock }: ShelfProps) {
  const [recentSlug, setRecentSlug] = useState<string | null>(null);
  const items: ImportItem[] = getImportItems();

  const handleImport = (item: ImportItem) => {
    const id = genBlockId('skill');
    onAddBlock('skills', {
      id,
      kind: 'skill',
      label: item.title,
      body: item.oneLiner,
      source: 'imported',
      meta: { slug: item.slug, emoji: item.emoji },
    });
    setRecentSlug(item.slug);
    setTimeout(() => setRecentSlug(null), 800);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 안내 문구 */}
      <p className="text-xs text-brand-500">
        남의 하네스를 내 스킬로 이식해 조합하세요
      </p>
      <div className="card md:p-4 flex flex-col gap-1.5">
        {items.map((item) => {
          const isRecent = recentSlug === item.slug;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => handleImport(item)}
              className={`w-full rounded-[8px] border px-3 py-2.5 text-left text-xs transition ${
                isRecent
                  ? 'border-brand-500 bg-brand-100 text-brand-900'
                  : 'border-brand-100 bg-white text-brand-800 hover:border-brand-300 hover:bg-brand-50'
              }`}
            >
              <span className="mr-1.5">{item.emoji}</span>
              <span className="font-semibold">{item.title}</span>
              <span className="ml-2 text-[10px] text-brand-500 line-clamp-1">{item.oneLiner}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
