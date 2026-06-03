// 인터뷰 추천 블록 저장소 — Phase 5
// 인터뷰 핸드오프 시 생성된 추천 블록 원본 세트를 별도 보존.
// 사용자가 캔버스에서 블록을 삭제해도 이 원본은 유지되어
// 카탈로그 '추천' 탭에서 언제든 재담을 수 있다.

import type { Block } from './draft';

export const RECOMMENDED_KEY = 'uhagwi.build.recommended';

/**
 * 추천 블록 목록을 localStorage에 저장한다.
 * 브라우저 환경이 아니거나 저장 실패 시 조용히 무시.
 */
export function saveRecommended(blocks: Block[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECOMMENDED_KEY, JSON.stringify(blocks));
  } catch {
    /* localStorage 비활성/용량초과 — 무시 */
  }
}

/**
 * 저장된 추천 블록 목록을 불러온다.
 * 없거나 파싱 실패 시 빈 배열 반환.
 */
export function loadRecommended(): Block[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECOMMENDED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Block[];
  } catch {
    return [];
  }
}
