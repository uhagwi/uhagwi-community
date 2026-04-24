/**
 * 로그인 `/login`
 * 근거: docs/service-dev/02_design/ui.md §2-5 · api.md §2-1 Auth
 *
 * Discord OAuth 단일 (MVP). `redirect` 쿼리스트링으로 복귀 URL 보존.
 * TODO: 구현 — NextAuth signIn('discord', { callbackUrl })
 */
import Link from 'next/link';
import { signIn } from '@/lib/auth';

export const metadata = { title: '로그인' };

type SearchParams = { redirect?: string };

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const callbackUrl = searchParams.redirect ?? '/';

  async function doSignIn() {
    'use server';
    await signIn('discord', { redirectTo: callbackUrl });
  }

  return (
    <div className="mx-auto max-w-[420px] space-y-8 text-center">
      <div className="space-y-2">
        <p className="text-5xl" aria-hidden="true">
          🌊
        </p>
        <h1 className="font-display text-3xl font-bold text-brand-900">
          우하귀
        </h1>
        <p className="text-[color:var(--color-ink-600)]">
          하네스 보러 오느라 반가워
        </p>
      </div>

      <form action={doSignIn}>
        <button
          type="submit"
          className="w-full rounded-[10px] bg-[#5865F2] px-5 py-3 font-semibold text-white transition hover:brightness-110"
          aria-label="Discord로 계속하기"
        >
          Discord로 계속하기
        </button>
      </form>

      <p className="text-xs text-[color:var(--color-ink-600)]">
        계속하면{' '}
        <Link href="/terms" className="underline">
          이용약관
        </Link>{' '}
        및{' '}
        <Link href="/privacy" className="underline">
          개인정보처리방침
        </Link>
        에 동의한 것으로 간주해요.
      </p>
    </div>
  );
}
