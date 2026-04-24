-- ============================================================================
-- 0005_reactions.sql — 4종 리액션 (heart/fire/bow/pinch)
-- ERD §2-4 기준
--
-- 주의: ERD 문서는 bigint identity PK + (harness_id, user_id, type) unique 제약을 쓴다.
--       유저 요청의 "PRIMARY KEY 복합"은 같은 유일성을 보장하므로 ERD 원안(bigint PK + unique)을 따름.
--       (unique가 사실상 복합 키 역할 · 추가 bigint PK는 향후 감사·삭제 로그에서 식별자로 유용)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- reaction_type enum
-- ----------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'reaction_type') then
    create type reaction_type as enum ('heart', 'fire', 'bow', 'pinch');
  end if;
end $$;

comment on type reaction_type is
  'heart=공감 · fire=불꽃 · bow=존경(큰절) · pinch=볼꼬집(귀여움)';

-- ----------------------------------------------------------------------------
-- reactions 테이블
-- ----------------------------------------------------------------------------
-- 1인이 동일 하네스에 동일 type은 1회만 누를 수 있음
-- 다른 type은 중복 가능 (heart + fire 동시 누름 허용)
create table if not exists reactions (
  id         bigint generated always as identity primary key,
  harness_id uuid not null references harnesses(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  type       reaction_type not null,
  created_at timestamptz not null default now(),
  unique (harness_id, user_id, type)
);

-- 하네스 카드의 리액션 카운트 집계용
create index if not exists reactions_harness_type_idx
  on reactions (harness_id, type);

-- 내가 누른 리액션 조회 (프로필 페이지)
create index if not exists reactions_user_idx
  on reactions (user_id, created_at desc);

alter table reactions enable row level security;

comment on table reactions is '4종 리액션 · 1인 1하네스 1type 1회';
