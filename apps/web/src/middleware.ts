/**
 * Next.js 미들웨어 — 세션 갱신 + 보호 라우트 게이트
 * 근거: docs/service-dev/02_design/api.md §1-3 인증
 *
 * - /me, /harnesses/new 는 인증 필수
 * - Supabase 쿠키 자동 갱신
 * - 정적 자원·이미지 요청은 matcher 에서 제외
 */
import { NextResponse, type NextRequest } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

const PROTECTED_PATHS = ['/me', '/harnesses/new'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Supabase 세션 쿠키 갱신
  const response = await updateSupabaseSession(request);

  // 2) 보호 라우트 체크 — NextAuth 세션 쿠키 존재 여부만 가볍게 확인
  //    (정식 권한 체크는 서버 컴포넌트의 auth() 호출에서 수행)
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const sessionCookie =
      request.cookies.get('authjs.session-token') ??
      request.cookies.get('__Secure-authjs.session-token');
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청에 적용:
     *  - _next/static (정적)
     *  - _next/image (이미지 최적화)
     *  - favicon.ico / 로고 자산
     *  - /api/auth (NextAuth 내부) · /api/webhooks (bot HMAC 자체 검증)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo|api/auth|api/webhooks).*)',
  ],
};
