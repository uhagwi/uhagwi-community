-- ============================================================================
-- 0006_imports.sql — 하네스 이식 기록
-- ERD §2-6 기준
-- ============================================================================

-- ----------------------------------------------------------------------------
-- imports — 다른 플랫폼(claude/chatgpt/n8n/...)으로의 이식 시도 기록
-- ----------------------------------------------------------------------------
-- target: claude | chatgpt | n8n | zapier | other
-- status: initiated | succeeded | failed
-- ERD상 "이식수 지표"는 status='succeeded' 필터 집계(§4)
create table if not exists imports (
  id             uuid primary key default gen_random_uuid(),
  -- ERD 필드명은 harness_id. 유저 요청의 source_harness_id도 같은 의미이나 ERD 원안 유지
  harness_id     uuid not null references harnesses(id) on delete cascade,
  user_id        uuid not null references users(id) on delete cascade,
  target         text not null,
  status         text not null default 'initiated',
  feedback       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint imports_target_chk check (target in ('claude','chatgpt','n8n','zapier','other')),
  constraint imports_status_chk check (status in ('initiated','succeeded','failed'))
);

-- 하네스별 이식 이력 집계용
create index if not exists imports_harness_idx on imports (harness_id);

-- 내가 한 이식 시도 (프로필 페이지)
create index if not exists imports_user_idx
  on imports (user_id, created_at desc);

-- 성공 건 빠른 집계용 부분 인덱스 (이식수 지표)
create index if not exists imports_succeeded_idx
  on imports (harness_id)
  where status = 'succeeded';

alter table imports enable row level security;

comment on table imports is '하네스 이식 시도 기록 · 이식수 KPI 원천';
comment on column imports.status is 'initiated=시도 / succeeded=성공(이식수+1) / failed=실패';
