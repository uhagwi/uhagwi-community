'use client';

/**
 * /gacha — 우하귀 가챠 페이지.
 * 정책 v2: 뽑기 = 결제 게이트, 컬렉션 등록 = 무료/사용자 선택.
 * 관리자 모드: ?admin=1
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CATALOG_SIZE } from '@/lib/gacha/catalog-seed';
import { AdminPanel } from './_components/AdminPanel';
import { IntroPanel } from './_components/IntroPanel';
import { DrawnGrid } from './_components/DrawnGrid';
import { useGachaState } from './_components/use-gacha-state';

export default function GachaPage() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('admin') === '1';
  const g = useGachaState(isAdmin);

  if (!g.hydrated) {
    return (
      <div className="mx-auto max-w-[760px] py-16 text-center">
        <p className="text-sm text-[color:var(--color-ink-600)]">불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-4rem)] flex-col md:-mx-6 md:-my-12">
      <header
        className={`border-b px-4 py-3 md:px-6 ${
          isAdmin ? 'border-orange-300 bg-orange-50' : 'border-brand-100 bg-cream-50'
        }`}
      >
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <div>
            <p className="text-sm font-bold text-brand-900">
              🎴 우하귀 가챠
              {isAdmin ? (
                <span className="ml-2 rounded-pill bg-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-900">
                  🛠 관리자 모드
                </span>
              ) : null}
            </p>
            <p className="text-xs text-[color:var(--color-ink-600)]">
              검증된 등급 하네스 {CATALOG_SIZE}장 풀 — 바로 쓸 수 있는 자동화
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost text-xs">홈</Link>
            <Link href="/gallery" className="btn-ghost text-xs">🖼 갤러리</Link>
            <Link href="/interview" className="btn-ghost text-xs">맞춤 진단 →</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[1100px] space-y-5">
          {isAdmin ? (
            <AdminPanel
              gradeFilter={g.gradeFilter}
              setGradeFilter={g.setGradeFilter}
              poolSize={g.poolSize}
              onDrawN={g.drawN}
              onShowAll={g.adminShowAll}
              onFillAll={g.adminFillAll}
              onReset={g.adminResetCollection}
            />
          ) : null}

          {g.drawn.length === 0 ? (
            <IntroPanel
              filter={g.filter}
              setFilter={g.setFilter}
              remainingFree={g.remainingFree}
              totalDrawn={g.state.total_drawn}
              onDrawFree={g.drawFree}
              onDrawPro={g.drawPro}
              isAdmin={isAdmin}
            />
          ) : (
            <DrawnGrid
              drawn={g.drawn}
              flipped={g.flipped}
              collected={g.collected}
              onFlip={g.flip}
              onCollectOne={g.collectOne}
              onCollectAll={g.collectAll}
              onDrawPro={g.drawPro}
              onReset={g.reset}
            />
          )}
        </div>
      </main>
    </div>
  );
}
