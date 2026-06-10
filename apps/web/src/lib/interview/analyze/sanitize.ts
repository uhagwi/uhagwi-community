/**
 * Opus가 빈 placeholder 항목을 끼워보내는 경우 방어적으로 필터·rank 재정렬.
 * (사례: auto_candidates 6번째에 빈 객체 생성해서 zod 검증 실패)
 */

export function sanitizeAutoCandidates(parsedResult: unknown): void {
  if (
    !parsedResult ||
    typeof parsedResult !== 'object' ||
    !('auto_candidates' in parsedResult) ||
    !Array.isArray((parsedResult as { auto_candidates: unknown[] }).auto_candidates)
  ) {
    return;
  }
  const obj = parsedResult as { auto_candidates: Array<Record<string, unknown>> };
  obj.auto_candidates = obj.auto_candidates.filter((c) => {
    const title = typeof c.title === 'string' ? c.title.trim() : '';
    const domain = typeof c.domain === 'string' ? c.domain.trim() : '';
    // Phase 2/comprehensive는 `why`, Phase 4는 `why_user_chose` — 둘 중 하나만 있어도 유효
    const why = typeof c.why === 'string' ? c.why.trim() : '';
    const whyUser = typeof c.why_user_chose === 'string' ? c.why_user_chose.trim() : '';
    return title.length >= 2 && domain.length >= 2 && (why.length >= 10 || whyUser.length >= 10);
  });
  obj.auto_candidates.forEach((c, i) => {
    c.rank = i + 1;
  });
}
