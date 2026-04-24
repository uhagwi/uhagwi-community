/**
 * 우하귀 Discord 봇 진입점.
 *
 * - Client 를 생성하고 필요한 Intent 만 요청한다.
 * - events/ 의 모든 핸들러를 등록한다.
 * - SIGINT/SIGTERM 에서 Discord 커넥션을 정상 종료한다.
 */
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { env } from "./config.js";
import { logger } from "./logger.js";
import { events } from "./events/index.js";

const client = new Client({
  // 최소 권한 원칙 — 필요해지는 시점에만 추가한다.
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  // DM 반응·메시지 등은 partial 수신이 필요할 수 있어 준비만 해둠
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

// 이벤트 핸들러 일괄 등록
for (const handler of events) {
  const safe = async (...args: unknown[]): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (handler.execute as any)(...args);
    } catch (err) {
      logger.error({ err, event: handler.name }, "이벤트 핸들러 예외");
    }
  };
  if (handler.once) {
    client.once(handler.name, safe);
  } else {
    client.on(handler.name, safe);
  }
}

// 런타임 단계 로그용 훅
client.on("error", (err) => logger.error({ err }, "Client error"));
client.on("warn", (msg) => logger.warn({ msg }, "Client warn"));
client.on("shardDisconnect", (_evt, id) =>
  logger.warn({ shardId: id }, "샤드 연결 끊김"),
);
client.on("shardReconnecting", (id) =>
  logger.info({ shardId: id }, "샤드 재연결 시도"),
);

// 그레이스풀 셧다운 — 중복 호출 방지용 플래그
let shuttingDown = false;
async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "종료 신호 수신 — Discord 연결 해제 중");
  try {
    await client.destroy();
  } catch (err) {
    logger.error({ err }, "client.destroy 중 예외");
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) =>
  logger.error({ reason }, "unhandledRejection"),
);
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaughtException — 종료");
  void shutdown("SIGTERM");
});

// 로그인 — 실패 시 프로세스 종료
client.login(env.DISCORD_BOT_TOKEN).catch((err) => {
  logger.fatal({ err }, "Discord 로그인 실패");
  process.exit(1);
});
