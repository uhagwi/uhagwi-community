/**
 * NextAuth v5 설정 — Discord OAuth + users 자동 upsert.
 *
 * 흐름:
 *   1) Discord 로그인 콜백 → jwt callback에서 service_role 로 users 행 upsert
 *   2) token 에 우하귀 users.id (UUID) + handle 굳혀둠
 *   3) session callback이 user.id (= users.id) · handle · display 등 채움
 *   4) 모든 API route 는 NextAuth session 의 user.id 로 author 식별
 *
 * RLS 우회: 모든 DB 접근은 server-side service_role. 클라이언트 직접 supabase 호출 금지.
 */
import NextAuth, { type NextAuthConfig, type NextAuthResult } from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { upsertUserFromDiscord } from '@/lib/db/users';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: 'identify email' } },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // 최초 로그인 또는 Discord 정보 갱신 시 users 테이블 upsert
      if (account && profile) {
        try {
          const user = await upsertUserFromDiscord(profile);
          token.uhagwiUserId = user.id;
          token.discordId = user.discord_id;
          token.handle = user.handle;
          token.displayName = user.display_name;
          token.avatar = user.avatar_url ?? null;
          token.role = user.role;
        } catch (err) {
          console.error('[auth.jwt] users upsert 실패', err);
          // 실패해도 로그인은 성립 — 다음 요청에서 재시도
        }
      }
      return token;
    },
    async session({ session, token }) {
      const u = session.user as {
        id?: string;
        discordId?: string;
        handle?: string;
        displayName?: string;
        image?: string | null;
        role?: string;
      };
      if (typeof token.uhagwiUserId === 'string') u.id = token.uhagwiUserId;
      if (typeof token.discordId === 'string') u.discordId = token.discordId;
      if (typeof token.handle === 'string') u.handle = token.handle;
      if (typeof token.displayName === 'string') u.displayName = token.displayName;
      if (typeof token.avatar === 'string') u.image = token.avatar;
      if (typeof token.role === 'string') u.role = token.role;
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ['/me', '/harnesses/new'];
      const pathname = request.nextUrl.pathname;
      if (protectedPaths.some((p) => pathname.startsWith(p))) return isLoggedIn;
      return true;
    },
  },
};

const nextAuth: NextAuthResult = NextAuth(authConfig);
export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
