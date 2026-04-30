// Harness Lab — 도메인 타입·상수
// 출처: harness-lab.jsx (단일 React 파일을 우하귀 web에 이식)

export type FoodKey = 'prompt' | 'data' | 'context' | 'tool' | 'feedback';
export type StatKey = 'sophistication' | 'intel' | 'creativity' | 'speed' | 'hp';
export type TypeKey = 'coder' | 'writer' | 'analyst' | 'designer' | 'researcher';

export interface StarterTemplate {
  label: string;
  body: string;
  foodType: FoodKey;
}

export interface TypeDef {
  label: string;
  desc: string;
  sprites: string[];
  auraFrom: string;
  auraTo: string;
  bias: Partial<Record<StatKey, number>>;
  starterTemplates: StarterTemplate[];
}

export interface FoodDef {
  emoji: string;
  label: string;
  stat: StatKey;
  xpBase: number;
  fillBase: number;
  color: string;
}

export interface Template extends StarterTemplate {
  id: string;
  useCount: number;
}

export interface HistoryEntry {
  t: number;
  kind: 'feed' | 'train' | 'play' | 'rest';
  foodType?: FoodKey;
  label: string;
  note?: string | null;
  source?: string;
}

export interface Creature {
  id: string;
  name: string;
  type: TypeKey;
  purpose: string;
  data: string;
  isExisting: boolean;
  level: number;
  xp: number;
  stats: Record<StatKey, number>;
  meters: { fullness: number; happiness: number; energy: number };
  createdAt: number;
  lastInteractionAt: number;
  lastTickAt: number;
  feedCount: number;
  trainCount: number;
  playCount: number;
  history: HistoryEntry[];
  templates: Template[];
  // 우하귀 연동: 갤러리 게시 후 채워지는 슬러그
  uhagwiSlug?: string | null;
}

