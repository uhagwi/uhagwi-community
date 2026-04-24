/**
 * 슬래시 커맨드 등록 1회성 스크립트.
 *
 * 사용:
 *   pnpm deploy-commands       # .env 의 DISCORD_GUILD_ID 있으면 길드 등록(즉시 반영)
 *                              # 없으면 글로벌 등록 (반영 최대 1시간)
 *
 * 커맨드 정의를 변경할 때마다 다시 실행해야 한다.
 */
import { REST, Routes } from "discord.js";
import { env } from "./config.js";
import { logger } from "./logger.js";
import { commands } from "./commands/index.js";

async function main(): Promise<void> {
  const body = commands.map((c) => c.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);

  if (env.DISCORD_GUILD_ID) {
    logger.info(
      { guildId: env.DISCORD_GUILD_ID, count: body.length },
      "길드 커맨드 등록 시작",
    );
    const route = Routes.applicationGuildCommands(
      env.DISCORD_CLIENT_ID,
      env.DISCORD_GUILD_ID,
    );
    await rest.put(route, { body });
    logger.info("길드 커맨드 등록 완료 (즉시 반영)");
  } else {
    logger.info({ count: body.length }, "글로벌 커맨드 등록 시작");
    const route = Routes.applicationCommands(env.DISCORD_CLIENT_ID);
    await rest.put(route, { body });
    logger.info("글로벌 커맨드 등록 완료 (전파까지 최대 1시간)");
  }
}

main().catch((err) => {
  logger.fatal({ err }, "커맨드 등록 실패");
  process.exit(1);
});
