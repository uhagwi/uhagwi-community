/**
 * 봇 → 웹 이벤트 송신 클라이언트.
 *
 * 규약 (docs/service-dev/02_design/api.md §3-2):
 * - 엔드포인트: POST {WEB_BASE_URL}/api/webhooks/bot
 * - 헤더 X-Bot-Signature: sha256=<hex(hmac(secret, timestamp + "." + body))>
 * - 헤더 X-Bot-Timestamp: unix seconds (웹에서 5분 윈도우 검증)
 *
 * 이벤트 종류: member.joined | member.kicked | message.reacted | bot.health
 */
import { createHmac } from "node:crypto";
import { env } from "../config.js";
import { logger } from "../logger.js";

export type BotEventKind =
  | "member.joined"
  | "member.kicked"
  | "message.reacted"
  | "bot.health";

export interface BotEvent<P = Record<string, unknown>> {
  event: BotEventKind;
  payload: P;
}

/** 공유 시크릿 + timestamp + body 로 HMAC-SHA256 서명 생성 */
function sign(body: string, timestamp: string): string {
  const mac = createHmac("sha256", env.DISCORD_BOT_WEBHOOK_SECRET);
  mac.update(`${timestamp}.${body}`);
  return `sha256=${mac.digest("hex")}`;
}

/**
 * 웹에 이벤트를 전송한다. 실패해도 봇은 계속 돌아야 하므로
 * 에러는 throw 하지 않고 로그로만 남긴다 (fire-and-forget).
 */
export async function sendWebEvent<P>(ev: BotEvent<P>): Promise<void> {
  const url = `${env.WEB_BASE_URL}/api/webhooks/bot`;
  const body = JSON.stringify(ev);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = sign(body, timestamp);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-bot-signature": signature,
        "x-bot-timestamp": timestamp,
      },
      body,
    });
    if (!res.ok) {
      logger.warn(
        { status: res.status, event: ev.event },
        "웹 이벤트 전송 실패 (non-2xx)",
      );
      return;
    }
    logger.debug({ event: ev.event }, "웹 이벤트 전송 OK");
  } catch (err) {
    logger.error({ err, event: ev.event }, "웹 이벤트 전송 중 예외");
  }
}
