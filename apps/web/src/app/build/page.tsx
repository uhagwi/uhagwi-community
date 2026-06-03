'use client';

// 나만의 하네스 에디터 — Phase 4 컨테이너.
// 3-pane 레이아웃: 좌(카탈로그) / 중앙(캔버스) / 우(미리보기+발행+히스토리).
// 드래프트는 localStorage에서만 로드 (useSearchParams 미사용).

import { useState } from 'react';
import Link from 'next/link';
import { useBuildState } from './use-build-state';
import { Catalog } from './_components/Catalog';
import { Canvas } from './_components/Canvas';
import { Preview } from './_components/Preview';
import { PublishBar } from './_components/PublishBar';
import { VersionTimeline } from './_components/VersionTimeline';

export default function BuildPage() {
  const state = useBuildState();
  const {
    draft,
    loaded,
    activeSlot,
    setActiveSlot,
    editTarget,
    toggleEdit,
    updatePersona,
    addBlock,
    removeBlock,
    updateBlock,
  } = state;
  // 버전 저장 / 발행 성공 시 VersionTimeline 재로드를 위한 key
  const [historyKey, setHistoryKey] = useState(0);
  function handleVersionSaved() {
    setHistoryKey((k) => k + 1);
  }

  // 로딩 중
  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
        <div className="card md:p-6 text-sm text-brand-700">불러오는 중…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-6">
      {/* 페이지 헤더 */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
            나만의 하네스 만들기
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-brand-900 md:text-3xl">
            🧩 하네스 에디터
          </h1>
          <p className="mt-1.5 text-sm text-[color:var(--color-ink-600)]">
            메모리·스킬·에이전트·도구·가드레일 블록을 끼워 나만의 하네스를 조립합니다.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/interview" className="btn-ghost !py-2 text-sm">
            진단 다시 하기
          </Link>
          <Link href="/" className="btn-ghost !py-2 text-sm">
            홈
          </Link>
        </div>
      </header>

      {/* 드래프트 없음 안내 */}
      {draft.origin === 'blank' && draft.persona.name === '' && (
        <div className="mb-4 rounded-card border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          💡 인터뷰 진단을 마치면 추천 블록이 자동으로 채워져요.{' '}
          <Link href="/interview" className="font-semibold underline hover:text-brand-600">
            진단 시작하기 →
          </Link>
        </div>
      )}

      {/* 3-pane 레이아웃 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
        {/* 좌측 — 카탈로그 (≈280px) */}
        <aside className="w-full md:w-[280px] md:shrink-0">
          <Catalog
            activeSlot={activeSlot}
            onAddBlock={(slot, block) => {
              addBlock(slot, block);
              setActiveSlot(slot);
            }}
          />
        </aside>

        {/* 중앙 — 캔버스 (flex) */}
        <main className="min-w-0 flex-1">
          <Canvas
            draft={draft}
            activeSlot={activeSlot}
            editTarget={editTarget}
            onUpdatePersona={updatePersona}
            onSetActiveSlot={setActiveSlot}
            onRemoveBlock={removeBlock}
            onToggleEdit={toggleEdit}
            onUpdateBlock={updateBlock}
          />
        </main>

        {/* 우측 — 미리보기 + 발행 + 버전 히스토리 (≈300px) */}
        <aside className="w-full md:w-[300px] md:shrink-0 flex flex-col gap-4">
          <Preview draft={draft} />
          <PublishBar draft={draft} onVersionSaved={handleVersionSaved} />
          <VersionTimeline draftId={draft.id} refreshKey={historyKey} />
        </aside>
      </div>
    </div>
  );
}
