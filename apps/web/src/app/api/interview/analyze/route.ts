/**
 * POST /api/interview/analyze — 종합 분석 (Anthropic Opus 4.7 직접 fetch).
 *
 * SDK 사용 안 함 — Vercel serverless 호환성 + 의존성 0.
 */
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

type AnthropicResponse = {
  content: Array<{ type: 'text'; text: string } | { type: string; [k: string]: unknown }>;
  usage: { input_tokens: number; output_tokens: number };
};

type AnthropicError = { type: 'error'; error: { type: string; message: string } };

async function callAnthropic(apiKey: string, body: object, retries = 1): Promise<AnthropicResponse> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
      if (!res.ok) {
        const errJson = (await res.json().catch(() => null)) as AnthropicError | null;
        const msg = errJson?.error?.message ?? `HTTP ${res.status}`;
        const e = new Error(`Anthropic API ${res.status}: ${msg}`);
        if (res.status >= 400 && res.status < 500) throw e;
        lastErr = e;
      } else {
        return (await res.json()) as AnthropicResponse;
      }
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt === retries) throw lastErr;
    }
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  throw lastErr ?? new Error('알 수 없는 오류');
}

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

  try {
    const result = await callAnthropic(apiKey, {
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      system: INTERVIEW_ANALYZE_PROMPT,
      messages: parsed.data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = result.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

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
        input_tokens: result.usage.input_tokens,
        output_tokens: result.usage.output_tokens,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[interview/analyze] Anthropic 호출 실패', msg);
    return problem('internal', { detail: `Anthropic Opus 호출 실패: ${msg}` });
  }
}
