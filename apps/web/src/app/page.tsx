/**
 * 랜딩 `/` — 모바일 우선 단일 컬럼
 * 근거: docs/service-dev/02_design/ui.md §2-1
 *
 * 구성: Hero(H1 + CTA 2종 + 마스코트) → 오늘의 하네스 Teaser → 해설 링크
 * TODO: 구현 — ui.md §2-1 와이어프레임 참조
 *   - logo_v2_sealion_hug.png Hero 일러스트
 *   - Teaser 카드 3건은 API /harness?sort=trending&limit=3 서버 컴포넌트 fetch
 */
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section aria-labelledby="hero-title" className="text-center">
        <p className="mb-4 text-4xl" aria-hidden="true">
          🌊
        </p>
        <h1
          id="hero-title"
          className="font-display text-[32px] font-bold leading-tight text-brand-900 md:text-[48px]"
        >
          우리 하네스 보러 올래?
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-base text-[color:var(--color-ink-600)] md:text-lg">
          내 AI 하네스 자랑하고
          <br />
          주접 받는 커뮤니티
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/join" className="btn-primary" aria-label="Discord 서버 입장하기">
            Discord 들어가기
          </Link>
          <Link href="/harnesses" className="btn-ghost" aria-label="하네스 갤러리 이동">
            갤러리 →
          </Link>
        </div>
      </section>

      {/* Teaser — 오늘의 하네스 3건 */}
      <section aria-labelledby="teaser-title" className="space-y-4">
        <h2 id="teaser-title" className="text-xl font-bold text-brand-800 md:text-2xl">
          ✨ 오늘의 하네스
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6">
          {/* TODO: 구현 — /api/v1/harness?sort=trending&limit=3 서버 fetch + HarnessCard 매핑 */}
          <div className="card text-center text-sm text-[color:var(--color-ink-600)]">
            (준비 중) 인기 하네스 로딩 예정
          </div>
          <div className="card text-center text-sm text-[color:var(--color-ink-600)]">
            (준비 중)
          </div>
          <div className="card text-center text-sm text-[color:var(--color-ink-600)]">
            (준비 중)
          </div>
        </div>
      </section>

      {/* 해설 링크 */}
      <section className="card text-center">
        <p className="text-base">
          &quot;하네스가 뭐예요?&quot;{' '}
          <Link href="/about" className="font-semibold text-brand-700 underline underline-offset-2">
            3분 설명 보기 →
          </Link>
        </p>
      </section>
    </div>
  );
}
