/**
 * analyze 라우트의 4개 모드별 system·user 프롬프트 빌더.
 * Phase 2 / Phase 4 / theme / comprehensive (default).
 */
import { INTERVIEW_ANALYZE_PROMPT } from '@/app/interview/system-prompt';
import { ANALYZE_THEME_PROMPT } from '@/app/interview/themes';
import {
  PHASE2_TASK_RECOMMEND_PROMPT,
  PHASE4_AUTOMATION_DISTILL_PROMPT,
} from '@/app/interview/phases';
import type { RequestBody } from './schemas';

export type AnalyzeMode = 'phase2' | 'phase4' | 'theme' | 'comprehensive';

export function pickMode(body: RequestBody): AnalyzeMode {
  if (body.phase === 2) return 'phase2';
  if (body.phase === 4) return 'phase4';
  if (body.theme_id) return 'theme';
  return 'comprehensive';
}

export function pickModelAndSystem(mode: AnalyzeMode): { model: string; systemPrompt: string } {
  switch (mode) {
    case 'phase2':
      return { model: 'claude-opus-4-7', systemPrompt: PHASE2_TASK_RECOMMEND_PROMPT };
    case 'phase4':
      return { model: 'claude-opus-4-7', systemPrompt: PHASE4_AUTOMATION_DISTILL_PROMPT };
    case 'theme':
      return { model: 'claude-haiku-4-5-20251001', systemPrompt: ANALYZE_THEME_PROMPT };
    case 'comprehensive':
      return { model: 'claude-opus-4-7', systemPrompt: INTERVIEW_ANALYZE_PROMPT };
  }
}

function joinConversation(
  messages: ReadonlyArray<{ role: 'user' | 'assistant'; content: string }>,
): string {
  return messages
    .map((m) => `[${m.role === 'user' ? '사용자' : '도반'}] ${m.content}`)
    .join('\n\n');
}

export function buildUserPrompt(mode: AnalyzeMode, body: RequestBody): string {
  const conversationText = joinConversation(body.messages);

  if (mode === 'phase2') {
    return `다음은 사용자와 도반의 Phase 1 (사람 파악) 대화입니다.\n시스템 프롬프트의 JSON 형식으로 이 사용자에게 필요한 업무 8~12개를 도출해주세요.\n\n---\n\n${conversationText}\n\n---\n\nJSON만 반환. 마크다운 코드 펜스 금지.`;
  }
  if (mode === 'phase4') {
    const phase3Text = joinConversation(body.phase3_messages ?? []);
    return `## Phase 1 인터뷰 (사람 파악)\n\n${conversationText}\n\n---\n\n## Phase 2 결과 (도출된 업무 후보)\n\n${body.phase2_result ?? '(없음)'}\n\n---\n\n## Phase 3 인터뷰 (자동화 욕구)\n\n${phase3Text || '(없음)'}\n\n---\n\n위 3 단계 데이터를 종합해 사용자가 *Phase 3에서 동의한* 업무를 자동화 후보 5~8개로 정제해주세요. JSON만 반환. 마크다운 코드 펜스 금지.`;
  }
  if (mode === 'theme') {
    return `테마: ${body.theme_id}\n\n다음 대화를 분석해 시스템 프롬프트의 JSON 형식으로만 응답해주세요.\n\n---\n\n${conversationText}\n\n---\n\nJSON만 반환. 마크다운 코드 펜스 금지.`;
  }
  return `다음은 사용자와 우하귀 진단 도반의 대화 전체입니다.\n시스템 프롬프트의 출력 형식(순수 JSON)에 따라 페르소나를 분석해주세요.\n\n---\n\n${conversationText}\n\n---\n\n위 대화를 바탕으로 JSON으로만 응답해주세요. 마크다운 코드 펜스 금지.`;
}
