-- 0105_google_oauth.sql
-- 사업모델 #9 (CLAUDE.md): Google + Discord 2-프로바이더 (1년차).
-- Kakao·Naver는 한국 정식 출시 직전 별도 마이그레이션.
--
-- 변경:
--   1) users 테이블에 google_id 컬럼 추가 (unique nullable)
--   2) discord_id 컬럼 NOT NULL → NULLABLE 로 완화 (Google 단독 가입자 허용)
--   3) provider 식별을 위한 보조 인덱스
--   4) (discord_id, google_id) 둘 중 하나는 반드시 있어야 한다는 CHECK

alter table users
  add column if not exists google_id text;

create unique index if not exists users_google_id_unique
  on users(google_id)
  where google_id is not null;

-- discord_id NOT NULL 제약이 있으면 풀어줌 (구버전 마이그 호환)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'discord_id' and is_nullable = 'NO'
  ) then
    alter table users alter column discord_id drop not null;
  end if;
end $$;

-- 두 외부 식별자 중 최소 하나는 있어야 함
alter table users
  drop constraint if exists users_provider_id_required;
alter table users
  add constraint users_provider_id_required
  check (discord_id is not null or google_id is not null);

comment on column users.google_id is 'Google OAuth sub (subject) — pkce 결합 식별자. nullable.';
comment on column users.discord_id is 'Discord OAuth user.id (snowflake). nullable since 0105.';
