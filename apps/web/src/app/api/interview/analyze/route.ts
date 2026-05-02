/**
 * POST /api/interview/analyze — 종합 분석 (Anthropic Opus 4.7).
 *
 * 입력: 인터뷰 메시지 히스토리
 * 출력: 페르소나 코드 + 요약 + 강점/약점 + 자동화 후보 톱5 + creature 타입 (JSON)
 *
 * Haiku 인터뷰가 [INTERVIEW_COMPLETE] 토큰을 내면 클라이언트가 본 라우트 호출.
 */
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { INTERVIEW_ANALYZE_PROMPT } from '@/app/interview/system-prompt';
import { problem } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 90;

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(2).max(80),
});

const AnalyzeResultSchema = z.object({
  persona_code: z.string().min(2).max(40),
  persona_name_kr: z.string().min(2).max(80),
  summary: z.string().min(20).max(800),
  strengths: z.array(z.string()).min(1).max(6),
  watch_outs: z.array(z.string()).min(0).max(6),
  auto_candidates: z
    .array(
      z.object({
        rank: z.number().int().min(1).max(10),
        title: z.string().min(2).max(80),
        domain: z.string().min(2).max(40),
        why: z.string().min(10).max(400),
        estimated_save_min_per_week: z.number().int().min(0).max(2000),
      }),
    )
    .min(3)
    .max(8),
  total_save_min_per_week: z.number().int().min(0).max(10000),
  recommended_first_demo: z.number().int().min(1).max(10),
  creature_type: z.enum(['coder', 'writer', 'analyst', 'designer', 'researcher']),
  creature_personality: z.string().min(2).max(120),
});

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
      errors: parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      system: INTERVIEW_ANALYZE_PROMPT,
      messages: parsed.data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = message.content
      .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    // 코드 펜스 제거 (모델이 무심코 넣을 경우 방어)
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    let parsedResult: unknown;
    try {
      parsedResult = JSON.parse(cleaned);
    } catch {
      return problem('internal', {
        detail: `JSON 파싱 실패: ${cleaned.slice(0, 200)}`,
      });
    }

    const validated = AnalyzeResultSchema.safeParse(parsedResult);
    if (!validated.success) {
      return problem('internal', {
        detail: 'Opus 출력 스키마 검증 실패',
        errors: validated.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return Response.json({
      ok: true,
      result: validated.data,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return problem('internal', { detail: `Opus 호출 실패: ${msg}` });
  }
}
