/**
 * /api/webhooks/bot — Discord 봇 이벤트 수신
 * 근거: docs/service-dev/02_design/api.md §3-2
 *
 * 인증: X-Bot-Signature (HMAC-SHA256, sha256= 프리픽스) + X-Bot-Timestamp (5분 윈도우)
 * 이벤트:
 *   member.joined  → users(discord_id) status=active + can_post=true (없으면 placeholder)
 *   member.kicked  → users(discord_id) can_post=false + status=suspended
 *   message.reacted → Phase 2 (웹 카운트 가산) — not-implemented
 *   bot.health     → 응답만 기록
 */
import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { problem, notImplemented, internal } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';
import { getDb } from '@/lib/db';

const MemberPayload = z.object({
  discord_id: z.string().min(1),
  username: z.string().nullish(),
  global_name: z.string().nullish(),
});

const BotEventSchema = z.discriminatedUnion('event', [
  z.object({ event: z.literal('member.joined'), payload: MemberPayload }),
  z.object({ event: z.literal('member.kicked'), payload: MemberPayload }),
  z.object({ event: z.literal('message.reacted'), payload: z.record(z.unknown()).optional() }),
  z.object({ event: z.literal('bot.health'), payload: z.record(z.unknown()).optional() }),
]);

const TIMESTAMP_WINDOW_SEC = 5 * 60;

function verifySignature(
  signed: string,
  signature: string | null,
  secret: string | undefined,
): boolean {
  if (!signature || !secret) return false;
  const sigHex = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  const expected = createHmac('sha256', secret).update(signed).digest('hex');
  try {
    const a = Buffer.from(sigHex, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

type MemberPayloadT = z.infer<typeof MemberPayload>;

async function handleMemberJoined(p: MemberPayloadT): Promise<Response> {
  const db = getDb();
  const displayName = p.global_name ?? p.username ?? `user_${p.discord_id.slice(-6)}`;
  const handle = `pending_${p.discord_id.slice(-8)}`.toLowerCase();

  const { data: existing } = await db
    .from('users')
    .select('id, status, can_post')
    .eq('discord_id', p.discord_id)
    .maybeSingle();

  if (existing) {
    const { error } = await db
      .from('users')
      .update({ status: 'active', can_post: true, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) return internal(`users update 실패: ${error.message}`);
    return Response.json({ ok: true, action: 'reactivated', user_id: existing.id });
  }

  const { data: inserted, error: insErr } = await db
    .from('users')
    .insert({
      discord_id: p.discord_id,
      handle,
      display_name: displayName,
      status: 'active',
      can_post: true,
    })
    .select('id')
    .single();
  if (insErr || !inserted) {
    return internal(`users insert 실패: ${insErr?.message ?? 'unknown'}`);
  }
  return Response.json({ ok: true, action: 'created', user_id: inserted.id });
}

async function handleMemberKicked(p: MemberPayloadT): Promise<Response> {
  const db = getDb();
  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('discord_id', p.discord_id)
    .maybeSingle();

  if (!existing) {
    return Response.json({ ok: true, action: 'noop_no_user' });
  }

  const { error } = await db
    .from('users')
    .update({
      status: 'suspended',
      can_post: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);
  if (error) return internal(`users suspend 실패: ${error.message}`);
  return Response.json({ ok: true, action: 'suspended', user_id: existing.id });
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit('bot', 'global');
  if (!rl.ok) return problem('rate-limit');

  const signature = req.headers.get('x-bot-signature');
  const timestamp = req.headers.get('x-bot-timestamp');
  const raw = await req.text();

  if (!timestamp || !/^\d+$/.test(timestamp)) {
    return problem('forbidden', { detail: 'X-Bot-Timestamp 누락 또는 형식 오류' });
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - Number(timestamp)) > TIMESTAMP_WINDOW_SEC) {
    return problem('forbidden', { detail: '타임스탬프 윈도우 초과' });
  }

  const signed = `${timestamp}.${raw}`;
  if (!verifySignature(signed, signature, process.env.DISCORD_BOT_WEBHOOK_SECRET)) {
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

  switch (parsed.data.event) {
    case 'bot.health':
      return Response.json({ ok: true, received_at: new Date().toISOString() });
    case 'member.joined':
      return handleMemberJoined(parsed.data.payload);
    case 'member.kicked':
      return handleMemberKicked(parsed.data.payload);
    case 'message.reacted':
      return notImplemented('message.reacted — Phase 2 대기');
  }
}
