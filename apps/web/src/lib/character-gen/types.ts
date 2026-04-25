/** Phase 2 캐릭터 자동 생성 타입 정의 */

export type CharacterCategory = 'verify' | 'improve' | 'proposal' | 'develop' | 'other';

export type CharacterPrompt = {
  /** 카테고리별 베이스 템플릿 */
  category: CharacterCategory;
  /** 본문에서 추출한 한 줄 brief — 예: "검증이, 돋보기 든 보라 통통이" */
  brief: string;
  /** 최종 이미지 생성 API에 전달될 풀 프롬프트 */
  fullPrompt: string;
  /** 시드 (재현용) */
  seed?: number;
};

export type GeneratedCharacter = {
  url: string; // Supabase Storage public URL
  prompt_used: CharacterPrompt;
  generated_at: string; // ISO8601
  cost_usd: number; // 비용 추적
};
