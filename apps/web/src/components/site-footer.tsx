/**
 * SiteFooter — 전역 하단 푸터
 * 근거: docs/service-dev/02_design/ui.md §2-1 (공고·팀·문의·SNS)
 */
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      className="mt-16 border-t border-[color:var(--color-ink-300)]/60 bg-cream-100/50 py-10"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 text-sm text-[color:var(--color-ink-600)] md:flex-row md:justify-between">
        <div className="space-y-2">
          <p className="font-display text-base text-brand-900">🌊 우하귀</p>
          <p>우리 하네스 귀엽지 — AI 하네스 공유 커뮤니티</p>
        </div>
        <nav aria-label="푸터 링크" className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-brand-700">
            하네스란?
          </Link>
          <Link href="/terms" className="hover:text-brand-700">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:text-brand-700">
            개인정보
          </Link>
          <a
            href="mailto:hello@uhagwi.com"
            className="hover:text-brand-700"
            aria-label="이메일 문의"
          >
            문의
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-[1200px] px-4 text-xs text-[color:var(--color-ink-300)]">
        © 2026 우하귀 — AI 엔지니어링 커뮤니티
      </p>
    </footer>
  );
}
