/**
 * 이벤트 핸들러 레지스트리.
 * index.ts 의 client.on / client.once 로 일괄 등록된다.
 */
import type { ClientEvents } from "discord.js";

import * as ready from "./ready.js";
import * as interactionCreate from "./interactionCreate.js";

export interface BotEventHandler<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}

// 타입 단언 — 각 파일의 name 은 const 리터럴이므로 안전
export const events: BotEventHandler[] = [
  ready as unknown as BotEventHandler,
  interactionCreate as unknown as BotEventHandler,
];
