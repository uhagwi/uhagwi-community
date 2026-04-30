// Harness Lab ↔ 우하귀 갤러리 브릿지
// - Lab creature → 우하귀 harnesses 게시 페이로드로 변환
// - 우하귀 harness → Lab creature 임포트
'use client';

import type { Creature, TypeKey } from './types';
import { TYPES } from './types';
import { newCreature } from './logic';

// 우하귀 harnesses 테이블 INSERT 후보 (apps/web/src/app/harnesses/new 의 폼과 일치)
export interface UhagwiHarnessDraft {
  title: string;
  one_liner: string;
  purpose: string;
  components: string[];        // 11요소 중 일부 (Lab은 food 카테고리를 매핑)
  prompt_snippet: string | null;
  persona_name: string | null;
  persona_job: string | null;
  structure_mermaid: string | null;
  media_urls: string[];
  source: 'lab';
  lab_meta: {
    creatureId: string;
    type: TypeKey;
    level: number;
    isExisting: boolean;
    feedCount: number;
    statSnapshot: Creature['stats'];
  };
}

// food 카테고리 → 우하귀 11요소 컴포넌트 매핑 (대표 1:1)
const FOOD_TO_COMPONENT: Record<string, string> = {
  prompt: 'prompt',
  data: 'context',
  context: 'memory',
  tool: 'tools',
  feedback: 'tone',
};

export function creatureToHarnessDraft(c: Creature): UhagwiHarnessDraft {
  const t = TYPES[c.type];
  const used = new Set<string>();
  c.history.forEach((h) => {
    if (h.kind === 'feed' && h.foodType) {
      const comp = FOOD_TO_COMPONENT[h.foodType];
      if (comp) used.add(comp);
    }
  });

  // 가장 많이 쓴 템플릿 1개를 prompt_snippet 으로
  const topTmpl = [...c.templates].sort((a, b) => b.useCount - a.useCount)[0];
  const promptSnippet = topTmpl?.useCount ? topTmpl.body : null;

  return {
    title: c.name + ' · ' + t.label,
    one_liner: ((c.purpose && c.purpose.length > 0 ? c.purpose : `${t.label} 타입 하네스 · Lv ${c.level}`)).slice(0, 200),
    purpose: c.data?.trim() || c.purpose || '(작성 중)',
    components: Array.from(used),
    prompt_snippet: promptSnippet,
    persona_name: c.name,
    persona_job: t.label,
    structure_mermaid: null,
    media_urls: [],
    source: 'lab',
    lab_meta: {
      creatureId: c.id,
      type: c.type,
      level: c.level,
      isExisting: c.isExisting,
      feedCount: c.feedCount,
      statSnapshot: { ...c.stats },
    },
  };
}

// 우하귀 갤러리에서 가져온 raw row → Lab creature 초기 등록
// type 매핑: persona_job 이 없으면 'researcher' fallback
export interface UhagwiHarnessRow {
  slug: string;
  title: string;
  one_liner: string;
  purpose: string;
  persona_name: string | null;
  persona_job: string | null;
  prompt_snippet: string | null;
}

const JOB_TO_TYPE: Record<string, TypeKey> = {
  코더: 'coder', developer: 'coder', engineer: 'coder',
  라이터: 'writer', writer: 'writer',
  분석가: 'analyst', analyst: 'analyst', pharmacist: 'analyst',
  디자이너: 'designer', designer: 'designer', florist: 'designer',
  리서처: 'researcher', researcher: 'researcher', teacher: 'researcher', student: 'researcher',
};

export function harnessRowToCreature(row: UhagwiHarnessRow): Creature {
  const job = (row.persona_job || '').toLowerCase().trim();
  const type: TypeKey = JOB_TO_TYPE[job] || JOB_TO_TYPE[row.persona_job || ''] || 'researcher';
  const firstSeg = row.title.split('·')[0]?.trim() || '갤러리 임포트';
  const c = newCreature({
    name: row.persona_name || firstSeg,
    type,
    purpose: row.one_liner,
    data: [row.purpose, row.prompt_snippet].filter(Boolean).join('\n\n---\n\n'),
    isExisting: true,
  });
  c.uhagwiSlug = row.slug;
  return c;
}

// POST /api/lab/publish 클라이언트 래퍼 (서버 라우트는 후속 단계)
export async function publishToUhagwi(c: Creature): Promise<{ slug: string } | { error: string }> {
  const draft = creatureToHarnessDraft(c);
  try {
    const res = await fetch('/api/lab/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      const text = await res.text();
      return { error: text || `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (e: any) {
    return { error: e?.message || 'network error' };
  }
}
