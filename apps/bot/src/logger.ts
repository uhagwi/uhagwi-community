/**
 * pino 로거 인스턴스.
 * - 개발 환경: pino-pretty 로 사람이 읽기 쉬운 포맷
 * - 운영 환경: JSON 한 줄 로그 (로그 수집기 친화)
 */
import pino from "pino";
import { env } from "./config.js";

const isDev = env.NODE_ENV !== "production";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { app: "uhagwi-bot" },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss.l",
            ignore: "pid,hostname,app",
          },
        },
      }
    : {}),
});
