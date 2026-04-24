-- ============================================================================
-- 0008_tags.sql — 태그 마스터 + 하네스 조인
-- ERD §2-5 기준
-- ============================================================================

-- ----------------------------------------------------------------------------
-- tags — 태그 마스터
-- ----------------------------------------------------------------------------
-- category: topic | job | tool
-- usage_count: harness_tags insert/delete 트리거로 갱신 (0101)
create table if not exists tags (
  id          bigint generated always as identity primary key,
  slug        text not null unique,             -- "claude", "florist"
  label       text not null,                    -- "Claude", "꽃집"
  category    text not null default 'topic',
  usage_count integer not null default 0,
  created_at  timestamptz not null default now(),
  constraint tags_category_chk check (category in ('topic','job','tool')),
  constraint tags_slug_len_chk check (char_length(slug) between 1 and 40),
  constraint tags_label_len_chk check (char_length(label) between 1 and 40)
);

create index if not exists tags_category_idx on tags (category, usage_count desc);

alter table tags enable row level security;

comment on table tags is '태그 마스터 · topic/job/tool 3 카테고리';

-- ----------------------------------------------------------------------------
-- harness_tags — 하네스 ↔ 태그 다대다 조인
-- ----------------------------------------------------------------------------
create table if not exists harness_tags (
  harness_id uuid   not null references harnesses(id) on delete cascade,
  tag_id     bigint not null references tags(id)     on delete cascade,
  created_at timestamptz not null default now(),
  primary key (harness_id, tag_id)
);

-- 태그 상세 페이지 (태그로 하네스 역조회)
create index if not exists harness_tags_tag_idx on harness_tags (tag_id);

alter table harness_tags enable row level security;

comment on table harness_tags is '하네스↔태그 다대다 · PK 복합';
