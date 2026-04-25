/**
 * SiteHeader — 전역 상단 네비 (sticky top-0, backdrop-blur)
 * 근거: docs/service-dev/02_design/ui.md §2-1 헤더
 *
 * 데스크탑: 로고 · 홈 · 갤러리 · About · Discord · [로그인/내 프로필]
 * 모바일 : 로고 · [로그인] · [햄버거(details/summary)]
 *
 * JS 프레임워크 없이 HTML 기본 동작(details/summary)으로 햄버거 구현 →
 * 서버 컴포넌트 유지, 번들 크기 추가 없음.
 */
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/', label: '홈' },
  { href: '/harnesses', label: '갤러리' },
  { href: '/about', label: 'About' },
  { href: '/join', label: 'Discord' },
] as const;

export async function SiteHeader() {
  const session = await auth();

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 border-b border-[color:var(--color-ink-300)]/50 bg-cream-50/85 backdrop-blur supports-[backdrop-filter]:bg-cream-50/70"
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 md:h-16 md:px-6">
        {/* 좌: 로고 */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-brand-900"
          aria-label="우하귀 홈으로"
        >
          <Image
            src="/logo-mark.svg"
            alt=""
            width={32}
            height={32}
            priority
            className="h-7 w-7 md:h-8 md:w-8"
          />
          <span className="text-display text-lg md:text-xl">우하귀</span>
        </Link>

        {/* 중: 데스크탑 네비 */}
        <nav
          aria-label="주요 네비게이션"
          className="hidden flex-1 items-center justify-center gap-6 md:flex lg:gap-8"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[color:var(--color-ink-600)] transition-colors hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 우: 인증 + 모바일 햄버거 */}
        <div className="flex items-center gap-2">
          {session ? (
            <Link
              href="/me"
              className="hidden text-sm font-semibold text-brand-700 hover:text-brand-800 md:inline-flex"
            >
              내 하네스
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden items-center rounded-[10px] bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 md:inline-flex"
            >
              로그인
            </Link>
          )}

          {/* 모바일 햄버거 (details/summary — JS 불필요) */}
          <details className="relative md:hidden">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg text-brand-900 transition hover:bg-brand-50 [&::-webkit-details-marker]:hidden"
              aria-label="메뉴 열기"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <nav
              aria-label="모바일 네비게이션"
              className="absolute right-0 top-12 z-50 flex w-56 flex-col gap-1 rounded-xl border border-[color:var(--color-ink-300)]/50 bg-white p-2 shadow-float"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm text-[color:var(--color-ink-900)] transition hover:bg-brand-50 hover:text-brand-700"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-1 border-t border-[color:var(--color-ink-300)]/50 pt-1">
                {session ? (
                  <Link
                    href="/me"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    내 하네스
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="block rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    로그인
                  </Link>
                )}
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
