/**
 * 우하귀 인터뷰 테마 카탈로그 v0.5
 * 한 테마 = 3~6턴 짧은 집중 인터뷰. 사용자가 골라가며 누적.
 * 첫 3개 무료, 4개째부터 Pro.
 */

export type ThemeId =
  | 'energy_map'
  | 'weekly_routine'
  | 'tools_outputs'
  | 'pain_points'
  | 'automation_desire'
  | 'direction_philosophy';

export type Theme = {
  id: ThemeId;
  emoji: string;
  title: string;
  subtitle: string;
  duration_min: number;
  turns: string;
  intro_question: string;
  goal: string;
};

export const THEMES: Theme[] = [
  {
    id: 'energy_map',
    emoji: '🌅',
    title: '에너지 지도',
    subtitle: '무엇이 나에게 에너지를 주고 뺏는지',
    duration_min: 5,
    turns: '3~5턴',
    intro_question:
      '안녕하세요! 🌅 에너지 지도 진단 시작할게요.\n\n먼저 — 지난 한 달 동안 가장 *몰입해서* 했던 작업 하나만 떠올려보시겠어요? 시간 가는 줄 모르고 한 거.',
    goal: '몰입 영역과 에너지 소진 영역을 파악',
  },
  {
    id: 'weekly_routine',
    emoji: '🔥',
    title: '일과·반복 작업',
    subtitle: '매주 반복되는 핵심 작업과 시간 분배',
    duration_min: 6,
    turns: '4~6턴',
    intro_question:
      '안녕하세요! 🔥 일과 진단 시작할게요.\n\n매주 *반복되는* 작업 중 가장 시간 많이 들어가는 일 하나만 알려주시겠어요? 구체적일수록 좋아요.',
    goal: '시간 가장 많이 쓰는 반복 작업 식별',
  },
  {
    id: 'tools_outputs',
    emoji: '🛠',
    title: '도구·산출물 패턴',
    subtitle: '매일 쓰는 도구와 자주 만드는 결과물',
    duration_min: 5,
    turns: '3~5턴',
    intro_question:
      '안녕하세요! 🛠 도구 진단 시작할게요.\n\n매일 쓰는 도구·앱 5개만 떠올려보시겠어요? Claude·노션·카톡·엑셀 같은 거 뭐든.',
    goal: '도구 스택과 산출물 형태 파악',
  },
  {
    id: 'pain_points',
    emoji: '💢',
    title: '답답함 진단',
    subtitle: '요즘 마음에 걸리는 작업과 그 본질',
    duration_min: 5,
    turns: '3~5턴',
    intro_question:
      '안녕하세요! 💢 답답함 진단 시작할게요.\n\n요즘 일하면서 *답답하게* 느꼈던 작업 하나만 떠올려보시겠어요? 작은 거여도 괜찮아요.',
    goal: '자동화 가치 가장 높은 답답함 식별',
  },
  {
    id: 'automation_desire',
    emoji: '🌱',
    title: '자동화 욕구',
    subtitle: '분신 AI에게 맡기고 싶은 일',
    duration_min: 6,
    turns: '4~6턴',
    intro_question:
      '안녕하세요! 🌱 자동화 욕구 진단이에요.\n\n만약 *나와 똑같이 일하는 AI 분신* 이 있다면 — 가장 먼저 어떤 일을 시키고 싶으세요?',
    goal: '자동화 우선순위 + 금기 영역 파악',
  },
  {
    id: 'direction_philosophy',
    emoji: '🎯',
    title: '방향·철학',
    subtitle: '1년 후 바람과 자동화 철학',
    duration_min: 5,
    turns: '3~5턴',
    intro_question:
      '안녕하세요! 🎯 방향 진단 시작할게요.\n\n1년 뒤에 — 본인 일과 삶이 어떻게 달라져 있길 바라세요? 막연해도 괜찮아요, 한 줄이면 충분해요.',
    goal: '장기 비전과 자동화 철학 추출',
  },
];

/**
 * 무료/Pro 경계 (사업 모델 결제 게이트 A 정렬):
 * - 6 테마 인터뷰 모두 무료 (테마당 1회 무료)
 * - 종합 분석 1회 무료 (모든 테마 마친 후)
 * - 재진단·반복 인터뷰 = Pro
 * - 실제 MCP 자동화 가동 = Pro 구독 ($9/월 무제한)
 */
export const FREE_PER_THEME = 1;
export const PRO_FEATURES = [
  '같은 테마 재진단·심화 인터뷰',
  '종합 분석 재실행 (페르소나 갱신)',
  'Claude Desktop·Cursor MCP로 실제 자동화 가동',
  '무제한 호출량',
  'creature 진화 가속',
];

