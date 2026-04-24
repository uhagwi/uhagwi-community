-- ============================================================================
-- 0100_rls_policies.sql — 전 테이블 RLS 정책
-- ERD §5 기준
--
-- 원칙:
--   - 기본값 deny (enable row level security + 정책 미선언 = 차단)
--   - public 읽기: published + visibility=public 만
--   - 본인 쓰기: author_id = auth.uid()
--   - 운영자(users.role='operator'): 전 테이블 우회
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 헬퍼 함수: 운영자 여부
-- ----------------------------------------------------------------------------
-- 정책 내 반복되는 operator 체크를 단일 함수로 캡슐화
create or replace function is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from users u
    where u.id = auth.uid() and u.role = 'operator' and u.deleted_at is null
  );
$$;

comment on function is_operator() is '현재 세션 사용자가 운영자인지 (RLS 우회 판별용)';

-- ============================================================================
-- users
-- ============================================================================
-- 공개 프로필 조회 (탈퇴·삭제자 제외)
drop policy if exists users_public_read on users;
create policy users_public_read on users
  for select using (deleted_at is null and status = 'active');

-- 본인 전체 조회 (비활성 상태 포함)
drop policy if exists users_self_read on users;
create policy users_self_read on users
  for select using (id = auth.uid());

-- 본인 프로필 수정
drop policy if exists users_self_update on users;
create policy users_self_update on users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- 운영자 우회
drop policy if exists users_operator_all on users;
create policy users_operator_all on users
  for all using (is_operator()) with check (is_operator());

-- ============================================================================
-- posts
-- ============================================================================
drop policy if exists posts_public_read on posts;
create policy posts_public_read on posts
  for select using (
    status in ('published','featured')
    and visibility = 'public'
    and deleted_at is null
  );

drop policy if exists posts_owner_read on posts;
create policy posts_owner_read on posts
  for select using (author_id = auth.uid());

drop policy if exists posts_owner_insert on posts;
create policy posts_owner_insert on posts
  for insert with check (author_id = auth.uid());

drop policy if exists posts_owner_update on posts;
create policy posts_owner_update on posts
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists posts_owner_delete on posts;
create policy posts_owner_delete on posts
  for delete using (author_id = auth.uid());

drop policy if exists posts_operator_all on posts;
create policy posts_operator_all on posts
  for all using (is_operator()) with check (is_operator());

-- ============================================================================
-- harnesses — posts 정책을 상속하지만 harnesses 자체에도 정책 필요
-- ============================================================================
-- posts가 공개 가능 상태면 harnesses도 공개
drop policy if exists harnesses_public_read on harnesses;
create policy harnesses_public_read on harnesses
  for select using (
    exists (
      select 1 from posts p
      where p.id = harnesses.post_id
        and p.status in ('published','featured')
        and p.visibility = 'public'
        and p.deleted_at is null
    )
  );

drop policy if exists harnesses_owner_rw on harnesses;
create policy harnesses_owner_rw on harnesses
  for all using (
    exists (select 1 from posts p where p.id = harnesses.post_id and p.author_id = auth.uid())
  ) with check (
    exists (select 1 from posts p where p.id = harnesses.post_id and p.author_id = auth.uid())
  );

drop policy if exists harnesses_operator_all on harnesses;
create policy harnesses_operator_all on harnesses
  for all using (is_operator()) with check (is_operator());

-- ============================================================================
-- comments
-- ============================================================================
drop policy if exists comments_public_read on comments;
create policy comments_public_read on comments
  for select using (deleted_at is null);

drop policy if exists comments_owner_insert on comments;
create policy comments_owner_insert on comments
  for insert with check (author_id = auth.uid());

drop policy if exists comments_owner_update on comments;
create policy comments_owner_update on comments
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists comments_owner_delete on comments;
create policy comments_owner_delete on comments
  for delete using (author_id = auth.uid());

drop policy if exists comments_operator_all on comments;
create policy comments_operator_all on comments
  for all using (is_operator()) with check (is_operator());

-- ============================================================================
-- reactions
-- ============================================================================
drop policy if exists reactions_public_read on reactions;
create policy reactions_public_read on reactions
  for select using (true);

drop policy if exists reactions_owner_write on reactions;
create policy reactions_owner_write on reactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists reactions_operator_all on reactions;
create policy reactions_operator_all on reactions
  for all using (is_operator()) with check (is_operator());

-- ============================================================================
-- tags / harness_tags
-- ============================================================================
drop policy if exists tags_public_read on tags;
create policy tags_public_read on tags for select using (true);

drop policy if exists tags_operator_write on tags;
create policy tags_operator_write on tags
  for all using (is_operator()) with check (is_operator());

drop policy if exists harness_tags_public_read on harness_tags;
create policy harness_tags_public_read on harness_tags for select using (true);

drop policy if exists harness_tags_owner_write on harness_tags;
create policy harness_tags_owner_write on harness_tags
  for all using (
    exists (
      select 1 from harnesses h
      join posts p on p.id = h.post_id
      where h.id = harness_tags.harness_id and p.author_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from harnesses h
      join posts p on p.id = h.post_id
      where h.id = harness_tags.harness_id and p.author_id = auth.uid()
    )
  );

-- ============================================================================
-- imports
-- ============================================================================
-- 이식 기록은 본인 것만 조회 가능 (프라이버시)
drop policy if exists imports_owner_read on imports;
create policy imports_owner_read on imports
  for select using (user_id = auth.uid());

drop policy if exists imports_owner_write on imports;
create policy imports_owner_write on imports
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists imports_operator_all on imports;
create policy imports_operator_all on imports
  for all using (is_operator()) with check (is_operator());

-- ============================================================================
-- reports
-- ============================================================================
drop policy if exists reports_reporter_read on reports;
create policy reports_reporter_read on reports
  for select using (reporter_id = auth.uid());

drop policy if exists reports_reporter_insert on reports;
create policy reports_reporter_insert on reports
  for insert with check (reporter_id = auth.uid());

drop policy if exists reports_operator_all on reports;
create policy reports_operator_all on reports
  for all using (is_operator()) with check (is_operator());

-- ============================================================================
-- follows
-- ============================================================================
drop policy if exists follows_public_read on follows;
create policy follows_public_read on follows for select using (true);

drop policy if exists follows_owner_write on follows;
create policy follows_owner_write on follows
  for all using (follower_id = auth.uid()) with check (follower_id = auth.uid());
