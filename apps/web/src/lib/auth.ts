/**
 * NextAuth v5 설정 — Discord Provider (MVP 미니멀)
 * Configuration 에러 진단 위해 미니멀 설정으로 시작.
 * 안정화 후 callbacks · pages · adapter 단계적으로 추가.
 */
import NextAuth, { type NextAuthConfig, type NextAuthResult } from 'next-auth';
import Discord from 'next-auth/providers/discord';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  // secret 명시 — 일부 환경에서 자동 감지 실패 케이스 방지
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // 진단용 — 안정화 후 false
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
