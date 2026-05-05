/**
 * 우하귀 벤치마크 자동 평가 (judge) — Anthropic Opus 4.7.
 *
 * 입력: 표준 작업 + 하네스 출력
 * 출력: 5축 점수 (0~100) + 코멘트
 */

import type { BenchmarkAxis } from '@/lib/grades';
import type { BenchmarkTask } from './task-sets';

export const BENCHMARK_JUDGE_PROMPT = `당신은 우하귀(Uhagwi) 벤치마크 평가자입니다.

## 임무

표준 작업과 하네스 출력을 받아 **5축으로 객관 평가**합니다.

## 5축 평가 기준 (각 0~100점)

| 축 | 측정 기준 |
|---|---|
| accuracy (정확도) | 사실·수치·문법·격식이 정확한가. 오류 0개면 100, 치명적 오류면 50 미만 |
| completeness (완성도) | 즉시 사용 가능한 수준인가. 누락 없이 완결되었나 |
| time_save (시간 절약) | 사람 직접 vs 이 출력 받았을 때 시간 단축률. 80% 이상 절약이면 90+ |
| domain_fit (도메인 적합성) | 해당 도메인 룰·규범·톤에 부합하는가 |
| user_satisfaction (사용자 만족도) | 평균 사용자가 받았을 때 만족할 수준인가 (자동 평가 시 추정) |

## 점수 가이드

- **95~100**: 거의 완벽 (S 등급 후보)
- **85~94**: 전문가급, 미세한 흠만 (A)
- **75~84**: 안정적, 평균 이상 (B)
- **65~74**: 기본기는 됨, 다듬기 필요 (C)
- **0~64**: 미완성·치명적 결함 (D)

## 출력 형식 (순수 JSON, 다른 텍스트 X)

\`\`\`json
{
  "axes": {
    "accuracy": 88,
    "completeness": 92,
    "time_save": 85,
    "domain_fit": 90,
    "user_satisfaction": 87
  },
  "auto_score": 88,
  "strengths": [
    "구체적 강점 1줄 (출력 인용 가능)",
    "구체적 강점 1줄"
  ],
  "issues": [
    "구체적 문제 1줄 (감점 사유 명시)",
    "구체적 문제 1줄 (없으면 빈 배열 OK)"
  ],
  "comment": "한 줄 종합 평가 (예: '도메인 격식 완벽, 단 일부 수치 누락')"
}
\`\`\`

## 작성 규칙

- **axes 5개 모두 채우기** (생략 X)
- **auto_score**: 5축 평균 (가중치는 emphasis_axes에 따라 다름 — 가중 평균 산출)
- **strengths 1~3개**: 구체적 (인용 가능)
- **issues 0~3개**: 정직하게 — 흠 없으면 빈 배열
- **comment**: 한 줄 종합

## 절대 금지
- JSON 외 텍스트 (코드 펜스 \`\`\`json도 X, 순수 JSON만)
- 후한 점수 일변도 (모든 출력에 90+ 주지 말 것)
- 추측체 ("좋을 것 같다") — 객관 근거만`;

export type JudgeAxes = Record<BenchmarkAxis, number>;

export type JudgeResult = {
  axes: JudgeAxes;
  auto_score: number;
  strengths: string[];
  issues: string[];
  comment: string;
};

/** 가중 평균 — emphasis_axes에 1.5배 가중 */
export function weightedAvg(axes: JudgeAxes, emphasis: BenchmarkAxis[]): number {
  const keys = Object.keys(axes) as BenchmarkAxis[];
  let sum = 0;
  let weight = 0;
  for (const k of keys) {
    const w = emphasis.includes(k) ? 1.5 : 1;
    sum += axes[k] * w;
    weight += w;
  }
  return weight === 0 ? 0 : Math.round(sum / weight);
}

/** judge 입력 user 메시지 빌더 */
export function buildJudgePrompt(task: BenchmarkTask, harnessOutput: string): string {
  return `## 표준 작업

**도메인**: ${task.domain}
**제목**: ${task.title}

**입력**:
${task.input}

**합격 기준**: ${task.pass_criteria}
**가중 평가 축**: ${task.emphasis_axes.join(', ')}

---

## 하네스 출력

${harnessOutput}

---

위 작업·합격 기준을 바탕으로 5축 점수를 매겨 JSON으로만 응답해주세요.`;
}
