'use client';

// 미리보기 — 우측 패널. Phase 1 stub.
// 완성도 체크리스트 + 슬롯별 블록 총계. Mermaid는 Phase 2에서.

import type { HarnessDraft } from '@/lib/build/draft';
import { countBlocks } from '@/lib/build/draft';
import { SLOT_META } from './Canvas';

interface CheckItem {
  label: string;
  pass: boolean;
}

function buildChecklist(draft: HarnessDraft): CheckItem[] {
  return [
    {
      label: '페르소나 이름 있음',
      pass: draft.persona.name.trim().length > 0,
    },
    {
      label: '스킬 1개 이상',
      pass: draft.skills.length >= 1,
    },
    {
      label: '에이전트 1개 이상',
      pass: draft.agents.length >= 1,
    },
    {
      label: '가드레일 1개 이상',
      pass: draft.gates.length >= 1,
    },
  ];
}

interface PreviewProps {
  draft: HarnessDraft;
}

export function Preview({ draft }: PreviewProps) {
  const checklist = buildChecklist(draft);
  const passCount = checklist.filter((c) => c.pass).length;
  const total = countBlocks(draft);

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="card md:p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">완성도</p>
        <p className="mt-1 text-2xl font-bold text-brand-900">
          {passCount} / {checklist.length}
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${(passCount / checklist.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 체크리스트 */}
      <div className="card md:p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">체크리스트</p>
        <ul className="mt-3 space-y-2">
          {checklist.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="text-base" aria-hidden>
                {item.pass ? '🟢' : '🟠'}
              </span>
              <span className={item.pass ? 'text-brand-800' : 'text-[color:var(--color-ink-600)]'}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 슬롯별 블록 수 */}
      <div className="card md:p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
          블록 현황 · 총 {total}개
        </p>
        <ul className="mt-3 space-y-1.5">
          {SLOT_META.map(({ key, emoji, label }) => (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="text-brand-700">
                {emoji} {label}
              </span>
              <span className="rounded-pill bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                {draft[key].length}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Phase 2 안내 */}
      <div className="card border-2 border-dashed border-brand-200 md:p-4">
        <p className="text-xs font-bold text-brand-700">📊 Mermaid 구조도</p>
        <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
          Phase 2에서 블록 연결 구조도가 이 자리에 추가됩니다.
        </p>
      </div>
    </div>
  );
}
