-- ============================================================================
-- 0001_users.sql — 사용자 테이블 (Discord OAuth 1:1 연동)
-- ERD §2-1 기준
-- ============================================================================

-- UUID 생성용 extension (Supabase 기본 활성화되어 있으나 안전차원 명시)
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- users 테이블
-- ----------------------------------------------------------------------------
-- 사용자 · Discord OAuth snowflake로 1:1 연동
-- role: member(기본) | builder(적극 기여자) | operator(운영자, RLS 우회)
-- status: active | suspended | withdrawn
-- violation_count: 신고·제재 누적, 임계치 초과 시 can_post=false 자동 전환(트리거는 별도)
create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  discord_id      text not null unique,            -- Discord snowflake id
  handle          text not null unique,            -- URL용 핸들 (3~20자)
  display_name    text not null,                   -- 표시 이름
  avatar_url      text,
  bio             text,
  role            text not null default 'member',
  status          text not null default 'active',
  violation_count smallint not null default 0,
  can_post        boolean not null default true,   -- Discord 서버 kick 시 false 처리
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  -- 도메인 제약
  constraint users_handle_length_chk check (char_length(handle) between 3 and 20),
  constraint users_role_chk check (role in ('member','builder','operator')),
  constraint users_status_chk check (status in ('active','suspended','withdrawn'))
);

-- ----------------------------------------------------------------------------
-- 인덱스
-- ----------------------------------------------------------------------------
-- handle 검색(프로필 페이지 접근)용 — soft delete 제외
create index if not exists users_handle_idx
  on users (handle)
  where deleted_at is null;

-- Discord OAuth 콜백에서 discord_id로 조회하는 경로
create index if not exists users_discord_id_idx on users (discord_id);

-- 운영자 일괄 조회용 (RLS 우회 정책에서 사용)
create index if not exists users_role_idx on users (role)
  where role = 'operator' and deleted_at is null;

-- RLS 활성화 (정책은 0100에서 정의)
alter table users enable row level security;

comment on table users is '우하귀 사용자 · Discord OAuth 1:1 연동';
comment on column users.role is 'member | builder | operator (operator는 RLS 우회)';
comment on column users.can_post is 'Discord 서버 kick 시 false로 차단';
