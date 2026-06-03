-- ============================================================================
-- 0103_phase2_manifest.sql — 하네스 본체(파일 3종) 저장
-- ----------------------------------------------------------------------------
-- 컨셉: 하네스 = CLAUDE.md + .claude/agents/* + .claude/skills/* 3가지
-- 이 3가지를 manifest jsonb 컬럼에 통째로 보관 → 상세 페이지 스펙 표시 + ZIP 다운로드.
--
-- manifest 구조:
-- {
--   "claude_md": "# ...",
--   "agents": [{ "name", "content", "summary", "model" }],
--   "skills": [{ "name", "content", "trigger", "summary" }],
--   "stats": { "agent_count", "skill_count", "total_bytes" }
-- }
-- ============================================================================

alter table harnesses
  add column if not exists manifest jsonb;

-- 검색·정렬 가속 (구성요소 갯수 기반 정렬 등)
create index if not exists harnesses_manifest_stats_idx
  on harnesses ((manifest->'stats'));

comment on column harnesses.manifest is
  '하네스 본체: { claude_md, agents[], skills[], stats }. ZIP 다운로드·스펙 페이지 소스.';
