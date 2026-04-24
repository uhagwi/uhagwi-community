/**
 * 하네스 갤러리 `/harnesses`
 * 근거: docs/service-dev/02_design/ui.md §2-2
 *
 * 구성: 검색바 + 정렬 + 직업필터 + 태그칩 row + 카드 그리드(1/2/3 col) + 무한 스크롤
 * TODO: 구현 — ui.md §2-2 와이어프레임 참조
 *   - API: GET /api/v1/harness?sort=trending&cursor=...&limit=20
 *   - 필터: job, component, tag 쿼리스트링 바인딩
 *   - 무한 스크롤: intersection observer (클라이언트 컴포넌트로 분리)
 *
 * 설계 문서 스펙 경로는 `/gallery`이지만 요청서 준수차원에서 `/harnesses`로 스캐폴딩.
 * 추후 정본은 설계 문서와 통일 필요 (routing alias 또는 경로 수정).
 */
import Link from 'next/link';

export const metadata = {
  title: '하네스 갤러리',
  description: '일반인·실무자가 만든 AI 하네스 모음',
};

export default function HarnessesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-brand-900 md:text-3xl">하네스 갤러리</h1>
        <p className="text-[color:var(--color-ink-600)]">
          요즘 사람들이 만든 하네스 구경해 볼까?
        </p>
      </header>

      {/* 필터 바 (sticky) — TODO: 구현 */}
      <div className="sticky top-0 z-10 flex flex-col gap-3 rounded-card bg-cream-50/95 p-3 shadow-card backdrop-blur md:flex-row md:items-center">
        {/* TODO: 구현 — SearchInput, SortSelect, JobFilter */}
        <input
          type="search"
          aria-label="하네스 검색"
          placeholder="🔍 검색 (준비 중)"
          disabled
          className="flex-1 rounded-[10px] border border-[color:var(--color-ink-300)] bg-white px-4 py-2 text-sm disabled:opacity-60"
        />
        <button type="button" disabled className="btn-ghost text-sm disabled:opacity-60">
          정렬 ▾
        </button>
        <button type="button" disabled className="btn-ghost text-sm disabled:opacity-60">
          직업 ▾
        </button>
      </div>

      {/* 태그 Chip row (가로 스크롤) */}
      <div className="flex gap-2 overflow-x-auto pb-2" aria-label="태그 필터">
        {['#꽃집', '#교사', '#노코드', '#Claude', '#n8n'].map((t) => (
          <span key={t} className="tag-chip shrink-0">
            {t}
          </span>
        ))}
      </div>

      {/* 카드 그리드 — 빈 상태 */}
      <section
        aria-label="하네스 목록"
        className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6"
      >
        {/* TODO: 구현 — API 응답 → HarnessCard 매핑 */}
        <div className="card col-span-full flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-5xl" aria-hidden="true">
            🌊
          </p>
          <p className="text-[color:var(--color-ink-600)]">
            아직 하네스가 없어요. 첫 번째 주인공이 되어볼래요?
          </p>
          <Link href="/harnesses/new" className="btn-primary">
            + 하네스 포스팅하기
          </Link>
        </div>
      </section>
    </div>
  );
}
