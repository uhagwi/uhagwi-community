-- ============================================================================
-- seed.sql — 개발용 샘플 데이터
--   - 테스트 유저 2명 (builder 1 + member 1)
--   - 하네스 3건 (꽃집 주문이 · 약국 조제봇 · 중등 수학 튜터)
--   - 댓글 5건 (주접 지수 포함)
--   - 리액션 10건 (4종 분산)
--   - 태그 몇 개 + 조인
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. 테스트 유저
-- ----------------------------------------------------------------------------
-- UUID를 고정(개발 편의) — 프로덕션 seed에는 gen_random_uuid() 사용 권장
insert into users (id, discord_id, handle, display_name, role, bio)
values
  ('11111111-1111-1111-1111-111111111111',
   'discord_snowflake_alice_0001', 'alice', '앨리스',
   'builder',  '꽃집 운영 3년차 · AI로 조금이라도 편해지고 싶어요'),
  ('22222222-2222-2222-2222-222222222222',
   'discord_snowflake_bob_0002',   'bob',   '밥',
   'member',   '동네 약국 시스템을 AI로 바꿔보는 중')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 2. 태그
-- ----------------------------------------------------------------------------
insert into tags (slug, label, category) values
  ('claude',     'Claude',    'tool'),
  ('chatgpt',    'ChatGPT',   'tool'),
  ('florist',    '꽃집',       'job'),
  ('pharmacist', '약국',       'job'),
  ('teacher',    '선생님',      'job'),
  ('prompt',     '프롬프트',    'topic')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- 3. 하네스 3건 (posts + harnesses 쌍)
-- ----------------------------------------------------------------------------

-- 하네스 #1: 꽃집 주문이 (앨리스)
insert into posts (id, author_id, type, status, visibility, slug, published_at)
values (
  'aaaaaaaa-0001-0001-0001-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'harness', 'published', 'public',
  util_slugify('꽃집 주문이 · 전화 주문 받아주는 하네스'),
  now() - interval '2 days'
) on conflict (id) do nothing;

insert into harnesses (
  id, post_id, title, persona_name, one_liner, purpose,
  components, persona_job
) values (
  'bbbbbbbb-0001-0001-0001-000000000001',
  'aaaaaaaa-0001-0001-0001-000000000001',
  '꽃집 주문이',
  '주문이',
  '전화 주문 받아서 카카오톡으로 요약해 주는 친구',
  '전화로 "어버이날 꽃다발 5만원짜리, 내일 오후 2시 픽업" 이렇게 들어오면 주문표로 정리해서 카카오톡 단톡에 올려주게 만들었어요. 꽃말 추천까지 얹어줍니다.',
  array['tools','memory','prompt','context','tone'],
  'florist'
) on conflict (id) do nothing;

-- 하네스 #2: 약국 조제봇 (밥)
insert into posts (id, author_id, type, status, visibility, slug, published_at)
values (
  'aaaaaaaa-0002-0002-0002-000000000002',
  '22222222-2222-2222-2222-222222222222',
  'harness', 'published', 'public',
  util_slugify('약국 조제봇 · 복약 안내문 자동 생성'),
  now() - interval '1 days'
) on conflict (id) do nothing;

insert into harnesses (
  id, post_id, title, persona_name, one_liner, purpose,
  components, persona_job
) values (
  'bbbbbbbb-0002-0002-0002-000000000002',
  'aaaaaaaa-0002-0002-0002-000000000002',
  '약국 조제봇',
  '약사님',
  '처방전 찍으면 복약 안내문을 어르신 말투로 써주는 도구',
  '처방전 사진 올리면 약품명·용법·주의사항을 어르신도 바로 이해할 수 있게 풀어서 안내문으로 뽑아줍니다. 옆집 약사 친구도 쓰는 중.',
  array['tools','prompt','context','tone','safety'],
  'pharmacist'
) on conflict (id) do nothing;

-- 하네스 #3: 중등 수학 튜터 (앨리스 - 본업 외 작품)
insert into posts (id, author_id, type, status, visibility, slug, published_at)
values (
  'aaaaaaaa-0003-0003-0003-000000000003',
  '11111111-1111-1111-1111-111111111111',
  'harness', 'published', 'public',
  util_slugify('중등 수학 튜터 · 오답 노트 자동화'),
  now() - interval '6 hours'
) on conflict (id) do nothing;