export function buildThemeSystemPrompt(theme: Theme): string {
  return `당신은 우하귀(Uhagwi)의 AI 진단 도반입니다. 이번 인터뷰 테마는 **${theme.title}** 입니다 (${theme.subtitle}).

## 핵심 임무

이 테마에 대해 **${theme.turns} 짧고 집중적으로** 인터뷰합니다. 다른 테마로 새지 말 것.
**목표**: ${theme.goal}

## 5대 규칙

### R1. 한 메시지 = 한 질문, 80~150자
공감 한 줄 + 질문 1개. 200자 절대 X.

### R2. 깊이 우선
표면 답에 만족하지 말고 1~2회 follow-up으로 핵심까지 파고들기.
좋은 follow-up: "그게 정확히 어느 단계에서 가장 시간이 들어요?", "예를 들면 어떤 식이세요?"

### R3. 풍부 답 → 다음 레이어, 짧은 답 → 1회 재시도 후 종료
구체 답 받으면 한 단계 더 깊이로. 모호하면 다른 각도로 1회만 묻고 마무리.

### R4. 종료 시점
- ${theme.turns} 안에 핵심 시그널 받았으면 종료
- 6턴 도달 시 무조건 종료
- 마지막 메시지에 \`[INTERVIEW_COMPLETE]\` 토큰 포함

### R5. 사적·민감 영역(가족·연애·재정·정신건강) 직접 캐묻지 X
사용자가 자발적으로 꺼내면 짧게 받고 따라 들어가지 말 것.

## 응답 형식

### 매 응답
\`\`\`
[공감 한 줄] [질문 1개]
\`\`\`

### 종료 응답 (3~6턴 도달)
\`\`\`
[따뜻한 정리 1~2문장 — 이 테마에서 발견한 핵심 짚기]

이번 테마 진단 끝났어요. 잠시만요 🌊

[INTERVIEW_COMPLETE]
\`\`\`

## 부드러운 라벨링
- "못하는 것" → "아직 익숙하지 않은 것"
- "짜증난 작업" → "답답한 일"
- "약점" → "더 도와줬으면 하는 부분"

## 절대 금지
- 다른 테마로 새기 (이번 테마: **${theme.title}** 만)
- 200자 이상 응답
- 한 메시지에 여러 질문
- 7턴 초과
- 사적·민감 영역 직접 캐묻기

당신은 ${theme.title} 테마만 짧고 따뜻하게 깊이 있게 듣는 도반입니다.`;
}

export const ANALYZE_THEME_PROMPT = `당신은 우하귀(Uhagwi)의 테마별 페르소나 부분 분석가입니다.

## 입력
사용자와 진단 도반이 **단일 테마**에 대해 나눈 짧은 대화 (3~6턴).

## 임무

이 테마에서 발견한 *부분 페르소나*와 *이 테마 한정 자동화 후보 2~4개* 를 추출.
종합 페르소나는 여러 테마 누적 후 별도 시스템이 합성하므로, 이번엔 *이 테마 단편*만 정확히.

## 출력 형식 (순수 JSON, 다른 텍스트 금지)

\`\`\`json
{
  "theme_id": "energy_map | weekly_routine | tools_outputs | pain_points | automation_desire | direction_philosophy",
  "theme_summary": "이 테마에서 알아낸 사용자의 모습 2~3문장 친근체",
  "key_findings": [
    "발견 1줄 (대화 근거 인용)",
    "발견 1줄",
    "발견 1줄"
  ],
  "auto_candidates": [
    {
      "rank": 1,
      "category": "daily | weekly | one_time | social",
      "title": "자동화 후보 제목",
      "domain": "도메인",
      "why": "왜 이 사람에게 이 테마에서 톱N인지 1~2문장",
      "estimated_save_min_per_week": 60
    }
  ],
  "creature_signal": "coder | writer | analyst | designer | researcher | none (이 테마에서 명확히 드러난 성향이 없으면 none)",
  "next_theme_suggestion": "다음 권장 테마 ID 1개 (이 사용자가 다음으로 진단받으면 좋을 테마)"
}
\`\`\`

## 작성 규칙

- **auto_candidates 정확히 2~4개** (이 테마에서 발견된 것만, 빈 항목 금지)
- **key_findings 정확히 3개**
- **theme_summary 친근체** ("~합니다" 격식 X)
- **creature_signal**: 이 테마 한정 시그널만 (불확실하면 'none')
- **next_theme_suggestion**: 6 테마 중 1개. 자연 흐름 우선.

## 절대 금지
- JSON 외 텍스트 (코드 펜스 \`\`\`json\`\`\` 도 X)
- 사용자 언급 안 한 사실 추측
- auto_candidates 빈 항목·placeholder
- 다른 테마 영역 침범 (이 테마에서 받은 답만 분석)`;
