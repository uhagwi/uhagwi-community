/**
 * 모드별 zod 스키마 검증 + 응답 형식 통일.
 */
import {
  AnalyzeResultSchema,
  Phase2ResultSchema,
  Phase4ResultSchema,
  ThemeAnalyzeResultSchema,
} from './schemas';
import type { AnalyzeMode } from './prompts';
import type { AnthropicResponse } from './anthropic';
import { problem } from '@/lib/problem';

const MODE_META: Record<
  AnalyzeMode,
  { mode: string; schema: typeof Phase2ResultSchema | typeof Phase4ResultSchema | typeof ThemeAnalyzeResultSchema | typeof AnalyzeResultSchema; failDetail: string }
> = {
  phase2: { mode: 'phase2_tasks', schema: Phase2ResultSchema, failDetail: 'Phase 2 출력 스키마 검증 실패' },
  phase4: { mode: 'phase4_automation', schema: Phase4ResultSchema, failDetail: 'Phase 4 출력 스키마 검증 실패' },
  theme: { mode: 'theme', schema: ThemeAnalyzeResultSchema, failDetail: '테마 분석 출력 스키마 검증 실패' },
  comprehensive: { mode: 'comprehensive', schema: AnalyzeResultSchema, failDetail: 'Opus 출력 스키마 검증 실패' },
};

export function validateAndRespond(
  mode: AnalyzeMode,
  parsedResult: unknown,
  apiResponse: AnthropicResponse,
): Response {
  const meta = MODE_META[mode];
  const validated = meta.schema.safeParse(parsedResult);
  if (!validated.success) {
    return problem('internal', {
      detail: meta.failDetail,
      errors: validated.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  return Response.json({
    ok: true,
    mode: meta.mode,
    result: validated.data,
    usage: apiResponse.usage,
  });
}
