/**
 * NextAuth 세션·JWT 타입 확장 — 우하귀 도메인 필드.
 */
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      // session 자체에는 Discord 식별자만 들어감.
      // 우하귀 users.id 가 필요한 경우 lib/auth-user.ts 의 getCurrentUserId() 로 lazy 조회.
      discordId?: string;
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
    discordId?: string;
    username?: string;
    globalName?: string;
    avatar?: string | null;
  }
}
