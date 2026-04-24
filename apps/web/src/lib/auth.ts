/**
 * NextAuth v5 설정 — Discord Provider + Supabase Adapter
 * 근거: docs/service-dev/02_design/api.md §1-3, §2-1
 *
 * - 세션: JWE 쿠키 (SameSite=Lax, Secure, HttpOnly)
 * - JWT `sub` claim = users.id → Supabase RLS 의 auth.uid()
 * - Discord scope: identify email guilds.join
 *
 * TODO: 구현
 *   - SupabaseAdapter 연결 시 service_role 키로 접근
 *   - callbacks.session → Supabase JWT 서명 추가 (RLS 통과용)
 *   - 사용자 handle 자동 발급 (handle 충돌 시 6자 suffix)
 */
import NextAuth, { type NextAuthConfig } from 'next-auth';
import Discord from 'next-auth/providers/discord';
// import { SupabaseAdapter } from '@auth/supabase-adapter';

export const authConfig: NextAuthConfig = {
  // TODO: adapter 활성화 — DB 마이그레이션 0001 적용 후
  // adapter: SupabaseAdapter({
  //   url: process.env.SUPABASE_URL!,
  //   secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // }),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: 'identify email guilds.join' } },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30일
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // TODO: 구현 — 최초 로그인 시 users upsert (discord_id unique)
      //           handle 미존재 → 발급 · can_post 체크
      if (account && profile) {
        token.discordId = (profile as { id?: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      // TODO: 구현 — session.user.id = users.id 매핑
      //           Supabase RLS용 JWT 서명 (session.supabaseAccessToken)
      if (token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    authorized({ auth, request }) {
      // middleware에서 보호 라우트 게이트로 활용
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ['/me', '/harnesses/new'];
      const pathname = request.nextUrl.pathname;
      if (protectedPaths.some((p) => pathname.startsWith(p))) {
        return isLoggedIn;
      }
      return true;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
