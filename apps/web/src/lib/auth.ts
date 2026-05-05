/**
 * NextAuth v5 — Discord + Google OAuth + JWT 세션.
 * 정책 (CLAUDE.md §사업모델 #9): 1년차는 Discord(개발자) + Google(일반) 2개. Kakao·Naver는 한국 정식 출시 직전 박음.
 *
 * jwt/session 콜백에서 provider별 식별자를 토큰·세션에 주입.
 * users 행 upsert는 lib/auth-user.ts 에서 lazy 처리(콜백에서 DB 호출 금지).
 */
import NextAuth, { type NextAuthConfig, type NextAuthResult } from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    async jwt({ token, profile, account }) {
      if (account?.provider === 'discord' && profile) {
        const p = profile as {
          id?: string;
          username?: string;
          global_name?: string | null;
          avatar?: string | null;
        };
        token.provider = 'discord';
        if (p.id) token.discordId = p.id;
        if (p.username) token.username = p.username;
        if (p.global_name) token.globalName = p.global_name;
        if (p.avatar !== undefined) token.avatar = p.avatar;
      }
      if (account?.provider === 'google' && profile) {
        const p = profile as {
          sub?: string;
          name?: string;
          email?: string;
          picture?: string;
        };
        token.provider = 'google';
        if (p.sub) token.googleId = p.sub;
        if (p.name) token.globalName = p.name;
        if (p.email) token.email = p.email;
        if (p.picture) token.picture = p.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.provider) session.user.provider = token.provider;
      if (token.discordId) session.user.discordId = token.discordId;
      if (token.googleId) session.user.googleId = token.googleId;
      if (token.username) session.user.username = token.username;
      if (token.globalName) session.user.globalName = token.globalName;
      if (token.email) session.user.email = token.email;
      if (token.picture) session.user.image = token.picture;
      return session;
    },
  },
};

const nextAuth: NextAuthResult = NextAuth(authConfig);
export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
