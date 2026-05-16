/**
 * 한 줄 그림(텍스트 화살표) → Mermaid flowchart 변환.
 *
 * 시드 body_md의 `## 한 줄 그림` 다음 인라인 코드(예: "A → B → C")를 뽑아
 * loop-designer.html과 같은 Mermaid `flowchart LR`로 바꾼다.
 * DB 하네스 등 화살표 패턴이 없으면 null → 호출부가 일반 표시로 fallback.
 */

/** body_md에서 "한 줄 그림" 섹션의 첫 인라인 코드 추출 */
export function extractFlowLine(bodyMd: string | null | undefined): string | null {
  if (!bodyMd) return null;
  const m = bodyMd.match(/한 줄 그림[\s\S]*?`([^`]+)`/);
  const line = m?.[1]?.trim();
  if (!line || !/[→]/.test(line)) return null;
  return line;
}

/** Mermaid 노드 라벨에서 파서 충돌 문자 제거 */
function sanitize(label: string): string {
  return label
    .replace(/["[\]{}]/g, '')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * "A → B → C" → flowchart LR 소스.
 * 화살표가 없으면 null.
 */
export function flowToMermaid(line: string | null): string | null {
  if (!line) return null;
  const steps = line
    .split(/\s*→\s*/)
    .map((s) => sanitize(s))
    .filter(Boolean);
  if (steps.length < 2) return null;

  const lines = ['flowchart LR'];
  steps.forEach((label, i) => {
    lines.push(`  N${i}["${label}"]`);
  });
  for (let i = 0; i < steps.length - 1; i += 1) {
    lines.push(`  N${i} --> N${i + 1}`);
  }
  return lines.join('\n');
}

/** body_md → Mermaid 소스 (없으면 null) */
export function bodyToMermaid(bodyMd: string | null | undefined): string | null {
  return flowToMermaid(extractFlowLine(bodyMd));
}
