/**
 * POST /api/interview/analyze — 인터뷰 종합 분석 (Anthropic Opus 4.7).
 * 모드: phase2 (업무 추천) · phase4 (자동화 후보) · theme (단일 테마) · comprehensive (종합).
 *
 * 분리: lib/interview/analyze/{schemas,prompts,anthropic,sanitize,dispatch}.ts
 */
import { NextRequest } from 'next/server';
import { problem } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';
import { RequestSchema } from '@/lib/interview/analyze/schemas';
import { pickMode, pickModelAndSystem, buildUserPrompt } from '@/lib/interview/analyze/prompts';
import { callAnthropic, extractText, stripCodeFence } from '@/lib/interview/analyze/anthropic';
import { sanitizeAutoCandidates } from '@/lib/interview/analyze/sanitize';
import { validateAndRespond } from '@/lib/interview/analyze/dispatch';

export const runtime = 'nodejs';
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return problem('internal', {
      detail:
        'ANTHROPIC_API_KEY 환경변수가 없습니다. Vercel Settings → Environment Variables에서 등록 후 Redeploy 해주세요.',
    });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon';
  const rl = await checkRateLimit('publish', ip);
  if (!rl.ok) {
    return problem('rate-limit', {
      detail: '잠시 후 다시 시도해주세요.',
      headers: rl.retryAfter ? { 'retry-after': String(rl.retryAfter) } : undefined,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return problem('validation', { detail: 'JSON 파싱 실패' });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return problem('validation', {
      errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  const mode = pickMode(parsed.data);
  const { model, systemPrompt } = pickModelAndSystem(mode);
  const userPrompt = buildUserPrompt(mode, parsed.data);

  try {
    const result = await callAnthropic(apiKey, {
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user' as const, content: userPrompt }],
    });

    const cleaned = stripCodeFence(extractText(result));
    let parsedResult: unknown;
    try {
      parsedResult = JSON.parse(cleaned);
    } catch {
      return problem('internal', { detail: `JSON 파싱 실패: ${cleaned.slice(0, 200)}` });
    }

    sanitizeAutoCandidates(parsedResult);
    return validateAndRespond(mode, parsedResult, result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[interview/analyze] Anthropic 호출 실패', msg);
    return problem('internal', { detail: `Anthropic Opus 호출 실패: ${msg}` });
  }
}
