# 연결 가이드 — 사용자 수동 작업 체크리스트

> **대상**: 이진명 · **목표**: Discord OAuth + Supabase DB + Vercel 배포를 실제로 돌아가게 만든다
> **예상 소요**: 총 90분 (Discord 20분 + Supabase 30분 + Vercel 20분 + 값 전달 20분)
>
> **이 문서를 따라 값을 수집한 뒤, 맨 아래 "값 전달 템플릿"을 채워 Claude에게 붙여넣으면 된다.**

---

## 0. 사전 준비물

- [ ] GitHub 계정 `Flowater-JM` (완료됨)
- [ ] uhagwi 조직 (완료됨)
- [ ] 이 저장소: https://github.com/uhagwi/uhagwi-community
- [ ] Discord 계정
- [ ] Supabase 계정 (없으면 https://supabase.com 에서 GitHub 로그인)
- [ ] Vercel 계정 (없으면 https://vercel.com 에서 GitHub 로그인)

---

## 1. Discord Developer Portal — OAuth 앱 등록 (20분)

### 1-1. 새 앱 생성

1. https://discord.com/developers/applications 접속 → `New Application` 클릭
2. 이름: **`Uhagwi`** → `Create`
3. 좌측 `General Information` 탭에서:
   - **Description**: `우하귀(Uhagwi) — AI 하네스 공유 커뮤니티`
   - 아이콘 업로드: `_output/logo/logo_v2_sealion_hug.png` 사용 (권장) 또는 추후

### 1-2. OAuth2 리다이렉트 URL 등록

좌측 `OAuth2` 탭 → `Redirects` 에 **3개 모두** 추가:

```
http://localhost:3000/api/auth/callback/discord
https://uhagwi-community.vercel.app/api/auth/callback/discord
https://<당신이-나중에-쓸-Vercel-프리뷰-도메인>.vercel.app/api/auth/callback/discord
```

> 3번째는 일단 스킵해도 된다 (프리뷰 URL 생긴 뒤 추가)

### 1-3. 값 복사 (메모장에 저장)

`OAuth2` 탭 상단 → `Reset Secret` 후:
- `CLIENT ID`: __________________ (19자리 숫자)
- `CLIENT SECRET`: __________________ (한 번만 보임, 지금 복사)

### 1-4. Bot 생성 (봇도 같이 쓸 거니까)

좌측 `Bot` 탭 → `Reset Token`:
- `BOT TOKEN`: __________________ (`MTxxxxxxxxxx...` 형태)

**Privileged Gateway Intents**에서 체크:
- [x] MESSAGE CONTENT INTENT
- [x] SERVER MEMBERS INTENT

### 1-5. 봇을 당신 Discord 서버에 초대

1. 좌측 `OAuth2` → `URL Generator`
2. Scopes: `bot`, `applications.commands` 체크
3. Bot Permissions: `Send Messages`, `Read Messages`, `Embed Links`, `Add Reactions` 체크
4. 하단 URL 복사 → 브라우저에서 열기 → 당신의 우하귀 Discord 서버 선택 → 초대

> **Discord 서버 없으면** — https://discord.com 들어가서 **`우하귀`** 서버 먼저 만들기 (무료, 1분).
> `#general`, `#자랑방`, `#Q&A`, `#주접방`, `#스터디` 채널 구성 권장.

### 1-6. Guild ID 복사 (테스트용)

Discord 앱에서:
1. 설정 → 고급 → `개발자 모드` 켜기
2. 당신 서버 우클릭 → `서버 ID 복사`
- `GUILD ID`: __________________

---

## 2. Supabase — 프로젝트 생성 + 스키마 적용 (30분)

### 2-1. 새 프로젝트 생성

1. https://supabase.com/dashboard → `New Project`
2. **Organization**: 개인 또는 기존 것
3. **Name**: `uhagwi-community`
4. **Database Password**: 강한 비밀번호 생성 후 **메모** (이후 못 복구)
5. **Region**: `Northeast Asia (Seoul)` — ap-northeast-2 (서울)
6. **Pricing Plan**: `Free`
7. `Create new project` → 2~3분 대기

### 2-2. 값 수집

프로젝트 생성 완료 후 좌측 `Project Settings` → `API`:
- `Project URL`: `https://xxxxxxxxxx.supabase.co` → **SUPABASE_URL** 값
- `Project API keys`:
  - `anon` `public`: **SUPABASE_ANON_KEY** 값
  - `service_role` `secret`: **SUPABASE_SERVICE_ROLE_KEY** 값 (⚠️ 절대 공개 금지)

좌측 `Project Settings` → `Database`:
- `Connection string` → `URI` 탭의 문자열 메모 (선택 사항)

### 2-3. 스키마 적용 — 두 가지 방법 중 선택

#### 방법 A. Supabase Studio에서 SQL 직접 실행 (쉬움)

1. 좌측 `SQL Editor` → `New Query`
2. 아래 순서대로 **11개 파일 내용을 복붙** 하고 `Run` 눌러서 하나씩 실행:

```
packages/db/supabase/migrations/0001_users.sql
packages/db/supabase/migrations/0002_harnesses.sql
packages/db/supabase/migrations/0003_comments.sql
packages/db/supabase/migrations/0004_posts.sql
packages/db/supabase/migrations/0005_reactions.sql
packages/db/supabase/migrations/0006_imports.sql
packages/db/supabase/migrations/0007_reports.sql
packages/db/supabase/migrations/0008_tags.sql
packages/db/supabase/migrations/0009_follows.sql
packages/db/supabase/migrations/0100_rls_policies.sql
packages/db/supabase/migrations/0101_views_and_triggers.sql
```

3. 마지막으로 `packages/db/supabase/seed.sql` 도 실행 (샘플 데이터)

#### 방법 B. Supabase CLI 로컬 연결 (자동, 추천)

로컬에서:
```bash
cd uhagwi/packages/db
npx supabase login              # 브라우저 열림
npx supabase link --project-ref <당신-프로젝트-REF>
# project-ref는 URL의 xxxxxxxxxx 부분
npx supabase db push            # 마이그레이션 전체 적용
```

### 2-4. 적용 확인

좌측 `Table Editor` → 다음 테이블들이 전부 보이면 성공:
- `users`, `posts`, `harnesses`, `comments`, `reactions`
- `imports`, `reports`, `tags`, `harness_tags`, `follows`

---

## 3. Vercel — 배포 + 환경변수 (20분)

### 3-1. 프로젝트 임포트

1. https://vercel.com/new → GitHub 연동
2. `uhagwi/uhagwi-community` 선택 → `Import`
3. **중요 설정**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web`  ← 모노레포라 중요!
   - **Build Command**: 기본값 그대로
   - **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`
   - **Output Directory**: 기본값 `.next`

### 3-2. 환경변수 입력

`Environment Variables` 섹션에서 위에서 모은 값 8개 전부 등록:

| Key | Value | 출처 |
|-----|-------|-----|
| `NEXTAUTH_URL` | `https://uhagwi-community.vercel.app` | Vercel이 자동 할당 |
| `NEXTAUTH_SECRET` | 아래 생성 명령 참조 | 수동 생성 |
| `DISCORD_CLIENT_ID` | 1-3에서 복사 | Discord |
| `DISCORD_CLIENT_SECRET` | 1-3에서 복사 | Discord |
| `SUPABASE_URL` | 2-2에서 복사 | Supabase |
| `SUPABASE_ANON_KEY` | 2-2에서 복사 | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | 2-2에서 복사 | Supabase |
| `DISCORD_BOT_WEBHOOK_SECRET` | 아래 생성 명령 참조 | 수동 생성 |

**NEXTAUTH_SECRET / DISCORD_BOT_WEBHOOK_SECRET 생성법** (터미널에서):
```bash
openssl rand -base64 32
```
두 개 따로 실행해서 각각 다른 값으로 등록.

### 3-3. 배포

`Deploy` 클릭 → 3~5분 대기 → 성공 시:
- **배포 URL**: `https://uhagwi-community.vercel.app` 또는 `uhagwi-community-xxx.vercel.app`

> ⚠️ 첫 배포는 환경변수 없어서 **실패할 수 있음** — 환경변수 등록 후 `Redeploy` 트리거.

### 3-4. Discord Redirect URL 최종 갱신

배포 URL 확정되면 **1-2로 돌아가서** 해당 URL의 Discord Redirect 추가.

---

## 4. Upstash Redis (선택 — Rate Limit 작동시키려면)

**지금은 스킵해도 된다** (Rate Limit 코드가 no-op로 동작). Phase 2 이후 필요하면:

1. https://upstash.com → GitHub 로그인
2. `Create Database` → Region: `Tokyo` → Free tier
3. REST API 탭에서:
   - `UPSTASH_REDIS_REST_URL`: __________________
   - `UPSTASH_REDIS_REST_TOKEN`: __________________
4. Vercel 환경변수에 추가

---

## 5. 값 전달 템플릿 — Claude에 붙여넣기

아래 블록을 채워서 붙여넣으면 Claude가 나머지를 진행한다.

```
## 연결 완료 보고

### Discord
- CLIENT_ID: __________________
- 봇 서버 초대 완료: Y / N
- GUILD_ID (테스트용): __________________
- (CLIENT_SECRET / BOT_TOKEN / WEBHOOK_SECRET 은 Vercel에만 등록, 공유 금지)

### Supabase
- 프로젝트 URL: https://__________.supabase.co
- 지역: Seoul (ap-northeast-2)
- 마이그레이션 적용 여부: Y / N
- 테이블 10개 전부 확인: Y / N
- seed.sql 실행 여부: Y / N
- (ANON_KEY / SERVICE_ROLE_KEY 은 Vercel에만 등록, 공유 금지)

### Vercel
- 배포 URL: https://__________.vercel.app
- 빌드 성공 여부: Y / N
- 환경변수 8개 전부 등록: Y / N

### 질문·블로커
- (막힌 단계 있으면 여기 기재)
```

---

## 6. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| Vercel 빌드 "모듈 없음" 에러 | Root Directory 틀림 | `apps/web` 로 설정 확인 |
| Discord 로그인 후 redirect_uri_mismatch | 1-2 리다이렉트 URL 누락 | Vercel 확정 URL 1-2 에 추가 |
| Supabase `permission denied for table users` | RLS 막힘 | 정상 — 서비스 롤 키로만 쓰기 |
| 마이그레이션 SQL 에러 | 순서 틀림 | 0001부터 순서대로 재실행 |
| supabase CLI "not linked" | project-ref 틀림 | `supabase/dashboard/project/<ref>/` URL 확인 |

---

## 7. 보안 주의사항 (중요)

- **SERVICE_ROLE_KEY**, **DISCORD_CLIENT_SECRET**, **BOT_TOKEN** 은 **절대 Git 커밋 금지**
- Discord 서버 ID는 공개해도 무방하나 BOT TOKEN 은 유출 시 즉시 Reset
- `.env.local` 파일은 `.gitignore` 에 포함되어 있다 — 로컬에만 존재해야 함
- 실수로 커밋되면 즉시 Discord에서 토큰 Reset + 새 토큰을 Vercel에 재등록

---

작성: Claude · 2026-04-24