export const TYPES: Record<TypeKey, TypeDef> = {
  coder: {
    label: '코더', desc: '코딩 · 디버깅 · 리팩토링',
    sprites: ['🥚', '👾', '🤖', '🦾', '🧙'],
    auraFrom: '#86efac', auraTo: '#22c55e',
    bias: { speed: 0.4, intel: 0.3, hp: 0.1 },
    starterTemplates: [
      { label: '코드 리뷰', body: '이 코드 리뷰해줘. 버그, 엣지케이스, 가독성, 성능 관점에서:\n\n```\n[코드 붙여넣기]\n```', foodType: 'context' },
      { label: '디버깅', body: '이 에러 디버깅 도와줘. 무슨 일이 일어나고 있는지 + 어떻게 고치는지:\n\n에러:\n```\n[에러]\n```\n관련 코드:\n```\n[코드]\n```', foodType: 'data' },
      { label: '리팩토링', body: '이 코드 리팩토링 해줘. 더 명확하고 테스트 가능하게 만들어. 변경 이유도 설명해줘.\n\n```\n[코드]\n```', foodType: 'tool' },
      { label: '테스트 작성', body: '이 함수의 테스트 코드 작성해줘. 엣지케이스 포함해서.\n\n```\n[함수]\n```', foodType: 'tool' },
    ],
  },
  writer: {
    label: '라이터', desc: '글쓰기 · 편집 · 스토리',
    sprites: ['🥚', '📝', '📖', '📚', '🪶'],
    auraFrom: '#c4b5fd', auraTo: '#7c3aed',
    bias: { creativity: 0.4, sophistication: 0.3, intel: 0.1 },
    starterTemplates: [
      { label: '명료하게 다듬기', body: '이 글 더 명료하게 다듬어줘. 의미는 유지하면서 군더더기는 빼고:\n\n[글]', foodType: 'feedback' },
      { label: '톤 바꾸기', body: '이 글의 톤을 [캐주얼/전문적/따뜻한]으로 바꿔줘:\n\n[글]', foodType: 'context' },
      { label: '요약', body: '이 글을 3문장으로 요약해줘. 핵심만:\n\n[글]', foodType: 'prompt' },
    ],
  },
  analyst: {
    label: '분석가', desc: '데이터 · 추론 · 인사이트',
    sprites: ['🥚', '🔍', '📊', '📈', '🔮'],
    auraFrom: '#93c5fd', auraTo: '#2563eb',
    bias: { intel: 0.5, sophistication: 0.2, speed: 0.1 },
    starterTemplates: [
      { label: '트레이드오프 분석', body: '이 결정의 트레이드오프를 분석해줘. 옵션마다 장단점, 고려사항, 추천:\n\n결정 사항: [내용]\n옵션들: [A, B, C]', foodType: 'context' },
      { label: '데이터 패턴', body: '이 데이터에서 패턴 찾아줘. 통계적 인사이트, 이상치, 가설:\n\n[데이터]', foodType: 'data' },
      { label: '근본 원인', body: '이 문제의 근본 원인 찾기. 5 Whys 방식으로:\n\n증상: [문제]', foodType: 'data' },
    ],
  },
  designer: {
    label: '디자이너', desc: '비주얼 · UX · 인터랙션',
    sprites: ['🥚', '🎨', '🖌️', '🖼️', '✨'],
    auraFrom: '#f9a8d4', auraTo: '#db2777',
    bias: { creativity: 0.5, speed: 0.2, sophistication: 0.1 },
    starterTemplates: [
      { label: 'UX 비판', body: '이 UX 비판적으로 봐줘. 사용성 문제, 헷갈리는 부분, 개선점:\n\n[설명/스크린샷]', foodType: 'feedback' },
      { label: '디자인 옵션', body: '이 디자인 문제에 대해 3가지 다른 접근 제안해줘. 각각 톤/철학 다르게:\n\n[문제]', foodType: 'feedback' },
    ],
  },
  researcher: {
    label: '리서처', desc: '리서치 · 합성 · 학습',
    sprites: ['🥚', '🔬', '🧪', '🔭', '🧠'],
    auraFrom: '#fcd34d', auraTo: '#d97706',
    bias: { intel: 0.4, creativity: 0.3, sophistication: 0.1 },
    starterTemplates: [
      { label: '주제 정리', body: '이 주제에 대해 정리해줘. 핵심 개념, 주요 관점, 논쟁, 더 파고들 만한 것:\n\n주제: [내용]', foodType: 'context' },
      { label: 'ELI5', body: '이거 5살에게 설명하듯 쉽게 풀어줘:\n\n[개념]', foodType: 'data' },
      { label: '비교', body: 'A와 B 비교 분석. 공통점, 차이점, 언제 어느 쪽:\n\nA: [ ]\nB: [ ]', foodType: 'context' },
    ],
  },
};

export const FOODS: Record<FoodKey, FoodDef> = {
  prompt:   { emoji: '📜', label: '프롬프트', stat: 'speed',          xpBase: 6,  fillBase: 18, color: '#22c55e' },
  data:     { emoji: '📊', label: '데이터',   stat: 'intel',          xpBase: 9,  fillBase: 22, color: '#3b82f6' },
  context:  { emoji: '📚', label: '컨텍스트', stat: 'sophistication', xpBase: 7,  fillBase: 20, color: '#a855f7' },
  tool:     { emoji: '🛠️', label: '툴',       stat: 'hp',             xpBase: 5,  fillBase: 15, color: '#f59e0b' },
  feedback: { emoji: '💡', label: '피드백',   stat: 'creativity',     xpBase: 12, fillBase: 28, color: '#ec4899' },
};

export const STAT_META: Record<StatKey, { label: string; icon: string }> = {
  sophistication: { label: '정교함', icon: '◆' },
  intel:          { label: '지능',   icon: '✦' },
  creativity:     { label: '창의력', icon: '✸' },
  speed:          { label: '속도',   icon: '➤' },
  hp:             { label: '체력',   icon: '♥' },
};

export const EVO_LEVELS = [1, 5, 12, 22, 35] as const;
export const EVO_NAMES = ['알', '베이비', '주니어', '어덜트', '마스터'] as const;

export const STORAGE_CREATURES = 'harnessLab:creatures:v2';
export const STORAGE_ACTIVE = 'harnessLab:activeId:v2';
