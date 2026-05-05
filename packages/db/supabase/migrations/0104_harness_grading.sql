-- ============================================================================
-- 0104_harness_grading.sql — 하네스 등급화·벤치마크 시스템
-- 출처: docs/service-dev/00_v2-재구축/01_GRADE_BENCHMARK_SPEC.md §4
-- 적용: supabase db push 또는 Supabase Studio SQL Editor
-- ============================================================================

-- ----------------------------------------------------------------------------
-- harnesses 테이블 — 등급·벤치마크 컬럼 추가
-- ----------------------------------------------------------------------------
alter table harnesses add column if not exists grade text
  check (grade in ('S', 'A', 'B', 'C', 'D'));
alter table harnesses add column if not exists benchmark_total numeric(5,2)
  check (benchmark_total >= 0 and benchmark_total <= 100);
alter table harnesses add column if not exists benchmark_axes jsonb;
alter table harnesses add column if not exists benchmark_set_id text;
alter table harnesses add column if not exists auto_score numeric(5,2)
  check (auto_score >= 0 and auto_score <= 100);
alter table harnesses add column if not exists user_score numeric(5,2)
  check (user_score >= 0 and user_score <= 100);
alter table harnesses add column if not exists user_review_count integer not null default 0;
alter table harnesses add column if not exists measured_at timestamptz;

create index if not exists harnesses_grade_idx on harnesses (grade)
  where grade is not null;
create index if not exists harnesses_benchmark_total_idx on harnesses (benchmark_total desc)
  where benchmark_total is not null;

comment on column harnesses.grade is '5등급 S/A/B/C/D — computeGrade(total) 산출';
comment on column harnesses.benchmark_total is '종합 점수 0~100 = auto*0.7 + user*0.3';
comment on column harnesses.benchmark_axes is '5축 점수 jsonb {accuracy, completeness, time_save, domain_fit, user_satisfaction}';

-- ----------------------------------------------------------------------------
-- benchmark_history — 등급·점수 변동 이력
-- ----------------------------------------------------------------------------
create table if not exists benchmark_history (
  id uuid primary key default gen_random_uuid(),
  harness_id uuid not null references harnesses(id) on delete cascade,
  measured_at timestamptz not null default now(),
  total numeric(5,2) not null
    check (total >= 0 and total <= 100),
  grade text not null
    check (grade in ('S', 'A', 'B', 'C', 'D')),
  axes jsonb not null,
  benchmark_set_id text,
  measurement_type text not null default 'auto'
    check (measurement_type in ('auto', 'user_aggregated', 'manual'))
);

create index if not exists benchmark_history_harness_time_idx
  on benchmark_history (harness_id, measured_at desc);

alter table benchmark_history enable row level security;

comment on table benchmark_history is '하네스 벤치마크 측정 이력 — 월 1회 자동 + 사용자 평가 누적';

-- ----------------------------------------------------------------------------
-- user_reviews — 사용자 4축 평가
-- ----------------------------------------------------------------------------
create table if not exists user_reviews (
  id uuid primary key default gen_random_uuid(),
  harness_id uuid not null references harnesses(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  -- 4축 별점 (1~5)
  accuracy_rating smallint not null
    check (accuracy_rating between 1 and 5),
  completeness_rating smallint not null
    check (completeness_rating between 1 and 5),
  time_save_rating smallint not null
    check (time_save_rating between 1 and 5),
  domain_fit_rating smallint not null
    check (domain_fit_rating between 1 and 5),
  comment text
    check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 한 사용자가 한 하네스에 1회만 평가 (수정은 update)
  unique (harness_id, user_id)
);

create index if not exists user_reviews_harness_idx on user_reviews (harness_id);
create index if not exists user_reviews_user_idx on user_reviews (user_id);

alter table user_reviews enable row level security;

-- RLS 정책: 본인 review만 insert·update·delete, 나머지는 read-only
create policy "user_reviews_select_all" on user_reviews
  for select using (true);
create policy "user_reviews_insert_own" on user_reviews
  for insert with check (auth.uid() = user_id);
create policy "user_reviews_update_own" on user_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_reviews_delete_own" on user_reviews
  for delete using (auth.uid() = user_id);

comment on table user_reviews is '사용자 4축 별점 평가. 한 user × 한 harness 1회. 종합 점수 = 자동 70% + 사용자 30% 가중';

-- ----------------------------------------------------------------------------
-- 함수: 사용자 평가 평균 → 100 환산 후 harnesses.user_score 갱신
-- ----------------------------------------------------------------------------
create or replace function recompute_user_score(p_harness_id uuid)
returns void
language plpgsql
as $$
declare
  v_avg numeric;
  v_count integer;
begin
  select
    avg((accuracy_rating + completeness_rating + time_save_rating + domain_fit_rating) / 4.0) * 20,
    count(*)
  into v_avg, v_count
  from user_reviews
  where harness_id = p_harness_id;

  update harnesses
  set user_score = v_avg,
      user_review_count = v_count
  where id = p_harness_id;
end;
$$;

-- 트리거: user_reviews insert/update/delete 시 자동 재계산
create or replace function trg_user_reviews_recompute()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'DELETE') then
    perform recompute_user_score(old.harness_id);
    return old;
  else
    perform recompute_user_score(new.harness_id);
    return new;
  end if;
end;
$$;

drop trigger if exists user_reviews_recompute_trg on user_reviews;
create trigger user_reviews_recompute_trg
  after insert or update or delete on user_reviews
  for each row execute function trg_user_reviews_recompute();

comment on function recompute_user_score is '하네스 사용자 평가 4축 평균 → 100 환산 후 harnesses.user_score 갱신';
