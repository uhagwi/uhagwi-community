/**
 * /api/webhooks/bot — Discord 봇 이벤트 수신
 * 근거: docs/service-dev/02_design/api.md §3-2
 *
 * 인증: X-Bot-Signature (HMAC-SHA256) + X-Bot-Timestamp (5분 윈도우)
 * 이벤트:
 *   member.joined  → users.status=active, 환영 DM
 *   member.kicked  → users.can_post=false
 *   message.reacted (Phase 2) → 웹 카운트 가산
 *   bot.health     → 응답만 기록
 */
import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { problem, notImplemented } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';

const BotEventSchema = z.object({
  event: z.enum(['member.joined', 'member.kicked', 'message.reacted', 'bot.health']),
  discord_user_id: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  timestamp: z.number().int(),
});

const TIMESTAMP_WINDOW_MS = 5 * 60 * 1000;

/** HMAC 서명 검증 — 실패 시 null 반환 */
function verifySignature(raw: string, signature: string | null, secret: string | undefined): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  try {
    const a = Buffer.from(signature, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Rate limit: bot — 120/60s/global
  const rl = await checkRateLimit('bot', 'global');
  if (!rl.ok) return problem('rate-limit');

  const signature = req.headers.get('x-bot-signature');
  const raw = await req.text();

  if (!verifySignature(raw, signature, process.env.DISCORD_BOT_WEBHOOK_SECRET)) {
    return problem('forbidden', { detail: 'HMAC 서명 검증 실패' });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return problem('validation', { detail: 'JSON 파싱 실패' });
  }

  const parsed = BotEventSchema.safeParse(body);
  if (!parsed.success) {
    return problem('validation', {
      errors: parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // 타임스탬프 replay 방어
  const now = Date.now();
  if (Math.abs(now - parsed.data.timestamp) > TIMESTAMP_WINDOW_MS) {
    return problem('forbidden', { detail: '타임스탬프 윈도우 초과' });
  }

  // TODO: 구현 — event 분기 처리
  //   member.joined → users.status='active', 환영 DM 큐
  //   member.kicked → users.can_post=false
  //   message.reacted → Phase 2 (웹 카운트 가산)
  //   bot.health → 단순 OK 반환
  if (parsed.data.event === 'bot.health') {
    return Response.json({ ok: true, received_at: new Date().toISOString() });
  }
  return notImplemented(`webhook ${parsed.data.event} — 구현 대기`);
}
