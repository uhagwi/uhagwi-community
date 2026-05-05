/**
 * NextAuth 세션·JWT 타입 확장 — 우하귀 도메인 필드.
 * 2026-05-06 Google OAuth 추가 (Discord + Google 2-프로바이더).
 */
import 'next-auth';
import 'next-auth/jwt';

export type AuthProvider = 'discord' | 'google';

declare module 'next-auth' {
  interface Session {
    user: {
      // 우하귀 users.id 가 필요한 경우 lib/auth-user.ts 의 getCurrentUserId() 로 lazy 조회.
      provider?: AuthProvider;
      discordId?: string;
      googleId?: string;
      username?: string;
      globalName?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    provider?: AuthProvider;
    discordId?: string;
    googleId?: string;
    username?: string;
    globalName?: string;
    avatar?: string | null;
    email?: string | null;
    picture?: string | null;
  }
}
