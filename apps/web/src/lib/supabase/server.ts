/**
 * Supabase 서버 클라이언트 (React Server Components)
 * 근거: docs/service-dev/02_design/api.md §1-3 (서버 service_role, 클라이언트 anon+RLS)
 *
 * - Server Component 에서 쿠키 기반으로 세션 복원
 * - RLS 통과: NextAuth JWT 의 sub → supabase-auth-helpers 대체용 수동 JWT
 *
 * TODO: 구현
 *   - NextAuth JWT → Supabase JWT 교환 (HS256 서명, `sub`/`role` claim)
 *   - service_role 클라이언트는 별도 factory (getServiceClient) 로 분리
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** 일반 요청용 (anon 키 + 쿠키 기반 세션). RLS 적용. */
export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component 렌더 중에는 set 불가 — middleware 에서 갱신하므로 무시 가능
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // noop
          }
        },
      },
    },
  );
}

/**
 * service_role 클라이언트 — RLS 우회. 서버 전용, 절대 클라이언트 노출 금지.
 * 용도: trending_score 배치, content_hash 검증, admin operation.
 */
export function getSupabaseServiceClient() {
  const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
