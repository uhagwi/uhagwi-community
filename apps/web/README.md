# @uhagwi/web — 우하귀 웹 앱

> Next.js 14 App Router · NextAuth v5 · Supabase · Tailwind 기반 MVP 웹.
> 상위 모노레포(`uhagwi/`)의 `apps/web/` 서브패키지.

---

## 로컬 구동

### 사전 요구

- Node.js >= 20
- pnpm >= 9 (모노레포 루트에서 설치)
- Supabase CLI (로컬 DB 띄울 때)

### 1) 의존성 설치 (모노레포 루트)

```bash
cd ../../           # uhagwi/
pnpm install
```

### 2) 환경 변수 준비

```bash
cd apps/web
cp env.example.txt .env.local
# .env.local 열어서 값 채우기 (아래 §환경 변수 참조)
```

### 3) 개발 서버

```bash
# 모노레포 루트에서
pnpm dev --filter @uhagwi/web
# 또는 apps/web 안에서
pnpm dev
```

→ http://localhost:3000

### 4) 타입체크·린트

```bash
pnpm typecheck
pnpm lint
```

---

## 환경 변수

`env.example.txt` 템플릿 참조. 모두 **서버 전용** (클라이언트 노출 금지).

| 변수 | 용도 |
|---|---|
| `NEXTAUTH_URL` | 배포 URL (로컬은 `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | JWE 서명 키 (`openssl rand -base64 32`) |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord OAuth 앱 자격 (scope: `identify email guilds.join`) |
| `SUPABASE_URL` | 프로젝트 URL |
| `SUPABASE_ANON_KEY` | 클라이언트 anon 키 (RLS 통과용) |
| `SUPABASE_SERVICE_ROLE_KEY` | 서비스 롤 키 (배치·크로스포스트 전용, 클라이언트 노출 절대 금지) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limit · idempotency |
| `DISCORD_BOT_WEBHOOK_SECRET` | 봇 ↔ 웹 HMAC-SHA256 공유 시크릿 |

> 브라우저 노출이 필요한 Supabase 키는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 로 별도 정의하세요 (client.ts 참조).

---

## 디렉토리 구조

```
apps/web/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                      # 루트 (lang="ko" · Pretendard)
│  │  ├─ page.tsx                        # 랜딩 /
│  │  ├─ globals.css                     # 디자인 토큰 CSS
│  │  ├─ harnesses/
│  │  │  ├─ page.tsx                     # 갤러리
│  │  │  ├─ [slug]/page.tsx              # 상세
│  │  │  └─ new/page.tsx                 # 포스팅 (인증)
│  │  ├─ me/page.tsx                     # 내 프로필 (인증)
│  │  ├─ login/page.tsx                  # Discord OAuth
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/route.ts  # NextAuth v5
│  │     ├─ harnesses/route.ts           # GET/POST
│  │     ├─ harnesses/[id]/route.ts      # GET/PATCH/DELETE
│  │     ├─ reactions/route.ts           # POST toggle
│  │     └─ webhooks/bot/route.ts        # 봇 → 웹 HMAC
│  ├─ components/
│  │  ├─ harness-card.tsx
│  │  ├─ juzzep-reactions.tsx            # 🌸 Client Component
│  │  ├─ site-header.tsx
│  │  └─ site-footer.tsx
│  ├─ lib/
│  │  ├─ auth.ts                         # NextAuth 설정 + handlers
│  │  ├─ problem.ts                      # RFC 9457 헬퍼
│  │  ├─ rate-limit.ts                   # Upstash sliding window
│  │  └─ supabase/
│  │     ├─ server.ts                    # RSC 클라이언트 + service_role
│  │     ├─ client.ts                    # 브라우저 클라이언트
│  │     └─ middleware.ts                # 세션 쿠키 갱신
│  └─ middleware.ts                      # 보호 라우트 게이트
├─ env.example.txt                       # 환경변수 템플릿
├─ next.config.mjs
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
└─ package.json
```

---

## 설계 정본

- UI/UX: `docs/service-dev/02_design/ui.md`
- API: `docs/service-dev/02_design/api.md`
- ERD: `docs/service-dev/02_design/erd.md`

---

## 현재 상태 (scaffold)

- [x] 프로젝트 구성 · 디자인 토큰 · 라우트 뼈대 · API 라우트 뼈대 (Zod 검증 + RFC 9457)
- [ ] Supabase 실제 쿼리 · RLS 연동
- [ ] NextAuth Supabase Adapter 활성화 · users upsert
- [ ] 리액션 낙관적 업데이트 · Idempotency-Key
- [ ] 주접지수 API (rule + Haiku)
- [ ] Mermaid SSR 렌더러
- [ ] 포스팅 Wizard 3-step 실제 저장

각 TODO는 파일 상단 주석에 `TODO: 구현 — <spec 경로>` 로 표기돼 있습니다.

---

## 설계 문서 대비 편차 (의도적)

본 스캐폴드는 요청서 지시를 따라 아래와 같이 명명했습니다:

| 위치 | 설계 문서 정본 (`ui.md`) | 본 스캐폴드 |
|---|---|---|
| 갤러리 | `/gallery` | `/harnesses` |
| 상세 | `/h/[slug]` | `/harnesses/[slug]` |
| 작성 | `/new` | `/harnesses/new` |
| 프로필 | `/u/[handle]` | (스캐폴드 미생성 — Phase 후속) |
| API 버저닝 | `/api/v1/harness` (단수) | `/api/harnesses` (복수, 버전 없음) |
| API 리액션 | `/api/v1/reaction/toggle` | `/api/reactions` |

W2 착수 전 정본 결정 후 리라이트 또는 Next rewrite 규칙으로 일원화 필요.
