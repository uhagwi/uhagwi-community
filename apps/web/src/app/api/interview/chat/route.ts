/**
 * POST /api/interview/chat — 인터뷰 챗봇 (Anthropic Messages API 직접 fetch).
 *
 * SDK 사용 안 함 — Vercel serverless 환경에서 SDK가 "Connection error" 자주 던짐.
 * 직접 fetch가 의존성 0 + Vercel·로컬 동일 동작.
 *
 * 입력: 메시지 히스토리 (user/assistant)
 * 출력: { text, usage } JSON
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { INTERVIEW_SYSTEM_PROMPT } from '@/app/interview/system-prompt';
import { problem, internal } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(80),
});

type AnthropicResponse = {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{ type: 'text'; text: string } | { type: string; [k: string]: unknown }>;
  model: string;
  stop_reason: string | null;
  usage: { input_tokens: number; output_tokens: number };
};

type AnthropicError = {
  type: 'error';
  error: { type: string; message: string };
};

async function callAnthropic(
  apiKey: string,
  body: object,
  retries = 2,
): Promise<AnthropicResponse> {
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
        // 4xx 는 재시도 의미 없음 — 즉시 throw
        if (res.status >= 400 && res.status < 500) throw e;
        lastErr = e;
      } else {
        return (await res.json()) as AnthropicResponse;
      }
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      // 마지막 시도면 즉시 throw
      if (attempt === retries) throw lastErr;
    }
    // 짧은 backoff
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  throw lastErr ?? new Error('알 수 없는 오류');
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return problem('internal', {
      detail:
        'ANTHROPIC_API_KEY 환경변수가 없습니다. Vercel Settings → Environment Variables에서 등록하고 Redeploy 해주세요.',
    });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon';
  const rl = await checkRateLimit('write', ip);
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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: INTERVIEW_SYSTEM_PROMPT,
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

    return Response.json({
      text,
      usage: {
        input_tokens: result.usage.input_tokens,
        output_tokens: result.usage.output_tokens,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[interview/chat] Anthropic 호출 실패', msg);
    return problem('internal', {
      detail: `Anthropic API 호출 실패: ${msg}`,
    });
  }
}

export function GET() {
  return internal('POST 만 지원 — JSON body { messages: [{role, content}, ...] } 보내주세요.');
}
