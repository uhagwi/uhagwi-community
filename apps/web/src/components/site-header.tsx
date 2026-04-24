/**
 * SiteHeader — 전역 상단 네비 (56px sticky)
 * 근거: docs/service-dev/02_design/ui.md §2-1 헤더
 *
 * 데스크탑: 로고 · 갤러리 · 공고 · [로그인/내 프로필]
 * 모바일: 로고 · [햄버거/로그인 버튼]
 */
import Link from 'next/link';
import { auth } from '@/lib/auth';

export async function SiteHeader() {
  const session = await auth();

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 h-14 border-b border-[color:var(--color-ink-300)]/60 bg-cream-50/95 backdrop-blur"
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold text-brand-900"
          aria-label="우하귀 홈"
        >
          <span aria-hidden="true">🌊</span>
          <span>우하귀</span>
        </Link>

        <nav aria-label="주요 네비게이션" className="hidden items-center gap-6 md:flex">
          <Link href="/harnesses" className="text-sm text-[color:var(--color-ink-900)] hover:text-brand-700">
            갤러리
          </Link>
          <Link href="/about" className="text-sm text-[color:var(--color-ink-900)] hover:text-brand-700">
            하네스란?
          </Link>
          <Link href="/join" className="text-sm text-[color:var(--color-ink-900)] hover:text-brand-700">
            Discord
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <Link href="/me" className="text-sm font-semibold text-brand-700">
              내 하네스
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-brand-700">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
