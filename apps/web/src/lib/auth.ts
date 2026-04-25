/**
 * NextAuth v5 — Discord Provider (jwt callback에서 DB 호출 금지)
 *
 * 정책: 로그인 흐름은 절대 DB에 의존시키지 않는다.
 *   1) jwt callback은 토큰에 Discord 식별자만 굳혀둠 (네트워크/DB 호출 X)
 *   2) users 테이블 upsert는 첫 인증 필요 API 호출 시 lazy 실행 (lib/auth-user.ts)
 *   3) 결과: DB 일시 장애에도 로그인이 깨지지 않음 (Configuration 500 방지)
 */
import NextAuth, { type NextAuthConfig, type NextAuthResult } from 'next-auth';
import Discord from 'next-auth/providers/discord';

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
    maxAge: 60 * 60 * 24 * 30, // 30일
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
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
        if (p.avatar && p.id) {
          token.avatar = `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png`;
        }
      }
      return token;
    },
    async session({ session, token }) {
      const u = session.user as {
        id?: string;
        discordId?: string;
        username?: string;
        globalName?: string;
        image?: string | null;
      };
      // 주의: 여기서는 Discord ID만 노출 — Supabase users.id 는 lib/auth-user 에서 lazy 조회
      if (typeof token.discordId === 'string') u.discordId = token.discordId;
      if (typeof token.username === 'string') u.username = token.username;
      if (typeof token.globalName === 'string') u.globalName = token.globalName;
      if (typeof token.avatar === 'string') u.image = token.avatar;
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
