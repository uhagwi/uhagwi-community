# @uhagwi/bot

우하귀 AI 하네스 커뮤니티의 Discord 봇.
discord.js v14 + TypeScript 기반, 웹(`apps/web`)과는 HMAC 서명된 HTTP 이벤트로만 통신한다.

## 책임 범위

- **슬래시 커맨드**: `/ping`, `/harness-share <url>` 등
- **웹 → 봇 RPC 수신**(Phase 2): `POST /bot/v1/discord/message` — 포스팅 발행 시 `#하네스-자랑` 크로스포스트 (현재는 웹 측 구현 대기 중이라 봇 측 HTTP 서버는 미포함 · v0.2 예정)
- **봇 → 웹 이벤트 송신**: `member.joined` · `member.kicked` · `bot.health` → `POST {WEB_BASE_URL}/api/bot/events` (HMAC-SHA256 `X-Bot-Signature`)

봇은 DB를 직접 만지지 않는다. 모든 데이터 변경은 웹 API 호출로 우회한다.

## 디렉토리

```
src/
  index.ts              # 진입점 (Client + 셧다운)
  config.ts             # env 검증 (Zod)
  logger.ts             # pino
  deploy-commands.ts    # 슬래시 커맨드 등록 스크립트
  commands/             # 슬래시 커맨드 (파일 하나 = 커맨드 하나)
    ping.ts
    harness-share.ts
    index.ts            # 레지스트리 (여기에만 추가하면 됨)
  events/               # 게이트웨이 이벤트 핸들러
    ready.ts
    interactionCreate.ts
    index.ts
  webhooks/
    client.ts           # 봇→웹 HMAC 송신
```

## 로컬 구동

```bash
# 0. 의존성 (모노레포 루트에서)
pnpm install

# 1. 환경변수 — 템플릿은 env.example (점 없는 파일명).
#    WSL 권한 정책상 이 리포에서는 점-파일 생성이 차단되어 있어 일반 파일로 둠.
cp env.example .env
#    DISCORD_BOT_TOKEN / DISCORD_CLIENT_ID / DISCORD_GUILD_ID 채우기
#    DISCORD_BOT_WEBHOOK_SECRET 은 웹 측 동일값과 일치시켜야 함

# 2. 슬래시 커맨드 등록 (커맨드 추가/변경 시마다)
pnpm --filter @uhagwi/bot deploy-commands

# 3. 개발 모드 (tsx watch)
pnpm --filter @uhagwi/bot dev
```

## 새 커맨드 추가하기

1. `src/commands/my-cmd.ts` 생성 — `data`(SlashCommandBuilder)와 `execute` 를 export
2. `src/commands/index.ts` 의 `commands` 배열에 추가
3. `pnpm deploy-commands` 재실행

## 보안 체크리스트

- [ ] `DISCORD_BOT_TOKEN` 은 절대 git·로그·Discord 메시지에 노출 금지
- [ ] `DISCORD_BOT_WEBHOOK_SECRET` 은 웹 서버와 **동일한 값**을 공유, 둘 다 보호
- [ ] 운영 환경에서는 `DISCORD_GUILD_ID` 를 비워 글로벌 배포 사용
- [ ] 권한(Intent)은 필요한 것만 켠다 — 기본은 `Guilds/GuildMembers/GuildMessages/GuildMessageReactions`
- [ ] 봇 사용자 입력(`url` 등)은 허용 도메인 정규식으로 필터 (참고: `harness-share.ts`)

## 웹과의 연동 지점

| 방향 | 엔드포인트 | 인증 | 현재 상태 |
|-----|----------|-----|--------|
| 웹 → 봇 | Bot `POST /bot/v1/discord/message` | `X-Web-Signature` HMAC | 미구현 (v0.2) |
| 봇 → 웹 | 웹 `POST /api/bot/events` | `X-Bot-Signature` HMAC + `X-Bot-Timestamp` | `src/webhooks/client.ts` 로 송신 |

상세 규약: `docs/service-dev/02_design/api.md §3` 참조.
