/**
 * POST /api/interview/chat — 인터뷰 챗봇 (Anthropic 비스트리밍).
 *
 * 비스트리밍 사용 사유: WSL/Vercel 환경에서 SSE 끊김 잦음.
 * 한국어 짧은 응답(~200자)이라 사용자 체감 차이 작음 + 안정성 압도적.
 *
 * 입력: 메시지 히스토리 (user/assistant)
 * 출력: { text, usage } JSON
 *
 * 종료 토큰 [INTERVIEW_COMPLETE] 가 응답에 포함되면 클라이언트가 종료 처리.
 */
import Anthropic from '@anthropic-ai/sdk';
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

  const client = new Anthropic({
    apiKey,
    maxRetries: 2,
    timeout: 50_000,
  });

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: INTERVIEW_SYSTEM_PROMPT,
      messages: parsed.data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = message.content
      .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return Response.json({
      text,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });
  } catch (err) {
    const e = err as { status?: number; message?: string; name?: string; error?: { message?: string } };
    const detail = `${e.name ?? 'Error'}: ${e.error?.message ?? e.message ?? 'unknown'}`;
    const status = e.status ?? 500;
    console.error('[interview/chat] Anthropic 호출 실패', { status, detail });
    return problem('internal', {
      detail: `Anthropic API 호출 실패 (status ${status}): ${detail}`,
    });
  }
}

export function GET() {
  return internal('POST 만 지원 — JSON body { messages: [{role, content}, ...] } 보내주세요.');
}
