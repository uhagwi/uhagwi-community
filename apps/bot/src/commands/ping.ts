/**
 * /ping — 기본 헬스체크 커맨드.
 * 왕복 지연(ws·api)을 함께 표시하여 네트워크 상태를 확인한다.
 */
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("봇이 살아있는지 확인합니다 (지연 시간 표시)");

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  // 지연 측정 — deferReply 전후 타이밍 차이로 API 왕복 확인
  const sent = await interaction.reply({
    content: "측정 중…",
    fetchReply: true,
    ephemeral: true,
  });

  const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
  const wsLatency = Math.round(interaction.client.ws.ping);

  await interaction.editReply(
    `pong  —  API ${apiLatency}ms · WebSocket ${wsLatency}ms`,
  );
}
