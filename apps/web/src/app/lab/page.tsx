'use client';

// /lab — 폐지됨 (Phase 6). 다마고치 트래커 → 하네스 에디터(/build)로 일원화.
// 기존 creature가 남아있으면 하네스 드래프트로 옮길 기회를 1회 제공하고 /build로 보낸다.
// 옮길 것이 없으면 즉시 /build로 리다이렉트.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { genDraftId, saveBuildDraft, type Block, type HarnessDraft } from '@/lib/build/draft';
import { saveRecommended } from '@/lib/build/recommended';

const LAB_KEY = 'harnessLab:creatures:v2';
const TYPE_LABEL: Record<string, string> = {
  coder: '코더',
  writer: '라이터',
  analyst: '분석가',
  designer: '디자이너',
  researcher: '리서처',
};

interface RawCreature {
  id?: string;
  name?: string;
  type?: string;
  purpose?: string;
  data?: string;
  templates?: { label?: string; body?: string }[];
}

// 구 Lab creature → 에디터 드래프트 변환 (templates→스킬, purpose/data→메모리)
function creatureToDraft(c: RawCreature): HarnessDraft {
  const skills: Block[] = (c.templates ?? []).map((t, i) => ({
    id: `sk_mig_${i}`,
    kind: 'skill',
    label: t.label || `스킬 ${i + 1}`,
    body: t.body || '',
    source: 'imported',
  }));
  const memory: Block[] = [];
  const memoBody = [c.purpose, c.data].filter(Boolean).join('\n\n');
  if (memoBody) {
    memory.push({ id: 'mem_mig_0', kind: 'memory', label: '랩에서 가져온 메모', body: memoBody, source: 'imported' });
  }
  return {
    id: genDraftId(),
    version: 1,
    persona: { name: c.name || '내 하네스', job: TYPE_LABEL[c.type ?? ''] || '', tone: '' },
    memory,
    skills,
    agents: [],
    tools: [],
    gates: [],
    origin: 'import',
    createdAt: new Date().toISOString(),
  };
}

export default function LabRetiredPage() {
  const router = useRouter();
  const [creatures, setCreatures] = useState<RawCreature[] | null>(null);

  useEffect(() => {
    let list: RawCreature[] = [];
    try {
      const raw = window.localStorage.getItem(LAB_KEY);
      if (raw) list = JSON.parse(raw);
    } catch {
      list = [];
    }
    if (!Array.isArray(list) || list.length === 0) {
      router.replace('/build'); // 옮길 것 없음 → 바로 에디터
      return;
    }
    setCreatures(list);
  }, [router]);

  const migrate = (c: RawCreature) => {
    const draft = creatureToDraft(c);
    saveBuildDraft(draft);
    saveRecommended([...draft.memory, ...draft.skills]);
    router.push('/build?from=lab');
  };

  if (!creatures) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-12 text-sm text-brand-700">에디터로 이동 중…</div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-10 md:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">랩 → 에디터</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-brand-900">🧩 하네스 에디터로 통합됐어요</h1>
      <p className="mt-2 text-sm text-[color:var(--color-ink-600)]">
        다마고치 키우기는 직접 조립하는 <strong>하네스 에디터</strong>로 합쳐졌어요. 예전에 키우던
        하네스가 {creatures.length}개 남아있네요 — 에디터로 옮길 수 있어요.
      </p>

      <ul className="mt-5 space-y-2">
        {creatures.map((c, i) => (
          <li key={c.id ?? i} className="card flex items-center justify-between gap-3 md:p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-brand-900">{c.name || '이름 없음'}</p>
              <p className="text-xs text-brand-600">
                {TYPE_LABEL[c.type ?? ''] || '하네스'} · 템플릿 {c.templates?.length ?? 0}개
              </p>
            </div>
            <button type="button" onClick={() => migrate(c)} className="btn-primary !py-2 text-sm shrink-0">
              에디터로 옮기기
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex gap-2">
        <Link href="/build" className="btn-ghost !py-2.5 text-sm">옮기지 않고 새로 만들기</Link>
        <Link href="/" className="btn-ghost !py-2.5 text-sm">홈</Link>
      </div>
    </div>
  );
}
