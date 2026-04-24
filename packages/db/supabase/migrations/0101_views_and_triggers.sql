-- ============================================================================
-- 0101_views_and_triggers.sql
--   - harness_reaction_counts materialized view + refresh 트리거
--   - harness_comment_counts / harness_import_counts 일반 view
--   - reports 3건 누적 시 posts.status='reported' 자동 전환 트리거
--   - updated_at 자동 갱신 트리거 (전 테이블)
--   - tags.usage_count 갱신 트리거
--   - comments → harnesses.avg_juzzep rolling avg 트리거
-- ERD §4, §5 기준
-- ============================================================================

-- ============================================================================
-- 1. 리액션 카운트 materialized view
-- ============================================================================
-- 정확도 100% 필요 (읽기 쿼리 1회 축소)
drop materialized view if exists harness_reaction_counts;
create materialized view harness_reaction_counts as
select
  h.id as harness_id,
  coalesce(sum(case when r.type = 'heart' then 1 else 0 end), 0)::int as heart_count,
  coalesce(sum(case when r.type = 'fire'  then 1 else 0 end), 0)::int as fire_count,
  coalesce(sum(case when r.type = 'bow'   then 1 else 0 end), 0)::int as bow_count,
  coalesce(sum(case when r.type = 'pinch' then 1 else 0 end), 0)::int as pinch_count,
  count(r.id)::int as total_count
from harnesses h
left join reactions r on r.harness_id = h.id
group by h.id;

-- concurrent refresh를 위해 unique 인덱스 필수
create unique index if not exists harness_reaction_counts_pk
  on harness_reaction_counts (harness_id);

comment on materialized view harness_reaction_counts is
  '리액션 4종 카운트 · reactions insert/delete 시 concurrent refresh';

-- ----------------------------------------------------------------------------
-- refresh 함수 + 트리거
-- ----------------------------------------------------------------------------
create or replace function refresh_harness_reaction_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- concurrent refresh는 lock 최소화
  -- 트랜잭션 내에서 중복 호출 방지를 위해 pg_advisory_xact_lock 사용
  perform pg_advisory_xact_lock(hashtext('harness_reaction_counts'));
  refresh materialized view concurrently harness_reaction_counts;
  return null;
exception when others then
  -- refresh 실패가 트랜잭션 전체를 뒤엎지 않도록 로그만 남김
  raise warning '[refresh_harness_reaction_counts] 실패: %', sqlerrm;
  return null;
end;
$$;

drop trigger if exists reactions_refresh_counts on reactions;
create trigger reactions_refresh_counts
  after insert or delete on reactions
  for each statement
  execute function refresh_harness_reaction_counts();

-- ============================================================================
-- 2. 댓글 수 / 이식 수 일반 view
-- ============================================================================
create or replace view harness_comment_counts as
select
  harness_id,
  count(*)::int as comment_count
from comments
where deleted_at is null
group by harness_id;

create or replace view harness_import_counts as
select
  harness_id,
  count(*) filter (where status = 'succeeded')::int as succeeded_count,
  count(*) filter (where status = 'failed')::int    as failed_count,
  count(*)::int as total_count
from imports
group by harness_id;

comment on view harness_comment_counts is '댓글 수 실시간 view (index 사용)';
comment on view harness_import_counts is '이식 수 집계 view (succeeded/failed/total)';

-- ============================================================================
-- 3. reports 3건 누적 → posts.status='reported' 자동 전환
-- ============================================================================
create or replace function trigger_reports_auto_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  open_count int;
begin
  -- post 대상 신고에만 적용 (comment/user는 운영자 수동 검토)
  if new.target_type <> 'post' then
    return new;
  end if;

  select count(*) into open_count
  from reports
  where target_type = 'post'
    and target_id = new.target_id
    and status = 'open';

  if open_count >= 3 then
    update posts
       set status = 'reported',
           updated_at = now()
     where id = new.target_id
       and status not in ('reported','deleted');
  end if;

  return new;
end;
$$;

drop trigger if exists reports_auto_flag on reports;
create trigger reports_auto_flag
  after insert on reports
  for each row
  execute function trigger_reports_auto_flag();

comment on function trigger_reports_auto_flag() is
  'reports open 3건 누적 시 posts.status=reported 자동 전환';

-- ============================================================================
-- 4. updated_at 자동 갱신 트리거 (공통)
-- ============================================================================
create or replace function trigger_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 대상 테이블에 반복 부착
do $$
declare
  t text;
begin
  foreach t in array array['users','posts','harnesses','comments','imports']
  loop
    execute format('drop trigger if exists set_updated_at on %I', t);
    execute format(
      'create trigger set_updated_at before update on %I
         for each row execute function trigger_set_updated_at()',
      t
    );
  end loop;
end $$;

-- ============================================================================
-- 5. tags.usage_count 갱신 (harness_tags insert/delete)
-- ============================================================================
create or replace function trigger_tags_usage_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update tags set usage_count = usage_count + 1 where id = new.tag_id;
    return new;
  elsif tg_op = 'DELETE' then
    update tags set usage_count = greatest(usage_count - 1, 0) where id = old.tag_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists harness_tags_usage on harness_tags;
create trigger harness_tags_usage
  after insert or delete on harness_tags
  for each row
  execute function trigger_tags_usage_count();

-- ============================================================================
-- 6. comments insert → harnesses.avg_juzzep rolling 갱신
-- ============================================================================
create or replace function trigger_update_avg_juzzep()
returns trigger
language plpgsql
as $$
begin
  if new.juzzep_score is null then
    return new;
  end if;
  update harnesses h
     set avg_juzzep = (
       select avg(c.juzzep_score)::numeric(5,2)
       from comments c
       where c.harness_id = new.harness_id
         and c.juzzep_score is not null
         and c.deleted_at is null
     ),
     updated_at = now()
   where h.id = new.harness_id;
  return new;
end;
$$;

drop trigger if exists comments_update_avg_juzzep on comments;
create trigger comments_update_avg_juzzep
  after insert or update of juzzep_score on comments
  for each row
  execute function trigger_update_avg_juzzep();

comment on function trigger_update_avg_juzzep() is
  '댓글 juzzep_score 입력 시 harnesses.avg_juzzep rolling avg 갱신';
