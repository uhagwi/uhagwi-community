'use client';

// 나만의 하네스 에디터 — Phase 0 placeholder.
// 인터뷰 핸드오프 드래프트를 읽어 "무엇이 자동으로 채워졌는지" 미리보기.
// 실제 6슬롯 조립 UI는 Phase 1에서 이 자리에 붙는다.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadBuildDraft, type Block, type HarnessDraft } from '@/lib/build/draft';

const SLOT_META: Array<{ key: keyof Pick<HarnessDraft, 'memory' | 'skills' | 'agents' | 'tools' | 'gates'>; emoji: string; label: string }> = [
  { key: 'memory', emoji: '🧠', label: '메모리' },
  { key: 'skills', emoji: '📋', label: '스킬' },
  { key: 'agents', emoji: '🤖', label: '에이전트' },
  { key: 'tools', emoji: '🛠', label: '도구' },
  { key: 'gates', emoji: '✅', label: '가드레일' },
];

function SlotPreview({ emoji, label, blocks }: { emoji: string; label: string; blocks: Block[] }) {
  return (
    <div className="card md:p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
        {emoji} {label} · {blocks.length}
      </p>
      {blocks.length === 0 ? (
        <p className="mt-2 text-xs text-[color:var(--color-ink-600)]">비어 있음 — 에디터에서 직접 채우기</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {blocks.map((b) => (
            <li key={b.id} className="rounded-card border border-brand-100 bg-white px-3 py-2">
              <p className="text-sm font-semibold text-brand-900">{b.label}</p>
              {b.body ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--color-ink-600)]">{b.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BuildPage() {
  const [draft, setDraft] = useState<HarnessDraft | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDraft(loadBuildDraft());
    setLoaded(true);
  }, []);

  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 md:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">나만의 하네스 만들기</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-brand-900 md:text-3xl">🧩 하네스 에디터</h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-600)]">
          메모리·스킬·에이전트·도구·가드레일 블록을 끼워 나만의 하네스를 조립합니다.
        </p>
      </header>

      {!loaded ? (
        <div className="card md:p-6">불러오는 중…</div>
      ) : !draft ? (
        <div className="card md:p-6">
          <p className="text-sm text-brand-800">아직 만들던 하네스가 없어요.</p>
          <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
            인터뷰로 진단하면 추천 블록이 자동으로 채워집니다.
          </p>
          <Link href="/interview" className="btn-cta mt-4 inline-flex">진단 시작하기 →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 페르소나 */}
          <div className="card md:p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">🎭 페르소나</p>
            <h2 className="mt-1 font-display text-xl font-bold text-brand-900">{draft.persona.name}</h2>
            <p className="text-xs text-brand-600">{draft.persona.job}</p>
            <p className="mt-1.5 text-sm text-brand-800">{draft.persona.tone}</p>
          </div>

          {SLOT_META.map((s) => (
            <SlotPreview key={s.key} emoji={s.emoji} label={s.label} blocks={draft[s.key]} />
          ))}

          {/* Phase 1 안내 — 아직 조립 UI는 미구현 */}
          <div className="card border-2 border-dashed border-brand-300 md:p-5">
            <p className="text-sm font-bold text-brand-900">🚧 조립 에디터 준비 중 (Phase 1)</p>
            <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
              위 블록들을 직접 끼우고·빼고·고치는 드래그 없는 클릭 조립 UI가 곧 이 자리에 열립니다.
              지금은 인터뷰 진단이 무엇을 채웠는지 미리보기만 제공해요.
            </p>
            <div className="mt-3 flex gap-2">
              <Link href="/interview" className="btn-ghost !py-2.5 text-sm">진단 다시 하기</Link>
              <Link href="/" className="btn-ghost !py-2.5 text-sm">홈으로</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
