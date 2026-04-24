-- ============================================================================
-- 0009_follows.sql — 팔로우 (Phase 2 스텁이지만 유저 요청대로 MVP 스캐폴드에 포함)
-- ERD §2-8 스텁 기준
--
-- 주의: ERD는 follows를 Phase 2로 분류. 본 마이그레이션은 유저 요청에 따라 MVP에서 선생성하되,
--       기능 노출은 Next.js 레이어에서 feature flag로 제어하는 것을 권장.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- follows — 팔로우 관계
-- ----------------------------------------------------------------------------
-- PK 복합 (follower_id, followee_id)
-- 자기 자신 팔로우 금지 check 제약
create table if not exists follows (
  follower_id uuid not null references users(id) on delete cascade,
  followee_id uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint follows_no_self_chk check (follower_id <> followee_id)
);

-- "나를 팔로우한 사람" 조회 (프로필 페이지)
create index if not exists follows_followee_idx
  on follows (followee_id, created_at desc);

-- "내가 팔로우한 사람" 조회
create index if not exists follows_follower_idx
  on follows (follower_id, created_at desc);

alter table follows enable row level security;

comment on table follows is '팔로우 · PK 복합 · 자기자신 금지';
