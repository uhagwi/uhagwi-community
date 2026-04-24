/**
 * InteractionCreate — 슬래시 커맨드 라우팅.
 *
 * 커맨드 이름으로 commandMap 에서 조회 → execute 호출.
 * 핸들러 내부 에러는 여기서 최종 캐치하여 사용자에게 일반 메시지만 보여준다.
 */
import { Events, type Interaction, type InteractionReplyOptions, MessageFlags } from "discord.js";
import { commandMap } from "../commands/index.js";
import { logger } from "../logger.js";

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);
  if (!command) {
    logger.warn({ name: interaction.commandName }, "알 수 없는 커맨드");
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    logger.error(
      { err, command: interaction.commandName, user: interaction.user.id },
      "커맨드 실행 중 예외",
    );
    const reply: InteractionReplyOptions = {
      content: "처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
      flags: MessageFlags.Ephemeral,
    };
    // 이미 응답했으면 followUp, 아니면 reply
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(reply).catch(() => undefined);
    } else {
      await interaction.reply(reply).catch(() => undefined);
    }
  }
}
