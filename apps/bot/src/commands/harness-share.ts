/**
 * /harness-share <url> — 웹 하네스 상세 페이지 링크를 채널에 임베드로 공유.
 *
 * Journey B #7 (docs/service-dev/02_design/scenario.md) 의
 * "#하네스-자랑" 채널 크로스포스트 흐름을 사람이 직접 트리거할 수 있게 한 버전.
 * 자동 크로스포스트는 웹→봇 RPC (`POST /bot/v1/discord/message`) 로 수행된다.
 */
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const UHAGWI_HOST_RE = /^https?:\/\/(localhost(:\d+)?|([\w-]+\.)*uhagwi\.com)\/h\/[\w-]+\/?$/i;

export const data = new SlashCommandBuilder()
  .setName("harness-share")
  .setDescription("우하귀 하네스 상세 페이지 링크를 이 채널에 공유합니다")
  .addStringOption((opt) =>
    opt
      .setName("url")
      .setDescription("공유할 하네스 URL (예: https://uhagwi.com/h/slug)")
      .setRequired(true),
  )
  .addStringOption((opt) =>
    opt
      .setName("comment")
      .setDescription("한 줄 코멘트 (선택)")
      .setMaxLength(200)
      .setRequired(false),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const url = interaction.options.getString("url", true).trim();
  const comment = interaction.options.getString("comment") ?? undefined;

  // URL 허용 범위 검증 — 임의 사이트 임베드 방지
  if (!UHAGWI_HOST_RE.test(url)) {
    await interaction.reply({
      content: "우하귀 도메인(`/h/slug`)의 하네스 URL 만 공유할 수 있어요.",
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("하네스 공유")
    .setURL(url)
    .setDescription(comment ?? "이 하네스 한번 보실래요?")
    .setColor(0x5865f2)
    .setFooter({ text: `공유: ${interaction.user.username}` })
    .setTimestamp(new Date());

  await interaction.reply({ embeds: [embed] });
}
