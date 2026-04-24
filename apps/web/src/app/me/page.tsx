/**
 * 내 프로필 `/me` — 내 하네스 관리 (인증 필수)
 * 근거: docs/service-dev/02_design/ui.md §2-6
 *
 * 구성: 아바타·bio·통계 / 탭(공개 하네스 · 초안 · 받은 주접) / 하네스 카드 그리드
 * TODO: 구현 — ui.md §2-6 참조
 *   - API: GET /api/v1/me (본인 정보 + 통계)
 *   - 초안 이어쓰기 / 편집 / 공개범위 변경 / 삭제 액션
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const metadata = { title: '내 하네스' };

export default async function MePage() {
  const session = await auth();
  if (!session) {
    redirect('/login?redirect=/me');
  }

  return (
    <div className="space-y-8">
      <header className="card flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
        {/* TODO: 구현 — next/image 아바타 */}
        <div
          aria-hidden="true"
          className="h-20 w-20 shrink-0 rounded-full bg-brand-200"
        />
        <div className="flex-1 space-y-1">
          <h1 className="text-xl font-bold text-brand-900">
            {session.user?.name ?? '나'}
          </h1>
          <p className="text-sm text-[color:var(--color-ink-600)]">
            하네스 0 · 받은 주접 0 · 🔥 0
          </p>
        </div>
        <Link href="/harnesses/new" className="btn-primary" aria-label="새 하네스 작성">
          + 새로 만들기
        </Link>
      </header>

      {/* 탭 */}
      <nav aria-label="프로필 탭" className="flex gap-4 border-b border-[color:var(--color-ink-300)]">
        <button type="button" className="border-b-2 border-brand-600 px-2 pb-3 font-semibold text-brand-800">
          공개 하네스
        </button>
        <button type="button" className="px-2 pb-3 text-[color:var(--color-ink-600)]">
          초안 (0)
        </button>
        <button type="button" className="px-2 pb-3 text-[color:var(--color-ink-600)]">
          받은 주접
        </button>
      </nav>

      <section
        aria-label="내 하네스 목록"
        className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3"
      >
        {/* TODO: 구현 — API 응답 → HarnessCard + 편집/삭제 액션 */}
        <div className="card col-span-full py-12 text-center text-[color:var(--color-ink-600)]">
          아직 작성한 하네스가 없어요.
        </div>
      </section>
    </div>
  );
}
