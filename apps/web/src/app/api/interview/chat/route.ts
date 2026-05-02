/**
 * POST /api/interview/chat — 인터뷰 챗봇 (Anthropic 스트리밍).
 *
 * 입력: 메시지 히스토리 (user/assistant)
 * 출력: SSE 스트리밍 텍스트 (Anthropic Claude Haiku 4.5)
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

  // Rate limit — IP 기반 (NextAuth 세션 추가 시 user.id로 교체)
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

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = await client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: INTERVIEW_SYSTEM_PROMPT,
          messages: parsed.data.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        for await (const event of messageStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const chunk = event.delta.text;
            controller.enqueue(encoder.encode(chunk));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        controller.enqueue(
          encoder.encode(`\n\n[ERROR] ${msg}\n`),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Accel-Buffering': 'no',
      'Cache-Control': 'no-cache',
    },
  });
}

export function GET() {
  return internal(
    'POST 만 지원 — JSON body { messages: [{role, content}, ...] } 보내주세요.',
  );
}
