# 우하귀 (Uhagwi)

> **우리 하네스 귀엽지** — AI 하네스(Agent = Model + Harness)를 자랑하고 주접 받으며 배우는 커뮤니티
>
> **슬로건**: "내 하네스 보러 올래?" · **톤**: 기술 디테일 × K-밈 주접 문화

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE) ![Status](https://img.shields.io/badge/status-scaffold-orange)

---

## 무엇을 만드는가

LLM을 실제로 쓸 수 있게 감싸는 소프트웨어 인프라 전체 = **하네스(Harness)**.
"만든 사람은 자랑할 곳이, 배우려는 사람은 따라 할 구조가 필요하다."

우하귀는 두 집단을 잇는 커뮤니티 플랫폼이다.

- **AX/DX 입문자 70%** — 업무에 AI를 엮는 법을 살아있는 예시로 모방한다.
- **하네스 빌더 30%** — 실전 시스템을 포스팅하고 주접 리액션으로 보상받는다.

상세 기획은 상위 디렉토리의 `기획안_우하귀.md` · `도전신청서_작성본.md` · `하네스_리서치_보고서.md` 참조.

---

## 기술 스택

| 계층 | 선택 | 근거 |
|------|------|------|
| 프론트엔드 | Next.js 14 App Router · React 18 · TypeScript · Tailwind | SSR·라우트 그룹·엣지 배포 |
| 인증 | NextAuth v5 + Discord OAuth | 커뮤니티가 Discord 중심 — 계정 일원화 |
| DB | Supabase (Postgres + RLS) | 오픈소스·셀프호스트 가능·마이그레이션 추적 |
| 캐시·집계 | Upstash Redis | 조회수 flush·Rate Limit sliding window |
| 봇 | discord.js v14 (TypeScript) | 웹과 언어 일원화 |
| 배포 | Vercel (web) · Railway / Fly.io (bot) | 초기 비용 최소화 |
| 모노레포 | pnpm workspace + Turborepo | 빌드 캐시·의존성 격리 |

근거 문서: `docs/service-dev/02_design/` (UI·시나리오·ERD·API 4종).

---

## 디렉토리 구조

```
uhagwi/
├─ apps/
│  ├─ web/              # Next.js 14 (우하귀.com)
│  └─ bot/              # Discord 봇 (discord.js)
├─ packages/
│  ├─ db/               # Supabase 마이그레이션 · seed
│  ├─ ui/               # 공유 컴포넌트 (ReactionButton, JuzzepBadge)
│  └─ config/           # tsconfig · eslint · tailwind 프리셋
├─ docs/                # 확장 시 컨벤션·가이드
├─ .github/workflows/   # CI
└─ turbo.json           # 빌드 오케스트레이션
```

---

## 로컬 구동

### 0. 사전 요구사항
- Node.js 20.x (`.nvmrc` 참조)
- pnpm 9+
- Supabase CLI (`brew install supabase/tap/supabase`)
- Discord Developer Portal 앱 (Client ID/Secret)

### 1. 설치
```bash
pnpm install
```

### 2. 환경변수
각 앱에 `.env.example`이 있다. 복사 후 값 채우기.
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/bot/.env.example apps/bot/.env
```

### 3. Supabase 로컬
```bash
cd packages/db
pnpm db:start        # supabase start
pnpm db:reset        # 마이그레이션 + seed 적용
```

### 4. 웹 + 봇 동시 구동
```bash
# 루트에서
pnpm dev
```

웹: http://localhost:3000 · Supabase Studio: http://localhost:54323

---

## 스크립트

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 모든 앱 동시 개발 서버 |
| `pnpm build` | 전체 빌드 (Turbo 캐시) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | 타입 검사 |
| `pnpm test` | 테스트 (워크스페이스별) |
| `pnpm format` | Prettier |

---

## 확장 가이드

- **새 앱 추가**(예: 모바일·관리자): `apps/<name>/` 생성 후 `pnpm-workspace.yaml`에 자동 포함
- **공유 로직 추출**: `packages/<name>/`에 패키지 만들고 `@uhagwi/<name>`로 참조
- **새 feature 라우트**: `apps/web/src/app/(feature)/...` — Next.js 라우트 그룹 활용
- **DB 스키마 변경**: `packages/db/supabase/migrations/XXXX_name.sql` 추가 후 `pnpm db:reset`

---

## 라이선스

MIT — `LICENSE` 참조. 커뮤니티 포스팅 콘텐츠 저작권은 각 작성자에 귀속.

---

## 기여

`CONTRIBUTING.md` 참조. 커밋은 Conventional Commits, PR은 이슈 번호 링크 필수.

🌊 우하귀 (Uhagwi) — AX 전환을 함께하는 모두의 커뮤니티
