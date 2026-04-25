/**
 * NextAuth v5 — 최소 설정 (Configuration 500 격리용)
 * pages.signIn / 콜백 모두 제거. 진단 후 단계적 복원.
 */
import NextAuth, { type NextAuthConfig, type NextAuthResult } from 'next-auth';
import Discord from 'next-auth/providers/discord';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
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
};

const nextAuth: NextAuthResult = NextAuth(authConfig);
export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
