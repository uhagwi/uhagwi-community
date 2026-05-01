/**
 * NextAuth v5 — Discord OAuth + JWT 세션.
 * jwt/session 콜백에서 Discord 식별자를 토큰·세션에 주입한다.
 * users 행 upsert는 lib/auth-user.ts 에서 lazy 처리(콜백에서 DB 호출 금지).
 */
import NextAuth, { type NextAuthConfig, type NextAuthResult } from 'next-auth';
import Discord from 'next-auth/providers/discord';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
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
        if (p.id) token.discordId = p.id;
        if (p.username) token.username = p.username;
        if (p.global_name) token.globalName = p.global_name;
        if (p.avatar !== undefined) token.avatar = p.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.discordId) session.user.discordId = token.discordId;
      if (token.username) session.user.username = token.username;
      if (token.globalName) session.user.globalName = token.globalName;
      return session;
    },
  },
};

const nextAuth: NextAuthResult = NextAuth(authConfig);
export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
