/**
 * 루트 레이아웃
 * 근거: docs/service-dev/02_design/ui.md §6 접근성 (lang="ko") · §3-2 Pretendard
 */
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: {
    default: '우하귀 — 우리 하네스 귀엽지',
    template: '%s · 우하귀',
  },
  description:
    '내가 만든 AI 하네스를 자랑하고 주접 받는 커뮤니티. 꽃집·약국·교사·학생 — 누구나 자기 하네스를 소개하세요.',
  keywords: ['AI 하네스', 'Claude', '하네스 커뮤니티', '우하귀', '주접', 'AI 엔지니어링'],
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: '우하귀 — 우리 하네스 귀엽지',
    description: '내 AI 하네스 자랑하고 주접 받기',
    locale: 'ko_KR',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#5B3FA8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Pretendard Variable 웹폰트 — CDN (W3에 자가호스팅 전환) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen bg-cream-50 text-[color:var(--color-ink-900)] antialiased">
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-6 md:py-12">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
