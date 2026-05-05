/**
 * 로그인 `/login` — Discord + Google (사업모델 #9 1년차 2-프로바이더).
 * 근거: docs/service-dev/02_design/ui.md §2-5 · api.md §2-1 Auth · CLAUDE.md §사업모델 #9
 *
 * Kakao·Naver는 한국 정식 출시 직전 박음 (Naver는 검수 시간 필요).
 * 보안: open redirect 방어 — same-origin 상대경로만 허용.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth, signIn } from '@/lib/auth';

export const metadata = { title: '로그인' };

type SearchParams = { redirect?: string };

function safeCallback(raw: string | undefined): string {
  if (!raw) return '/';
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//')) return '/';
  return raw;
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const callbackUrl = safeCallback(searchParams.redirect);

  const session = await auth();
  if (session?.user?.discordId || session?.user?.googleId) {
    redirect(callbackUrl);
  }

  async function doDiscord() {
    'use server';
    await signIn('discord', { redirectTo: callbackUrl });
  }
  async function doGoogle() {
    'use server';
    await signIn('google', { redirectTo: callbackUrl });
  }

  return (
    <div className="mx-auto max-w-[420px] space-y-8 text-center">
      <div className="space-y-2">
        <p className="text-5xl" aria-hidden="true">🌊</p>
        <h1 className="font-display text-3xl font-bold text-brand-900">우하귀</h1>
        <p className="text-[color:var(--color-ink-600)]">하네스 보러 오느라 반가워</p>
      </div>

      <div className="space-y-3">
        <form action={doGoogle}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-[color:var(--color-ink-300)] bg-white px-5 py-3 font-semibold text-[color:var(--color-ink-800)] transition hover:bg-[#f8f9fa]"
            aria-label="Google로 계속하기"
          >
            <GoogleIcon />
            Google로 계속하기
          </button>
        </form>
        <form action={doDiscord}>
          <button
            type="submit"
            className="w-full rounded-[10px] bg-[#5865F2] px-5 py-3 font-semibold text-white transition hover:brightness-110"
            aria-label="Discord로 계속하기"
          >
            Discord로 계속하기
          </button>
        </form>
        <p className="text-[11px] text-[color:var(--color-ink-600)]">
          Kakao·Naver 로그인은 한국 정식 출시와 함께 박힙니다.
        </p>
      </div>

      <p className="text-xs text-[color:var(--color-ink-600)]">
        계속하면{' '}
        <Link href="/terms" className="underline">이용약관</Link>{' '}
        및{' '}
        <Link href="/privacy" className="underline">개인정보처리방침</Link>
        에 동의한 것으로 간주해요.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
