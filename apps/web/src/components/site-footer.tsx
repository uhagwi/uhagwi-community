/**
 * SiteFooter — 전역 하단 푸터
 * 근거: docs/service-dev/02_design/ui.md §2-1 (공고·팀·문의·SNS)
 *
 * 구성: 좌(브랜드) · 중(링크 3열: 제품/커뮤니티/법적) · 우(GitHub·이메일) · 하단 공고 크레딧
 */
import Link from 'next/link';
import Image from 'next/image';

const SECTIONS = [
  {
    title: '제품',
    links: [
      { href: '/harnesses', label: '하네스 갤러리' },
      { href: '/about', label: 'About' },
      { href: '/join', label: 'Discord 서버' },
    ],
  },
  {
    title: '커뮤니티',
    links: [
      { href: '/join', label: '우하귀 서버 입장' },
      { href: 'https://github.com/uhagwi/uhagwi-community/issues', label: '제안·이슈', external: true },
      { href: 'https://github.com/uhagwi/uhagwi-community/discussions', label: '토론', external: true },
    ],
  },
  {
    title: '법적',
    links: [
      { href: 'https://github.com/uhagwi/uhagwi-community/blob/main/LICENSE', label: 'MIT LICENSE', external: true },
      { href: '/privacy', label: '개인정보 처리방침' },
      { href: '/terms', label: '이용약관' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      className="mt-20 border-t border-[color:var(--color-ink-300)]/50 bg-cream-100/40"
    >
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-[1.2fr_2fr_1fr] md:gap-8 md:px-6">
        {/* 좌: 브랜드 블록 */}
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="우하귀 홈">
            <Image src="/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="text-display text-lg text-brand-900">우하귀</span>
          </Link>
          <p className="text-sm leading-relaxed text-[color:var(--color-ink-600)]">
            우리 하네스 귀엽지.
            <br />
            AI를 업무에 엮는 사람들이 서로 자랑하고 배우는 커뮤니티.
          </p>
          <p className="text-xs text-[color:var(--color-ink-600)]">
            © 2026 우하귀 · MIT License
          </p>
        </div>

        {/* 중: 링크 3열 */}
        <nav aria-label="푸터 링크" className="grid grid-cols-3 gap-6 text-sm">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="font-semibold text-brand-900">{section.title}</p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[color:var(--color-ink-600)] transition hover:text-brand-700"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[color:var(--color-ink-600)] transition hover:text-brand-700"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* 우: 외부 링크 */}
        <div className="space-y-3 text-sm">
          <p className="font-semibold text-brand-900">연결</p>
          <ul className="space-y-2">
            <li>
              <a
                href="https://github.com/uhagwi/uhagwi-community"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[color:var(--color-ink-600)] transition hover:text-brand-700"
                aria-label="우하귀 GitHub 저장소"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.91.57.1.78-.25.78-.55v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.26 3.38.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18.92-.26 1.9-.39 2.89-.39s1.97.13 2.89.39c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.12 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.79.55 4.56-1.53 7.85-5.83 7.85-10.91C23.5 5.73 18.27.5 12 .5z" />
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@uhagwi.com"
                className="inline-flex items-center gap-2 text-[color:var(--color-ink-600)] transition hover:text-brand-700"
                aria-label="우하귀 이메일 문의"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                hello@uhagwi.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* 하단 크레딧 */}
      <div className="border-t border-[color:var(--color-ink-300)]/40">
        <p className="mx-auto max-w-[1200px] px-4 py-4 text-center text-xs text-[color:var(--color-ink-600)] md:px-6 md:text-left">
          중소벤처기업부 「모두의 창업 프로젝트 2026」 응모작 · 운영기관 유닉(전북 AC)
        </p>
      </div>
    </footer>
  );
}
