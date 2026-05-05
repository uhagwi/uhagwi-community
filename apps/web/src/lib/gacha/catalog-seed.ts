/**
 * 우하귀 가챠 카탈로그 시드 v0.1.
 * 1년차 1Q 시작용 — 사람 빌더(본인) + AI 빌더 하이브리드 18개.
 * 추후 Supabase harnesses 테이블로 이관.
 */

import type { BuilderType } from '@/components/HarnessGradeCard';
import type { BenchmarkAxis, BenchmarkDomain, Grade } from '@/lib/grades';

export type GachaHarness = {
  id: string;
  title: string;
  domain: BenchmarkDomain;
  description: string;
  builder_type: BuilderType;
  builder_name: string;
  grade: Grade;
  total: number;
  axes: Record<BenchmarkAxis, number>;
  creature_emoji: string;
  /** 검증 일자 ISO */
  verified_at: string;
};

const a = (
  accuracy: number,
  completeness: number,
  time_save: number,
  domain_fit: number,
  user_satisfaction: number,
): Record<BenchmarkAxis, number> => ({
  accuracy,
  completeness,
  time_save,
  domain_fit,
  user_satisfaction,
});

export const GACHA_CATALOG: GachaHarness[] = [
  // ─── 사람 빌더 — 본인 33+개 시드 (10개) ──────────
  {
    id: 'h_jin_001',
    title: '협회·비영리 사무 자동화',
    domain: 'admin',
    description:
      '공문·메일·업무일지·회의록 5개 스킬. 회원 관리 시스템(PMS) 연동 가능. 8개월 실 운영 검증.',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'S',
    total: 96,
    axes: a(98, 96, 92, 99, 94),
    creature_emoji: '📋',
    verified_at: '2026-05-05',
  },
  {
    id: 'h_jin_002',
    title: '카페·소상공인 매출 정산기',
    domain: 'cafe_business',
    description:
      '토스플레이스 엑셀·카드/현금 분리 + 일별/주간/월간 자동 정산. 15개월 실데이터 검증.',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'A',
    total: 91,
    axes: a(95, 92, 88, 93, 87),
    creature_emoji: '☕',
    verified_at: '2026-05-04',
  },
  {
    id: 'h_jin_003',
    title: '범용 제안서 작성 하네스',
    domain: 'general',
    description:
      '공모전·R&D·사업계획서 4섹션 자동 작성 + 자체 채점 90점 통과 보증 루프. 4건 통과 검증.',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'A',
    total: 89,
    axes: a(92, 90, 85, 91, 87),
    creature_emoji: '📝',
    verified_at: '2026-05-03',
  },
  {
    id: 'h_jin_004',
    title: '카톡방 텍스트 마이닝',
    domain: 'research',
    description:
      '오픈채팅방 대화 → 장소 데이터 추출 + Naver/Kakao API 보강 → Supabase 업로드. 12 에이전트 파이프라인.',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'A',
    total: 88,
    axes: a(90, 88, 92, 85, 85),
    creature_emoji: '🔬',
    verified_at: '2026-05-01',
  },
  {
    id: 'h_jin_005',
    title: '범용 비주얼 생성기',
    domain: 'design',
    description:
      'Gemini Nano Banana 2 기반 8 모드(다이어그램·슬라이드·로고·아이콘·포스터·배너·인포그래픽·소셜카드).',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'A',
    total: 87,
    axes: a(85, 90, 88, 86, 88),
    creature_emoji: '🎨',
    verified_at: '2026-05-02',
  },
  {
    id: 'h_jin_006',
    title: '옵시디언 위키 자동 동기화',
    domain: 'general',
    description: '하네스 활동·일간노트·세션 종료 자동 기록. 11일치 백업 데이터 검증.',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'B',
    total: 82,
    axes: a(85, 82, 88, 78, 78),
    creature_emoji: '📚',
    verified_at: '2026-05-01',
  },
  {
    id: 'h_jin_007',
    title: '교육·아카데미 운영 하네스',
    domain: 'admin',
    description: '교육 사업 매니징 — 모집·강의·행사·재무·홍보 7 스킬. 10기 규모 운영 검증.',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'B',
    total: 81,
    axes: a(83, 84, 78, 85, 75),
    creature_emoji: '🎓',
    verified_at: '2026-04-30',
  },
  {
    id: 'h_jin_008',
    title: '보도자료 4모드 작성기',
    domain: 'general',
    description:
      '정부·협회·창업·위기대응 4모드. 한국 언론 표준 양식·역피라미드·금기 표현 차단.',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'B',
    total: 79,
    axes: a(85, 78, 80, 82, 70),
    creature_emoji: '📰',
    verified_at: '2026-04-29',
  },
  {
    id: 'h_jin_009',
    title: '이미지 → HTML 변환기',
    domain: 'engineering',
    description:
      '이미지 1장 → HTML+CSS+SVG. 4 모드(UI·art-canvas·vectorize·outpaint) + 마우스 parallax.',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'B',
    total: 76,
    axes: a(82, 75, 78, 70, 75),
    creature_emoji: '🖼',
    verified_at: '2026-04-24',
  },
  {
    id: 'h_jin_010',
    title: '커리어 메타인지 점수화',
    domain: 'research',
    description:
      '활동 5차원(역량·관계·산출물·메타·실행) 점수화 + HTML 대시보드 + 자기소개서 자동 생성.',
    builder_type: 'human',
    builder_name: '이진명',
    grade: 'A',
    total: 90,
    axes: a(92, 91, 87, 88, 92),
    creature_emoji: '🔬',
    verified_at: '2026-04-16',
  },

  // ─── AI 빌더 — T1 자동 생성 (8개) ───────────
  {
    id: 'h_ai_001',
    title: '시험문제 출제 도우미',
    domain: 'education',
    description:
      '학년·과목·난이도 입력 → 객관식/서술형 균형 5~10문항 + 정답·해설. 교사 검수 대기 단계 명시.',
    builder_type: 'ai',
    builder_name: '우하귀 AI',
    grade: 'A',
    total: 86,
    axes: a(88, 85, 92, 80, 85),
    creature_emoji: '📝',
    verified_at: '2026-05-05',
  },
  {
    id: 'h_ai_002',
    title: '주간 업무보고서 자동',
    domain: 'admin',
    description:
      '이번주 실적·다음주 계획·이슈 3섹션 자동. 1페이지 분량 강제. 협회·기업 행정 격식.',
    builder_type: 'ai',
    builder_name: '우하귀 AI',
    grade: 'A',
    total: 85,
    axes: a(87, 88, 85, 82, 83),
    creature_emoji: '📋',
    verified_at: '2026-05-05',
  },
  {
    id: 'h_ai_003',
    title: '회의 액션 아이템 추출',
    domain: 'general',
    description:
      '회의록·녹음 → 액션 아이템 N개 (담당자·마감·내용). 모호 표현 자동 보완.',
    builder_type: 'ai',
    builder_name: '우하귀 AI',
    grade: 'B',
    total: 82,
    axes: a(85, 82, 88, 78, 78),
    creature_emoji: '✅',
    verified_at: '2026-05-04',
  },
  {
    id: 'h_ai_004',
    title: '논문 초록 한국어 요약',
    domain: 'research',
    description: '영문 초록 → 한국어 3문단 요약. 학술 용어 보존. APA 인용 자동 생성.',
    builder_type: 'ai',
    builder_name: '우하귀 AI',
    grade: 'B',
    total: 78,
    axes: a(82, 78, 80, 78, 72),
    creature_emoji: '📚',
    verified_at: '2026-05-04',
  },
  {
    id: 'h_ai_005',
    title: 'CTA 카피 5종 생성기',
    domain: 'design',
    description: '랜딩 페이지·SNS 광고용 행동 유도 카피 5개 + 시각 가이드 1줄씩.',
    builder_type: 'ai',
    builder_name: '우하귀 AI',
    grade: 'B',
    total: 76,
    axes: a(72, 80, 88, 70, 72),
    creature_emoji: '🎨',
    verified_at: '2026-05-03',
  },
  {
    id: 'h_ai_006',
    title: 'TypeScript 함수 작성 도우미',
    domain: 'engineering',
    description: '요구사항 → 함수 구현 + 타입 + Jest 테스트 케이스 1~3개.',
    builder_type: 'ai',
    builder_name: '우하귀 AI',
    grade: 'C',
    total: 73,
    axes: a(78, 72, 80, 68, 68),
    creature_emoji: '🧑‍💻',
    verified_at: '2026-05-03',
  },
  {
    id: 'h_ai_007',
    title: '협업 제안 메일 작성',
    domain: 'general',
    description: '같은 분야 회사에 콜라보 제안. 격식 5단 구조 강제. 자연스러운 한국어.',
    builder_type: 'ai',
    builder_name: '우하귀 AI',
    grade: 'C',
    total: 71,
    axes: a(75, 73, 78, 65, 64),
    creature_emoji: '✉️',
    verified_at: '2026-05-02',
  },
  {
    id: 'h_ai_008',
    title: '카페 발주 리스트 생성',
    domain: 'cafe_business',
    description: '재고 현황 + 1주 평균 사용량 → 우선순위별 발주 리스트.',
    builder_type: 'ai',
    builder_name: '우하귀 AI',
    grade: 'C',
    total: 69,
    axes: a(72, 70, 75, 65, 63),
    creature_emoji: '📦',
    verified_at: '2026-05-02',
  },
];

