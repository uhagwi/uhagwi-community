/**
 * 우하귀 하네스 등급화·벤치마크 시스템 v0.1.
 *
 * 5등급(S/A/B/C/D) + 5축 벤치마크 + 가챠 UX 메타데이터.
 * 출처: [[우하귀-사업화]] §11 (2026-05-05 결정).
 */

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export type BenchmarkAxis =
  | 'accuracy' // 정확도
  | 'completeness' // 완성도
  | 'time_save' // 시간 절약
  | 'domain_fit' // 도메인 적합성
  | 'user_satisfaction'; // 사용자 만족도

export type BenchmarkScore = {
  /** 종합 점수 0~100 (자동 70% + 사용자 30%) */
  total: number;
  /** 5축 개별 점수 0~100 */
  axes: Record<BenchmarkAxis, number>;
  /** 자동 평가 점수 (Opus·GPT-5 평가) */
  auto_score: number;
  /** 사용자 평가 점수 (4축 평균, 5점 척도 → 100 환산) */
  user_score: number | null;
  /** 사용자 평가 횟수 */
  user_review_count: number;
  /** 마지막 측정 시점 ISO */
  measured_at: string;
};

export type HarnessGrading = {
  grade: Grade;
  score: BenchmarkScore;
  /** 벤치마크 사용한 표준 작업셋 ID */
  benchmark_set_id: string;
  /** 등급 변동 이력 */
  history: Array<{ at: string; grade: Grade; total: number }>;
};

export const GRADE_META: Record<
  Grade,
  {
    label: string;
    color: string; // CSS color or class
    bg: string;
    border: string;
    shimmer: boolean; // 반짝임 애니메이션
    rarity_pct: number; // 풀에서 차지하는 비율 (가챠 확률)
    description: string;
  }
> = {
  S: {
    label: 'S',
    color: 'text-yellow-700',
    bg: 'bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100',
    border: 'border-yellow-400 ring-2 ring-yellow-300',
    shimmer: true,
    rarity_pct: 5,
    description: '거의 완벽 — Verified 보장 (RPG SSR급)',
  },
  A: {
    label: 'A',
    color: 'text-purple-800',
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border-purple-400',
    shimmer: false,
    rarity_pct: 15,
    description: '전문가급 — 도메인 깊이 입증 (RPG SR급)',
  },
  B: {
    label: 'B',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    shimmer: false,
    rarity_pct: 30,
    description: '안정적 — 일반 사용 OK (RPG R급)',
  },
  C: {
    label: 'C',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    shimmer: false,
    rarity_pct: 35,
    description: '기본 — 단순 작업만 (RPG N급)',
  },
  D: {
    label: 'D',
    color: 'text-stone-700',
    bg: 'bg-stone-50',
    border: 'border-stone-300',
    shimmer: false,
    rarity_pct: 15,
    description: '미완성 — 개선 필요 (beta)',
  },
};

export const SCORE_TO_GRADE: Array<{ min: number; grade: Grade }> = [
  { min: 95, grade: 'S' },
  { min: 85, grade: 'A' },
  { min: 75, grade: 'B' },
  { min: 65, grade: 'C' },
  { min: 0, grade: 'D' },
];

export function computeGrade(total: number): Grade {
  for (const { min, grade } of SCORE_TO_GRADE) {
    if (total >= min) return grade;
  }
  return 'D';
}

export const AXIS_LABELS: Record<BenchmarkAxis, string> = {
  accuracy: '정확도',
  completeness: '완성도',
  time_save: '시간 절약',
  domain_fit: '도메인 적합성',
  user_satisfaction: '사용자 만족도',
};

/**
 * 자동 70% + 사용자 30% 가중 합산.
 * 사용자 평가가 없으면 자동만 100% 반영.
 */
export function combineScore(auto: number, user: number | null): number {
  if (user === null) return Math.round(auto);
  return Math.round(auto * 0.7 + user * 0.3);
}

/** 표준 작업셋 도메인 분류 */
export type BenchmarkDomain =
  | 'education'
  | 'admin'
  | 'cafe_business'
  | 'research'
  | 'design'
  | 'engineering'
  | 'general';

export const BENCHMARK_TASK_COUNTS: Record<BenchmarkDomain, number> = {
  education: 13, // 시험문제 5 + 교안 3 + 학생 피드백 5
  admin: 10, // 공문 3 + 보고서 2 + 메일 5
  cafe_business: 11, // 정산 5 + 발주 3 + 공지 3
  research: 6, // 논문 요약 3 + 인용 2 + 슬라이드 1
  design: 5, // (미정)
  engineering: 5, // (미정)
  general: 5, // (미정)
};
