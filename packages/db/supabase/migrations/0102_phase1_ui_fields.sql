-- ============================================================================
-- 0102_phase1_ui_fields.sql — Phase 1 UI 렌더링용 컬럼 추가
-- ----------------------------------------------------------------------------
-- 갤러리 카드·상세 페이지에서 쓰는 필드를 ERD에 후행 추가:
--   thumbnail_url  / thumbnail_emoji  / category  / body_md
-- 기존 seed 3건에도 적합한 값 백필.
-- ============================================================================

alter table harnesses
  add column if not exists thumbnail_url   text,
  add column if not exists thumbnail_emoji text,
  add column if not exists category        text,
  add column if not exists body_md         text;

alter table harnesses
  drop constraint if exists harnesses_category_chk;
alter table harnesses
  add constraint harnesses_category_chk
  check (category is null or category in ('verify','improve','proposal','develop','other'));

-- 기존 seed 3건 백필 (없으면 no-op)
update harnesses set
  thumbnail_emoji = '🌸',
  category = 'other'
where persona_name = '주문이' and category is null;

update harnesses set
  thumbnail_emoji = '💊',
  category = 'other'
where persona_name = '조제봇' and category is null;

update harnesses set
  thumbnail_emoji = '🧮',
  category = 'other'
where persona_name = '풀이쌤' and category is null;

-- harnesses.body_md 가 비어있으면 purpose 로 폴백 (UI에서 본문 위젯이 비어보이지 않게)
update harnesses
   set body_md = purpose
 where body_md is null;

comment on column harnesses.thumbnail_url   is '캐릭터 썸네일 URL (Phase 2 자동 생성)';
comment on column harnesses.thumbnail_emoji is '이미지 미생성 시 fallback 이모지';
comment on column harnesses.category        is 'UI 필터용 분류 — verify|improve|proposal|develop|other';
comment on column harnesses.body_md         is 'Markdown 본문 (purpose보다 길고 상세)';
