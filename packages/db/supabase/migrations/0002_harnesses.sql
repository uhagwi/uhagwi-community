-- ============================================================================
-- 0002_harnesses.sql — 하네스 본체 테이블
-- ERD §2-2 기준 (posts 래퍼는 0004에서 분리 생성)
--
-- 주의: ERD 문서에서 harnesses는 posts(id)를 FK로 가진다.
--       본 스캐폴드는 파일 순번을 유저 요청대로 유지하되,
--       실제 DDL 의존성을 맞추기 위해 posts를 0002에서 선생성한다.
--       (ERD "§1:1 분리 근거"는 0004 파일 헤더에 동일하게 기록)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- posts — 콘텐츠 래퍼 (ERD §2-2 전반부, MVP는 type='harness' 단일)
-- ----------------------------------------------------------------------------
-- status: draft | published | featured | reported | deleted
-- visibility: public | link | private
-- content_hash: 동일 author + 동일 본문 중복 방지 (sha256)
create table if not exists posts (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references users(id) on delete set null,
  type           text not null default 'harness',
  status         text not null default 'draft',
  visibility     text not null default 'public',
  slug           text unique,                     -- published 시 생성
  content_hash   text,                            -- sha256(본문)
  featured_until timestamptz,                     -- featured 만료 시각
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  constraint posts_type_chk       check (type in ('harness','article')),
  constraint posts_status_chk     check (status in ('draft','published','featured','reported','deleted')),
  constraint posts_visibility_chk check (visibility in ('public','link','private'))
);

create index if not exists posts_status_pub_idx
  on posts (status, published_at desc)
  where deleted_at is null;

create index if not exists posts_author_idx
  on posts (author_id)
  where deleted_at is null;

-- 동일 작성자가 동일 본문으로 중복 publish 하지 못하도록 제한
create unique index if not exists posts_content_hash_unique
  on posts (author_id, content_hash)
  where status = 'published' and deleted_at is null and content_hash is not null;

alter table posts enable row level security;

comment on table posts is '콘텐츠 래퍼 · MVP는 type=harness 단일, Phase 2에서 article 확장';
comment on column posts.content_hash is '중복 publish 방지용 sha256 해시';

-- ----------------------------------------------------------------------------
-- harnesses — 하네스 본체
-- ----------------------------------------------------------------------------
-- 1 post : 1 harness (unique 제약)
-- components: 11요소 중 사용 항목 (tools, memory, prompt, context, tone 등)
-- persona_job: florist | pharmacist | teacher | student | other ...
create table if not exists harnesses (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null unique references posts(id) on delete cascade,
  title             text not null,
  persona_name      text,                          -- 의인화 이름 (예: "주문이")
  one_liner         text not null,                 -- 한줄요약
  purpose           text not null,                 -- 목적 · 본문(일상 언어)
  structure_mermaid text,                          -- Mermaid 소스
  structure_image   text,                          -- 구조도 이미지 URL
  components        text[] not null default '{}',  -- 11요소 사용 목록
  prompt_snippet    text,
  persona_job       text,
  media_urls        text[] not null default '{}',
  view_count        integer not null default 0,    -- 배치로 flush
  avg_juzzep        numeric(5,2),                  -- 주접지수 평균 (댓글 트리거 갱신)
  trending_score    numeric(10,2) not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint harnesses_title_len_chk    check (char_length(title) between 1 and 120),
  constraint harnesses_one_liner_len_chk check (char_length(one_liner) between 1 and 200)
);

create index if not exists harnesses_job_idx on harnesses (persona_job);
create index if not exists harnesses_components_idx on harnesses using gin (components);
create index if not exists harnesses_trending_idx on harnesses (trending_score desc);

alter table harnesses enable row level security;

comment on table harnesses is '하네스 본체 · posts 1:1';
comment on column harnesses.components is '11요소 배열 (tools/memory/prompt/context/tone/...)';
comment on column harnesses.view_count is 'Redis counter → 1분 배치 flush';
comment on column harnesses.avg_juzzep is '주접지수 평균 · 댓글 insert 트리거로 rolling avg';
