/**
 * 하네스 캐릭터 자동 생성 진입점 (Phase 2 - DB 연결 후 활성화)
 * 근거: CHARACTERS.md §Phase 2
 *
 * Phase 1 (지금): SAMPLE_HARNESSES.thumbnail_url 이 정적 경로(/characters/{slug}.png) 참조.
 * Phase 2: 새 하네스 등록 시 이 함수가 백그라운드로 호출되어 thumbnail_url 자동 채움.
 */
import type { CharacterPrompt, GeneratedCharacter } from './types';

export type { CharacterPrompt, GeneratedCharacter } from './types';

/**
 * 하네스 본문에서 캐릭터 디자인 요약 추출 → 이미지 생성 → Storage 업로드.
 *
 * @param harnessId — DB harness id
 * @returns 업로드된 thumbnail_url 또는 null (실패 시 emoji fallback)
 *
 * TODO Phase 2:
 *   1) Claude Haiku 로 본문 → 한 줄 brief 추출
 *   2) buildPrompt(brief, category) — prompts.ts 의 템플릿에 주입
 *   3) Gemini Imagen API 호출 (gemini.ts)
 *   4) Supabase Storage 'characters/{slug}.png' 업로드 (storage.ts)
 *   5) UPDATE harnesses SET thumbnail_url = ? WHERE id = ?
 */
export async function generateCharacter(_harnessId: string): Promise<GeneratedCharacter | null> {
  // Phase 2 미구현
  return null;
}

/**
 * 본문 → 캐릭터 brief 추출 (Phase 2).
 * persona_name + tagline + components 를 종합해 한 문장 디자인 지시 생성.
 */
export async function extractCharacterBrief(_input: {
  persona_name: string | null;
  tagline: string;
  components: string[];
  category: string;
}): Promise<CharacterPrompt | null> {
  // Phase 2 미구현
  return null;
}
