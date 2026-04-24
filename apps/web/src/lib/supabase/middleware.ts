/**
 * Supabase 미들웨어용 세션 갱신 헬퍼
 * 근거: docs/service-dev/02_design/api.md §1-3
 *
 * Next.js middleware 에서 호출하여 Supabase 쿠키를 request/response 간 동기화.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // 세션 토큰 자동 갱신 호출 (side-effect)
  // TODO: 구현 — 실패 시 로깅
  await supabase.auth.getUser();

  return response;
}
