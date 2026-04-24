/**
 * 슬래시 커맨드 레지스트리.
 *
 * 새 커맨드 추가 = 파일 생성 후 이 배열에 넣기만 하면 된다.
 * deploy-commands 와 interactionCreate 핸들러가 이 배열을 참조한다.
 */
import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

import * as ping from "./ping.js";
import * as harnessShare from "./harness-share.js";

export interface BotCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export const commands: BotCommand[] = [ping, harnessShare];

/** 이름 → 커맨드 빠른 조회 맵 */
export const commandMap: ReadonlyMap<string, BotCommand> = new Map(
  commands.map((c) => [c.data.name, c]),
);
