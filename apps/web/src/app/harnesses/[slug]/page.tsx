/**
 * 하네스 상세 `/harnesses/[slug]`
 * 근거: docs/service-dev/02_design/ui.md §2-3
 *
 * 구성: 뒤로 + 공유 + 이식(beta) / 의인화 제목 / 썸네일(16:9) /
 *       목적 / 구조도 Mermaid / 구성요소 / 주접 댓글 + 리액션 바
 * TODO: 구현 — ui.md §2-3 와이어프레임 참조
 *   - API: GET /api/v1/harness/:slug (published+public RLS 필터)
 *   - Mermaid SSR 렌더 (StructureViewer 컴포넌트)
 *   - 댓글: GET /api/v1/harness/:id/comments (cursor)
 *   - 리액션: POST /api/v1/reaction/toggle (낙관적 업데이트)
 *
 * 설계 문서 스펙 경로는 `/h/[slug]`이지만 요청서 준수 차원에서 `/harnesses/[slug]`로 스캐폴딩.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JuzzepReactions } from '@/components/juzzep-reactions';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Params }) {
  // TODO: 구현 — API fetch 후 title/description/og 동적 생성
  return {
    title: `하네스: ${params.slug}`,
    description: '하네스 상세 (준비 중)',
  };
}

export default async function HarnessDetailPage({ params }: { params: Params }) {
  const { slug } = params;
  // TODO: 구현 — fetch(`/api/v1/harness/${slug}`) → 없으면 notFound()
  if (!slug) notFound();

  return (
    <article className="mx-auto max-w-[760px] space-y-8">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <Link
            href="/harnesses"
            className="text-sm text-[color:var(--color-ink-600)] hover:text-brand-700"
            aria-label="갤러리로 돌아가기"
          >
            ← 뒤로
          </Link>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost text-sm" disabled>
              공유
            </button>
            <button type="button" className="btn-ghost text-sm" disabled>
              이식하기 beta
            </button>
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-900 md:text-3xl">
          🌊 (준비 중) — {slug}
        </h1>
        <p className="text-sm text-[color:var(--color-ink-600)]">
          by @handle · 최근 · 👁 0회
        </p>
        <div className="flex flex-wrap gap-2">
          {/* TODO: 구현 — tags 반복 */}
        </div>
      </header>

      {/* 결과 썸네일 */}
      <figure
        aria-label="하네스 결과 스크린샷"
        className="aspect-video w-full rounded-card bg-cream-100"
      >
        {/* TODO: 구현 — media_urls[0] next/image */}
        <div className="flex h-full items-center justify-center text-[color:var(--color-ink-600)]">
          🎬 결과 영상/스크린샷 (준비 중)
        </div>
      </figure>

      <section aria-labelledby="purpose">
        <h2 id="purpose" className="mb-2 text-lg font-semibold text-brand-800">
          📝 목적
        </h2>
        <p className="text-[color:var(--color-ink-900)]">(준비 중)</p>
      </section>

      <section aria-labelledby="structure">
        <h2 id="structure" className="mb-2 text-lg font-semibold text-brand-800">
          🗺 구조도
        </h2>
        <div className="card">
          {/* TODO: 구현 — StructureViewer (Mermaid SSR + 펼치기/복사) */}
          <pre className="overflow-x-auto font-mono text-xs">(Mermaid 준비 중)</pre>
        </div>
      </section>

      <section aria-labelledby="components">
        <h2 id="components" className="mb-2 text-lg font-semibold text-brand-800">
          🧰 구성요소
        </h2>
        <p className="text-sm text-[color:var(--color-ink-600)]">
          (11요소 중 사용 — 준비 중)
        </p>
      </section>

      <section aria-labelledby="reactions">
        <h2 id="reactions" className="mb-2 text-lg font-semibold text-brand-800">
          💬 주접 댓글
        </h2>
        <JuzzepReactions harnessId="TODO" initial={{ heart: 0, fire: 0, bow: 0, pinch: 0 }} />
        {/* TODO: 구현 — 댓글 목록 + 주접지수 게이지 + 작성창 */}
        <div className="mt-4 text-sm text-[color:var(--color-ink-600)]">
          주접 기능 준비 중…
        </div>
      </section>
    </article>
  );
}
