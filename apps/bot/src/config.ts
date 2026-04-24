/**
 * 환경변수 로드 및 Zod 검증.
 * 기동 시점에 한 번만 실행되며 검증 실패 시 프로세스를 즉시 종료한다.
 */
import "dotenv/config";
import { z } from "zod";

// 환경변수 스키마 — 누락·빈문자열은 명시적으로 실패시킨다.
const EnvSchema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(10, "DISCORD_BOT_TOKEN 필수"),
  DISCORD_CLIENT_ID: z.string().regex(/^\d{17,20}$/, "Discord 스노우플레이크 ID 형식이 아님"),
  // 길드 ID는 글로벌 배포 시 생략 가능
  DISCORD_GUILD_ID: z
    .string()
    .regex(/^\d{17,20}$/)
    .optional(),
  WEB_BASE_URL: z.string().url("WEB_BASE_URL은 URL 이어야 함"),
  DISCORD_BOT_WEBHOOK_SECRET: z.string().min(16, "HMAC 시크릿은 최소 16자"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // 검증 실패는 치명적 — 로거 생성 전일 수 있으므로 console 사용
  console.error("[config] 환경변수 검증 실패:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env: Env = parsed.data;
