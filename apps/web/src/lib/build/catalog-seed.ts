// 하네스 에디터 기성 블록 카탈로그 시드 데이터.
// 범용·재사용 가능한 AI 하네스 빌딩블록 모음.
// 정책: 특정 기관·인물·지역·제품 고유명 비노출 — intimate-context 가드 동일 방향.

import type { BlockKind } from './draft';
import { getSeedFeedRows } from '@/lib/seed/showcase-harnesses';

export type CatalogSeedBlock = {
  kind: Exclude<BlockKind, 'persona'>;
  label: string;
  body: string;
};

// 기성 블록 17개 — kind 분포: memory 3 · skill 5 · agent 3 · tool 3 · gate 3
export const CATALOG_SEED: CatalogSeedBlock[] = [
  // ─── 메모리 (3) ───────────────────────────────────────────────────────────
  {
    kind: 'memory',
    label: '사용자 선호 기억',
    body: '작업 스타일·결과 형식·자주 쓰는 표현 등 사용자 고유 선호를 장기 보관한다.',
  },
  {
    kind: 'memory',
    label: '과거 산출물 색인',
    body: '이전에 생성한 문서·코드·리포트를 색인해 재사용·참조 가능한 기억 창고로 유지한다.',
  },
  {
    kind: 'memory',
    label: '반복 요청 패턴 추적',
    body: '자주 등장하는 작업 유형을 기록해 다음 요청 시 맥락 없이도 즉시 처리할 수 있게 한다.',
  },

  // ─── 스킬 (5) ────────────────────────────────────────────────────────────
  {
    kind: 'skill',
    label: '일일 브리핑 생성',
    body: '전날 이슈·오늘 일정·우선순위를 정리해 매일 아침 한 페이지 요약을 자동 작성한다.',
  },
  {
    kind: 'skill',
    label: '회의록 → 액션아이템 추출',
    body: '비정형 회의 텍스트에서 담당자·기한·결정 사항을 추출해 구조화된 액션 목록으로 변환한다.',
  },
  {
    kind: 'skill',
    label: '주간 리포트 자동 작성',
    body: '산출물·이슈·완료 현황을 집계해 이해관계자 배포용 주간 리포트 초안을 생성한다.',
  },
  {
    kind: 'skill',
    label: '문서 초안 → 구조 개선',
    body: '논리 흐름·중복·제목 계층을 분석해 가독성 높은 구조로 자동 재편집한다.',
  },
  {
    kind: 'skill',
    label: '데이터 요약 시각화',
    body: '표나 CSV 데이터를 받아 핵심 지표를 뽑고 차트·인사이트 문단을 한 번에 생성한다.',
  },

  // ─── 에이전트 (3) ─────────────────────────────────────────────────────────
  {
    kind: 'agent',
    label: '검증 리뷰어',
    body: '산출물을 독립적으로 검토해 사실 오류·형식 미달·일관성 문제를 PASS/WARN/FAIL로 리포트한다.',
  },
  {
    kind: 'agent',
    label: '리서치 탐색가',
    body: '주어진 주제를 다각도로 조사해 핵심 근거·관련 자료·요약 인사이트를 구조화해 반환한다.',
  },
  {
    kind: 'agent',
    label: '요약 분석가',
    body: '긴 문서·로그·리포트를 받아 핵심만 추출해 짧고 행동 가능한 요약으로 변환한다.',
  },

  // ─── 도구 (3) ────────────────────────────────────────────────────────────
  {
    kind: 'tool',
    label: '캘린더 연동',
    body: '외부 캘린더 API를 읽어 일정·마감·미팅을 하네스 작업 흐름에 실시간 반영한다.',
  },
  {
    kind: 'tool',
    label: '웹 검색',
    body: '최신 정보가 필요할 때 검색 엔진 API를 호출해 결과를 문맥에 맞게 주입한다.',
  },
  {
    kind: 'tool',
    label: '파일 스캐너',
    body: '지정 경로의 파일·폴더를 순회해 내용을 읽고 처리 대상 목록으로 넘긴다.',
  },

  // ─── 가드레일 (3) ────────────────────────────────────────────────────────
  {
    kind: 'gate',
    label: '발송 전 사실 검증',
    body: '외부 발송 전 통계·날짜·고유명의 사실 여부를 독립 검증해 오정보 유출을 차단한다.',
  },
  {
    kind: 'gate',
    label: '톤·금칙어 가드',
    body: '결과물이 설정된 톤 가이드를 따르는지, 금칙어·부적절 표현이 없는지 자동 검사한다.',
  },
  {
    kind: 'gate',
    label: '스키마 유효성',
    body: '출력 JSON·테이블이 정의된 스키마를 충족하는지 검사해 하위 단계 오류를 미리 차단한다.',
  },
];

// ─── 이식 탭 데이터 ────────────────────────────────────────────────────────

export interface ImportItem {
  slug: string;
  emoji: string;
  title: string;
  oneLiner: string;
}

/** 쇼케이스 시드를 이식 탭 포맷으로 변환 */
export function getImportItems(): ImportItem[] {
  return getSeedFeedRows().map((row) => ({
    slug: row.slug,
    emoji: row.thumbnail_emoji ?? '📦',
    title: row.title,
    oneLiner: row.one_liner,
  }));
}
