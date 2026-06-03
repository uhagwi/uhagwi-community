// 하네스 드래프트 → Mermaid flowchart 변환 (에디터 실시간 미리보기, Phase 2)
// 구조: 🔔요청 + 🧠메모리·🛠도구(입력) → 🎭페르소나 → 📋스킬·🤖에이전트 → ✅가드레일 → 📦산출
// 노드 폭발 방지: 스킬·에이전트는 페르소나에서 팬아웃, 가드레일로 팬인(N+N 엣지).

import type { HarnessDraft } from './draft';

// Mermaid 라벨 파서 충돌 문자 제거 + 길이 제한
function esc(s: string): string {
  const cleaned = (s || '')
    .replace(/["[\]{}()|<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '·';
  return cleaned.length > 22 ? `${cleaned.slice(0, 21)}…` : cleaned;
}

export function draftToMermaid(d: HarnessDraft): string {
  const L: string[] = ['flowchart LR'];
  L.push('  REQ(["🔔 요청"]):::req');
  L.push(`  P["🎭 ${esc(d.persona.name) || '내 하네스'}"]:::persona`);
  L.push('  REQ --> P');

  // 입력 자원: 메모리·도구 → 페르소나
  d.memory.forEach((b, i) => {
    L.push(`  MEM${i}["🧠 ${esc(b.label)}"]:::mem`);
    L.push(`  MEM${i} --> P`);
  });
  d.tools.forEach((b, i) => {
    L.push(`  TL${i}["🛠 ${esc(b.label)}"]:::tool`);
    L.push(`  TL${i} --> P`);
  });

  // 실행 단계: 페르소나 → 스킬·에이전트 (팬아웃)
  const stageIds: string[] = [];
  d.skills.forEach((b, i) => {
    L.push(`  SK${i}["📋 ${esc(b.label)}"]:::skill`);
    L.push(`  P --> SK${i}`);
    stageIds.push(`SK${i}`);
  });
  d.agents.forEach((b, i) => {
    L.push(`  AG${i}["🤖 ${esc(b.label)}"]:::agent`);
    L.push(`  P --> AG${i}`);
    stageIds.push(`AG${i}`);
  });

  // 가드레일: 실행 단계 → 첫 게이트 (팬인) → 게이트 체인 → 산출
  if (d.gates.length > 0) {
    d.gates.forEach((b, i) => {
      L.push(`  GT${i}{{"✅ ${esc(b.label)}"}}:::gate`);
      if (i > 0) L.push(`  GT${i - 1} --> GT${i}`);
    });
    const sources = stageIds.length > 0 ? stageIds : ['P'];
    sources.forEach((s) => L.push(`  ${s} --> GT0`));
    L.push(`  GT${d.gates.length - 1} --> OUT`);
  } else {
    const sources = stageIds.length > 0 ? stageIds : ['P'];
    sources.forEach((s) => L.push(`  ${s} --> OUT`));
  }
  L.push('  OUT[["📦 산출"]]:::out');

  // 우하귀 cream/brand 팔레트
  L.push('  classDef req fill:#eef2ff,stroke:#8a96aa,color:#1f2a37;');
  L.push('  classDef persona fill:#fdf6e9,stroke:#d8b878,color:#1f2a37,font-weight:bold;');
  L.push('  classDef mem fill:#f5f3ff,stroke:#c4b5fd,color:#1f2a37;');
  L.push('  classDef tool fill:#ecfeff,stroke:#a5d8df,color:#1f2a37;');
  L.push('  classDef skill fill:#fff7ed,stroke:#fdba74,color:#1f2a37;');
  L.push('  classDef agent fill:#eff6ff,stroke:#93c5fd,color:#1f2a37;');
  L.push('  classDef gate fill:#fef9c3,stroke:#d8b878,color:#1f2a37;');
  L.push('  classDef out fill:#dcfce7,stroke:#86efac,color:#1f2a37;');
  return L.join('\n');
}

// Mermaid 실패 시 텍스트 fallback (한 줄 그림)
export function draftToFlowText(d: HarnessDraft): string {
  const inputs = [
    d.memory.length ? `🧠 메모리 ${d.memory.length}` : '',
    d.tools.length ? `🛠 도구 ${d.tools.length}` : '',
  ].filter(Boolean).join(' · ');
  const steps = [
    d.skills.length ? `📋 스킬 ${d.skills.length}` : '',
    d.agents.length ? `🤖 에이전트 ${d.agents.length}` : '',
  ].filter(Boolean).join(' · ');
  const parts = [
    '🔔 요청',
    inputs,
    `🎭 ${d.persona.name || '내 하네스'}`,
    steps,
    d.gates.length ? `✅ 가드레일 ${d.gates.length}` : '',
    '📦 산출',
  ].filter(Boolean);
  return parts.join('  →  ');
}
