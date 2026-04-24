-- ============================================================================
-- 0007_reports.sql — 신고
-- ERD §2-7 기준
--
-- 특이사항: reports는 bigint PK (ERD 원안). 유저 요청의 "uuid target_id"는 ERD와 일치.
-- 3건 누적 시 posts.status='reported' 트리거는 0101에서 정의.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- reports — 신고 테이블
-- ----------------------------------------------------------------------------
-- target_type: post | comment | user
-- reason: spam | nsfw | harassment | other
-- status: open | resolved | dismissed
-- (target_type, target_id, reporter_id) unique — 동일인이 같은 대상을 중복 신고 불가
create table if not exists reports (
  id            bigint generated always as identity primary key,
  target_type   text not null,
  target_id     uuid not null,
  reporter_id   uuid not null references users(id) on delete cascade,
  reason        text not null,
  detail        text,
  status        text not null default 'open',
  resolved_by   uuid references users(id),
  resolved_at   timestamptz,
  created_at    timestamptz not null default now(),
  unique (target_type, target_id, reporter_id),
  constraint reports_target_type_chk check (target_type in ('post','comment','user')),
  constraint reports_reason_chk check (reason in ('spam','nsfw','harassment','other')),
  constraint reports_status_chk check (status in ('open','resolved','dismissed'))
);

-- 특정 대상의 open 신고 건수 집계용 (3건 누적 트리거가 참조)
create index if not exists reports_target_idx
  on reports (target_type, target_id, status);

-- 운영자 대시보드 (오래된 open 순)
create index if not exists reports_status_idx
  on reports (status, created_at desc);

alter table reports enable row level security;

comment on table reports is '신고 · 1인 1대상 1회 · 3건 누적 시 posts.status=reported 자동 전환';