export const CATALOG_SIZE = GACHA_CATALOG.length;

export type BuilderFilter = 'all' | 'human' | 'ai';

// ─── 마이 컬렉션 (뽑은 카드 누적, localStorage) ────
const COLLECTION_KEY = 'uhagwi.collection.v0_1';

export function loadCollection(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COLLECTION_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function addToCollection(ids: string[]): string[] {
  if (typeof window === 'undefined') return [];
  const existing = loadCollection();
  const merged = Array.from(new Set([...existing, ...ids]));
  try {
    window.localStorage.setItem(COLLECTION_KEY, JSON.stringify(merged));
  } catch {
    /* 무시 */
  }
  return merged;
}

export function getCatalogById(id: string): GachaHarness | undefined {
  return GACHA_CATALOG.find((h) => h.id === id);
}

export function filterCatalog(
  filter: BuilderFilter,
  domain?: BenchmarkDomain,
): GachaHarness[] {
  return GACHA_CATALOG.filter((h) => {
    if (filter !== 'all' && h.builder_type !== filter) return false;
    if (domain && h.domain !== domain) return false;
    return true;
  });
}

/** Fisher-Yates 셔플로 N장 추출 (등급별 가중치는 v0.2에서) */
export function drawCards(pool: GachaHarness[], n: number): GachaHarness[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const ai = arr[i];
    const aj = arr[j];
    if (ai === undefined || aj === undefined) continue;
    arr[i] = aj;
    arr[j] = ai;
  }
  return arr.slice(0, n);
}
