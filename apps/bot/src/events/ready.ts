/**
 * ClientReady — 봇 로그인 완료 시 한 번 발생.
 * 웹에 bot.health 핑을 쏴서 "봇 기동 중" 상태를 알리는 기회이기도 함.
 */
import { Client, Events } from "discord.js";
import { logger } from "../logger.js";
import { sendWebEvent } from "../webhooks/client.js";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client<true>): Promise<void> {
  logger.info(
    {
      user: client.user.tag,
      guilds: client.guilds.cache.size,
    },
    "봇 로그인 완료",
  );

  // 웹에 헬스 알림 (실패해도 무시)
  await sendWebEvent({
    event: "bot.health",
    payload: {
      status: "online",
      bot_tag: client.user.tag,
      guild_count: client.guilds.cache.size,
    },
  });
}