insert into harnesses (
  id, post_id, title, persona_name, one_liner, purpose,
  components, persona_job
) values (
  'bbbbbbbb-0003-0003-0003-000000000003',
  'aaaaaaaa-0003-0003-0003-000000000003',
  '수학 튜터 풀이쌤',
  '풀이쌤',
  '조카 수학 숙제 오답만 모아서 맞춤 복습표 만들어주는 쌤',
  '조카가 틀린 문제 사진만 모아서 올리면 유형별로 묶어주고 비슷한 연습문제 3개씩 추천해줍니다. 중학생 조카 한 달 돌려봤는데 반응 좋아요.',
  array['tools','memory','prompt','context'],
  'teacher'
) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. harness_tags 조인
-- ----------------------------------------------------------------------------
insert into harness_tags (harness_id, tag_id)
select 'bbbbbbbb-0001-0001-0001-000000000001', id from tags where slug in ('claude','florist','prompt')
on conflict do nothing;

insert into harness_tags (harness_id, tag_id)
select 'bbbbbbbb-0002-0002-0002-000000000002', id from tags where slug in ('chatgpt','pharmacist')
on conflict do nothing;

insert into harness_tags (harness_id, tag_id)
select 'bbbbbbbb-0003-0003-0003-000000000003', id from tags where slug in ('claude','teacher')
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- 5. 댓글 5건 (주접 지수 포함)
-- ----------------------------------------------------------------------------
insert into comments (harness_id, author_id, body, juzzep_score) values
  ('bbbbbbbb-0001-0001-0001-000000000001',
   '22222222-2222-2222-2222-222222222222',
   '주문이 이름부터 귀여워요 ㅋㅋ 저희 약국에도 환자이 하나 두고 싶네요', 72),
  ('bbbbbbbb-0001-0001-0001-000000000001',
   '22222222-2222-2222-2222-222222222222',
   '꽃말 추천까지 끼얹는 건 반칙입니다… 이건 꽃 AGI 아닙니까', 88),
  ('bbbbbbbb-0002-0002-0002-000000000002',
   '11111111-1111-1111-1111-111111111111',
   '어르신 말투 변환 부분 진짜 따뜻해요. 저희 할머니도 이거면 알아들으실 듯', 65),
  ('bbbbbbbb-0003-0003-0003-000000000003',
   '22222222-2222-2222-2222-222222222222',
   '풀이쌤 이름 너무 좋음 ㅋㅋㅋㅋ 조카 엄마가 탐낼 듯', 81),
  ('bbbbbbbb-0003-0003-0003-000000000003',
   '22222222-2222-2222-2222-222222222222',
   '오답노트 자동화는 솔직히 제가 학생 때 있었으면 인생 바뀌었습니다', 90);

-- ----------------------------------------------------------------------------
-- 6. 리액션 10건 (4종 분산)
-- ----------------------------------------------------------------------------
-- alice → bob 하네스에, bob → alice 하네스에 서로 주는 형태
-- (동일 (harness,user,type) unique 때문에 중복 금지)

-- 하네스 #1 (꽃집 주문이) 받는 리액션
insert into reactions (harness_id, user_id, type) values
  ('bbbbbbbb-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'heart'),
  ('bbbbbbbb-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'fire'),
  ('bbbbbbbb-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'pinch');

-- 하네스 #2 (약국 조제봇)
insert into reactions (harness_id, user_id, type) values
  ('bbbbbbbb-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'heart'),
  ('bbbbbbbb-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'bow'),
  ('bbbbbbbb-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'fire');

-- 하네스 #3 (풀이쌤)
insert into reactions (harness_id, user_id, type) values
  ('bbbbbbbb-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', 'heart'),
  ('bbbbbbbb-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', 'fire'),
  ('bbbbbbbb-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', 'pinch'),
  ('bbbbbbbb-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', 'bow');

-- ----------------------------------------------------------------------------
-- 7. materialized view 초기 refresh
-- ----------------------------------------------------------------------------
refresh materialized view harness_reaction_counts;

commit;
