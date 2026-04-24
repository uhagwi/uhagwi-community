-- ============================================================================
-- 0003_comments.sql — 주접 댓글
-- ERD §2-3 기준
-- ============================================================================

-- ----------------------------------------------------------------------------
-- comments — 하네스에 달리는 주접 댓글
-- ----------------------------------------------------------------------------
-- juzzep_score: 0~100 · 주접지수 (서버 추론 또는 운영자 보정)
-- parent_id: 대댓글 (Phase 2이지만 컬럼만 선배치)
-- body는 1~1000자 제한
create table if not exists comments (
  id           uuid primary key default gen_random_uuid(),
  harness_id   uuid not null references harnesses(id) on delete cascade,
  author_id    uuid references users(id) on delete set null,
  body         text not null,
  juzzep_score smallint,
  parent_id    uuid references comments(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  constraint comments_body_len_chk   check (char_length(body) between 1 and 1000),
  constraint comments_juzzep_range_chk check (juzzep_score is null or juzzep_score between 0 and 100)
);

-- 하네스 상세 페이지 댓글 목록 (최신순)
create index if not exists comments_harness_idx
  on comments (harness_id, created_at desc)
  where deleted_at is null;

-- 내가 쓴 댓글 조회 (프로필 페이지)
create index if not exists comments_author_idx on comments (author_id);

-- 대댓글 조회
create index if not exists comments_parent_idx on comments (parent_id)
  where parent_id is not null;

alter table comments enable row level security;

comment on table comments is '하네스 주접 댓글 · juzzep_score 0~100';
comment on column comments.juzzep_score is '주접지수 · null 허용(추론 대기 상태)';
