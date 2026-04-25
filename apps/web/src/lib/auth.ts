/**
 * NextAuth v5 설정 — Discord Provider + Supabase Adapter (Phase 2 활성화 예정)
 * 근거: docs/service-dev/02_design/api.md §1-3, §2-1
 *
 * - 세션: JWE 쿠키 (SameSite=Lax, Secure, HttpOnly)
 * - JWT `sub` claim = users.id → Supabase RLS 의 auth.uid()
 * - Discord scope: identify email
 *
 * TODO Phase 2:
 *   - SupabaseAdapter 활성화 (service_role 키)
 *   - callbacks.session → Supabase JWT 서명 추가 (RLS 통과용)
 *   - 사용자 handle 자동 발급 (handle 충돌 시 6자 suffix)
 */
import NextAuth, { type NextAuthConfig, type NextAuthResult } from 'next-auth';
import Discord from 'next-auth/providers/discord';
// import { SupabaseAdapter } from '@auth/supabase-adapter';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  // TODO Phase 2: adapter 활성화
  // adapter: SupabaseAdapter({
  //   url: process.env.SUPABASE_URL!,
  //   secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // }),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: 'identify email' } },
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
      // 최초 로그인 시 Discord 식별자·핸들·아바타를 토큰에 굳혀둠
      if (account && profile) {
        const p = profile as {
          id?: string;
          username?: string;
          global_name?: string;
          avatar?: string;
        };
        if (p.id) token.discordId = p.id;
        if (p.username) token.username = p.username;
        if (p.global_name) token.globalName = p.global_name;
        if (p.avatar) {
          token.avatar = `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png`;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // 세션에 우하귀 도메인 정보 주입 (클라이언트 컴포넌트에서 useSession 으로 사용)
      const user = session.user as {
        id?: string;
        discordId?: string;
        username?: string;
        globalName?: string;
        image?: string | null;
      };
      if (token.sub) user.id = token.sub;
      if (typeof token.discordId === 'string') user.discordId = token.discordId;
      if (typeof token.username === 'string') user.username = token.username;
      if (typeof token.globalName === 'string') user.globalName = token.globalName;
      if (typeof token.avatar === 'string') user.image = token.avatar;
      return session;
    },
    authorized({ auth, request }) {
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

// 모노레포 환경에서 destructure 시 signIn 타입 추론이 @auth/core 내부 경로를 참조하는 문제 회피
const nextAuth: NextAuthResult = NextAuth(authConfig);
export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
