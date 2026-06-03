'use client';

// 나만의 하네스 에디터 — 상태 훅 (Phase 1)
// 마운트 시 localStorage에서 드래프트 로드, 없으면 빈 드래프트 생성.
// 모든 변경 후 saveBuildDraft() 자동 호출.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Block,
  type BlockKind,
  type HarnessDraft,
  loadBuildDraft,
  saveBuildDraft,
} from '@/lib/build/draft';

// 5슬롯 배열 키 (persona는 단일 객체라 별도)
export type ArraySlot = 'memory' | 'skills' | 'agents' | 'tools' | 'gates';
export type ActiveSlot = ArraySlot | null;

// 인라인 편집 상태
export interface EditTarget {
  slot: ArraySlot;
  id: string;
}

let _idSeq = 0;
export function genBlockId(kind: BlockKind): string {
  _idSeq += 1;
  return `${kind}_${Date.now().toString(36)}_${_idSeq}`;
}

// 빈 드래프트 생성 (origin: blank)
function blankDraft(): HarnessDraft {
  return {
    version: 1,
    persona: { name: '', job: '', tone: '' },
    memory: [],
    skills: [],
    agents: [],
    tools: [],
    gates: [],
    origin: 'blank',
    createdAt: new Date().toISOString(),
  };
}

export function useBuildState() {
  const [draft, setDraft] = useState<HarnessDraft>(blankDraft);
  const [loaded, setLoaded] = useState(false);
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>('skills');
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const initialMount = useRef(true);

  // 마운트 시 localStorage에서 로드
  useEffect(() => {
    const saved = loadBuildDraft();
    if (saved) setDraft(saved);
    setLoaded(true);
  }, []);

  // 드래프트 변경 시 자동 저장 (초기 마운트 직후 1회는 건너뜀)
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (loaded) saveBuildDraft(draft);
  }, [draft, loaded]);

  // 페르소나 업데이트
  const updatePersona = useCallback((patch: Partial<HarnessDraft['persona']>) => {
    setDraft((prev) => ({
      ...prev,
      version: prev.version + 1,
      persona: { ...prev.persona, ...patch },
    }));
  }, []);

  // 블록 추가
  const addBlock = useCallback((slot: ArraySlot, block: Block) => {
    setDraft((prev) => ({
      ...prev,
      version: prev.version + 1,
      [slot]: [...prev[slot], block],
    }));
  }, []);

  // 블록 삭제
  const removeBlock = useCallback((slot: ArraySlot, id: string) => {
    setDraft((prev) => ({
      ...prev,
      version: prev.version + 1,
      [slot]: prev[slot].filter((b) => b.id !== id),
    }));
    // 삭제한 블록이 편집 중이면 편집 닫기
    setEditTarget((prev) => (prev?.id === id ? null : prev));
  }, []);

  // 블록 부분 수정 (label / body)
  const updateBlock = useCallback(
    (slot: ArraySlot, id: string, patch: Partial<Pick<Block, 'label' | 'body'>>) => {
      setDraft((prev) => ({
        ...prev,
        version: prev.version + 1,
        [slot]: prev[slot].map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }));
    },
    [],
  );

  // 인라인 편집 토글
  const toggleEdit = useCallback((slot: ArraySlot, id: string) => {
    setEditTarget((prev) => (prev?.id === id ? null : { slot, id }));
  }, []);

  const closeEdit = useCallback(() => setEditTarget(null), []);

  return {
    draft,
    loaded,
    activeSlot,
    setActiveSlot,
    editTarget,
    toggleEdit,
    closeEdit,
    updatePersona,
    addBlock,
    removeBlock,
    updateBlock,
  };
}
