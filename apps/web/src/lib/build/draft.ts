// 나만의 하네스 에디터 — 드래프트 데이터 모델 + 변환/저장소
// Phase 0: 인터뷰 Phase4Result → HarnessDraft 변환 + localStorage 핸드오프.
// 이후 Phase 1 에디터(/build)가 이 드래프트를 읽어 6슬롯에 펼친다.

import type { Phase4Result } from '@/app/interview/phases';

export type BlockKind = 'persona' | 'memory' | 'skill' | 'agent' | 'tool' | 'gate';
export type BlockSource = 'recommended' | 'catalog' | 'custom' | 'imported';

export interface Block {
  id: string;
  kind: BlockKind;
  label: string;
  body: string;
  source: BlockSource;
  meta?: Record<string, unknown>;
}

export interface HarnessDraft {
  version: number; // 버전 히스토리(C-5)의 시작점. 수정 시 증가.
  persona: { name: string; job: string; tone: string };
  memory: Block[];
  skills: Block[];
  agents: Block[];
  tools: Block[];
  gates: Block[];
  origin: 'interview' | 'blank' | 'import';
  createdAt: string;
}

// creature_type → 한국어 직업 라벨 (Lab TYPES 라벨과 정합)
const CREATURE_JOB: Record<Phase4Result['creature_type'], string> = {
  coder: '코더',
  writer: '라이터',
  analyst: '분석가',
  designer: '디자이너',
  researcher: '리서처',
};

let _seq = 0;
function blockId(prefix: string): string {
  _seq += 1;
  const t = typeof Date !== 'undefined' ? Date.now().toString(36) : 'x';
  return `${prefix}_${t}_${_seq}`;
}

/**
 * 인터뷰 진단 결과를 에디터 드래프트로 변환(프리필).
 * - auto_candidates → 스킬 블록
 * - off_limits      → 가드레일(safety) 블록
 * - quality_bar     → 가드레일(invariant) 블록
 * - must_have/want  → 메모리 블록(의도 기록)
 * 에이전트·도구 슬롯은 비워서 사용자가 직접 채우게 둔다.
 */
export function interviewToHarnessDraft(r: Phase4Result): HarnessDraft {
  const skills: Block[] = r.auto_candidates.map((c) => ({
    id: blockId('sk'),
    kind: 'skill',
    label: c.title,
    body: c.automation_approach,
    source: 'recommended',
    meta: {
      domain: c.domain,
      priority: c.first_demo_priority,
      saveMinPerWeek: c.estimated_save_min_per_week,
      recommended: c.rank === r.recommended_first_demo_rank,
      why: c.why_user_chose,
    },
  }));

  const gates: Block[] = r.automation_priorities.off_limits.map((o) => ({
    id: blockId('gt'),
    kind: 'gate',
    label: `금기: ${o}`,
    body: '이 영역은 자동화하지 않는다 (사용자 명시 off-limits).',
    source: 'recommended',
    meta: { gateType: 'safety' },
  }));
  if (r.quality_bar?.trim()) {
    gates.push({
      id: blockId('gt'),
      kind: 'gate',
      label: '품질 기준',
      body: r.quality_bar,
      source: 'recommended',
      meta: { gateType: 'invariant' },
    });
  }

  const memory: Block[] = [];
  if (r.automation_priorities.must_have.length > 0) {
    memory.push({
      id: blockId('mem'),
      kind: 'memory',
      label: '반드시 자동화',
      body: r.automation_priorities.must_have.join('\n'),
      source: 'recommended',
    });
  }
  if (r.automation_priorities.want.length > 0) {
    memory.push({
      id: blockId('mem'),
      kind: 'memory',
      label: '원하는 자동화',
      body: r.automation_priorities.want.join('\n'),
      source: 'recommended',
    });
  }

  return {
    version: 1,
    persona: {
      name: r.persona_name_kr,
      job: CREATURE_JOB[r.creature_type] ?? r.creature_type,
      tone: r.creature_personality,
    },
    memory,
    skills,
    agents: [],
    tools: [],
    gates,
    origin: 'interview',
    createdAt: new Date().toISOString(),
  };
}

// 드래프트의 전체 블록 수(슬롯 합계) — 핸드오프 안내·미리보기용.
export function countBlocks(d: HarnessDraft): number {
  return d.memory.length + d.skills.length + d.agents.length + d.tools.length + d.gates.length;
}

export const BUILD_DRAFT_KEY = 'uhagwi.build.draft';

export function saveBuildDraft(draft: HarnessDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BUILD_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* localStorage 비활성/용량초과 — 무시 */
  }
}

export function loadBuildDraft(): HarnessDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUILD_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as HarnessDraft) : null;
  } catch {
    return null;
  }
}
