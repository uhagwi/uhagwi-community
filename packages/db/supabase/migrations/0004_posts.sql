-- ============================================================================
-- 0004_posts.sql — posts 래퍼 보강 (1:1 분리 근거)
--
-- 배경: ERD §2-2에서 posts 래퍼를 하네스 본체와 분리한 근거는
--   "Phase 2에서 회고글·튜토리얼 타입 확장 시 상태/슬러그/신고 로직을 재사용하기 위함"
-- posts 본 테이블은 의존성 때문에 0002에서 선생성했고,
-- 본 파일은 공통 운영 컬럼·보조 인덱스·슬러그 정규화 함수를 추가한다.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- featured 만료 자동 해제 인덱스 (배치 쿼리용)
-- ----------------------------------------------------------------------------
create index if not exists posts_featured_expiry_idx
  on posts (featured_until)
  where status = 'featured' and featured_until is not null;

-- ----------------------------------------------------------------------------
-- slug 유틸리티 함수 — 한글/영문 혼합 문자열을 URL 슬러그로 정규화
-- ----------------------------------------------------------------------------
-- 규칙:
--   1. lower-case
--   2. 공백/특수문자 → '-'
--   3. 연속 '-' 압축
--   4. 앞뒤 '-' 제거
--   5. 최대 80자 절단
-- 한글은 그대로 유지 (nextjs URL에서 encodeURIComponent 처리)
create or replace function util_slugify(input text)
returns text
language plpgsql
immutable
as $$
declare
  out_text text;
begin
  if input is null or length(trim(input)) = 0 then
    return null;
  end if;
  out_text := lower(trim(input));
  out_text := regexp_replace(out_text, '[^a-z0-9가-힣]+', '-', 'g');
  out_text := regexp_replace(out_text, '-+', '-', 'g');
  out_text := regexp_replace(out_text, '^-|-$', '', 'g');
  return substr(out_text, 1, 80);
end;
$$;

comment on function util_slugify(text) is '한글/영문 혼합 문자열을 URL 슬러그로 정규화 (≤80자)';

-- ----------------------------------------------------------------------------
-- 편의용 뷰: 공개 조회 가능한 하네스 posts만
-- ----------------------------------------------------------------------------
-- Next.js 갤러리·피드에서 직접 참조
create or replace view public_harness_posts as
select
  p.id            as post_id,
  p.slug,
  p.status,
  p.published_at,
  p.author_id,
  h.id            as harness_id,
  h.title,
  h.persona_name,
  h.one_liner,
  h.persona_job,
  h.components,
  h.view_count,
  h.avg_juzzep,
  h.trending_score
from posts p
join harnesses h on h.post_id = p.id
where p.status in ('published', 'featured')
  and p.visibility = 'public'
  and p.deleted_at is null;

comment on view public_harness_posts is '공개 갤러리용 · published/featured + public만 노출';
