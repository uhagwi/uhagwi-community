# @uhagwi/db

우하귀(Uhagwi) 커뮤니티의 **Supabase Postgres 스키마·마이그레이션·시드** 패키지.

- 정본 설계 문서: [`docs/service-dev/02_design/erd.md`](../../docs/service-dev/02_design/erd.md)
- 버전: v0.1.0 (Phase 1 MVP)
- 대상 DB: Supabase (Postgres 15)

---

## 구성

```
packages/db/
├── package.json                 # npm 스크립트 (supabase CLI 래핑)
├── README.md                    # 이 파일
└── supabase/
    ├── config.toml              # 로컬 개발 환경(포트·Auth·Storage)
    ├── seed.sql                 # 개발용 샘플 데이터
    └── migrations/
        ├── 0001_users.sql       # users
        ├── 0002_harnesses.sql   # posts + harnesses
        ├── 0003_comments.sql    # comments
        ├── 0004_posts.sql       # posts 보조(slug 함수, 공개 view)
        ├── 0005_reactions.sql   # reaction_type enum + reactions
        ├── 0006_imports.sql     # imports
        ├── 0007_reports.sql     # reports
        ├── 0008_tags.sql        # tags + harness_tags
        ├── 0009_follows.sql     # follows (Phase 2 선배치)
        ├── 0100_rls_policies.sql      # 전 테이블 RLS
        └── 0101_views_and_triggers.sql # MV + 트리거
```

---

## 빠른 시작

### 0. 사전 준비

- Docker Desktop 실행 중
- Supabase CLI 설치됨 (`pnpm i` 시 devDependency로 설치)
- 루트의 `.env.local`에 아래 값 준비 (로컬은 `supabase start` 출력이 자동 주입)

### 1. 로컬 기동

```bash
cd packages/db
pnpm db:start      # supabase start (Docker 컨테이너 띄움)
pnpm db:reset      # 마이그레이션 + seed 적용 (개발 초기화)
pnpm db:status     # 포트·URL·키 확인
```

성공하면 아래 포트로 접근 가능:

| 서비스 | URL |
|--------|-----|
| API (REST/GraphQL) | http://127.0.0.1:54321 |
| Postgres | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Studio (GUI) | http://127.0.0.1:54323 |
| Inbucket (메일) | http://127.0.0.1:54324 |

### 2. 타입 생성 (TypeScript)

```bash
pnpm db:types   # packages/config/src/database.types.ts 로 출력
```

### 3. 정리

```bash
pnpm db:stop    # 컨테이너 정지 (데이터는 보존)
```

---

## 환경 변수 (`.env.local`)

앱(`apps/web`)에서 참조하는 값:

| 키 | 설명 | 로컬 값 출처 |
|----|------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | API 엔드포인트 | `supabase start` 출력 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 키 (RLS 적용) | `supabase start` 출력 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 키 (RLS 우회, 배치·Edge Function만) | `supabase start` 출력 |
| `SUPABASE_AUTH_DISCORD_CLIENT_ID` | Discord OAuth (프로덕션) | Discord 개발자 포털 |
| `SUPABASE_AUTH_DISCORD_SECRET` | Discord OAuth secret | Discord 개발자 포털 |

`service_role` 키는 **절대 클라이언트 번들에 포함하면 안 됨**. Next.js API route / Edge Function에서만 사용.

---

## 스키마 요약

| 테이블 | 역할 | 핵심 제약 |
|--------|------|----------|
| `users` | 사용자 (Discord 1:1) | `discord_id` UK, `handle` UK (3~20자), role ∈ {member,builder,operator} |
| `posts` | 콘텐츠 래퍼 | status ∈ {draft,published,featured,reported,deleted}, visibility ∈ {public,link,private} |
| `harnesses` | 하네스 본체 | `post_id` FK(unique), components `text[]` GIN 인덱스 |
| `comments` | 주접 댓글 | body 1~1000자, `juzzep_score` 0~100 |
| `reactions` | 4종 리액션 | `reaction_type` enum, (harness_id,user_id,type) UK |
| `tags` / `harness_tags` | 태그 | `(harness_id,tag_id)` PK 복합 |
| `imports` | 이식 기록 | target ∈ {claude,chatgpt,n8n,zapier,other}, status ∈ {initiated,succeeded,failed} |
| `reports` | 신고 | (target_type,target_id,reporter_id) UK · **3건 누적 시 posts.status=reported 자동** |
| `follows` | 팔로우(Phase 2) | PK 복합, 자기자신 금지 |

### 파생 객체

- `harness_reaction_counts` (materialized view) — 리액션 4종 카운트, reactions insert/delete 시 concurrent refresh
- `harness_comment_counts` (view) — 실시간 count
- `harness_import_counts` (view) — status 분류 집계
- `public_harness_posts` (view) — 공개 갤러리용 조인 뷰
- `util_slugify(text)` — 한글·영문 혼합 슬러그 정규화

---

## RLS 정책 요약

- 기본값 **deny** (모든 테이블 `enable row level security`)
- `posts`/`harnesses`: `published`+`public`만 공개 조회, 본인만 쓰기
- `reactions`/`comments`: 공개 조회, 본인만 쓰기
- `imports`: 본인만 조회(프라이버시)
- `reports`: 본인만 조회+삽입
- 운영자(`users.role='operator'`): 전 테이블 우회 (`is_operator()` 헬퍼)

---

## 마이그레이션 규칙

1. 파일명 `NNNN_<subject>.sql` 오름차순으로 실행됨
2. `create extension`, `create type` 먼저 → `create table` → `create index` → `enable row level security`
3. 정책은 `0100_` 접두 파일에 한 곳 집중 (RLS 감사 용이)
4. 뷰·트리거는 `0101_` 접두 파일에 모음
5. 모든 `create policy`는 `drop policy if exists` 선행 (멱등성)
6. 새 마이그레이션 추가 시 `pnpm db:diff` 로 스텁 생성 후 수동 다듬기

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| `supabase start` 실패 (포트 충돌) | 54321~54324 점유 | `pnpm db:stop` 후 재시도, 또는 `config.toml`에서 포트 변경 |
| `db:reset` 시 `materialized view concurrently refresh` 에러 | unique index 누락 | 0101 내 `harness_reaction_counts_pk` 인덱스 확인 |
| RLS로 인한 403 | `service_role` 키 미주입 | 서버 쿼리는 반드시 service-role 클라이언트 사용 |
| `auth.uid()` null | 로컬 Auth 미연동 | Studio → Auth → 테스트 유저로 로그인 |

---

## 참조

- ERD 정본: `docs/service-dev/02_design/erd.md`
- API 스키마: `docs/service-dev/02_design/api.md`
- 시나리오: `docs/service-dev/02_design/scenario.md`
- Supabase CLI: https://supabase.com/docs/guides/cli
