/**
 * 내 프로필 `/me` — 본인 컬렉션 + 게시 (인증 필수)
 * 근거: docs/service-dev/02_design/ui.md §2-6
 *
 * 구성: 헤더(아바타·이름·통계) + 탭(컬렉션·게시물) + MyCollection 클라이언트 컴포넌트
 * 후속: 게시물 탭은 Supabase posts 조회 연결, 받은 주접·통계 누적은 W2 단계.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { MyCollection } from './_components/MyCollection';

export const metadata = { title: '내 하네스' };

export default async function MePage() {
  const session = await auth();
  if (!session) {
    redirect('/login?redirect=/me');
  }

  return (
    <div className="space-y-8">
      <header className="card flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
        <div aria-hidden="true" className="h-20 w-20 shrink-0 rounded-full bg-brand-200" />
        <div className="flex-1 space-y-1">
          <h1 className="text-xl font-bold text-brand-900">{session.user?.name ?? '나'}</h1>
          <p className="text-sm text-[color:var(--color-ink-600)]">
            컬렉션은 localStorage 기반 — 게시·받은 주접 누적은 곧 합류
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/gacha" className="btn-ghost" aria-label="가챠 뽑으러 가기">
            🎴 가챠
          </Link>
          <Link href="/harnesses/new" className="btn-primary" aria-label="새 하네스 작성">
            + 새로 만들기
          </Link>
        </div>
      </header>

      <section aria-label="내 컬렉션" className="space-y-3">
        <h2 className="text-lg font-bold text-brand-900">📦 내 컬렉션</h2>
        <MyCollection />
      </section>

      <section aria-label="내 게시물" className="space-y-3">
        <h2 className="text-lg font-bold text-brand-900">📤 내가 게시한 하네스</h2>
        <div className="card py-12 text-center text-sm text-[color:var(--color-ink-600)]">
          게시물 조회는 곧 연결됩니다 (Supabase posts).
          <br />
          지금은 Lab에서 키운 creature를 게시하는 흐름만 가동 중입니다.
        </div>
      </section>
    </div>
  );
}
