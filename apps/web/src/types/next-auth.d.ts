/**
 * NextAuth 세션·JWT 타입 확장 — 우하귀 도메인 필드.
 */
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string; // = users.id (Supabase UUID)
      discordId?: string;
      handle?: string;
      displayName?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uhagwiUserId?: string;
    discordId?: string;
    handle?: string;
    displayName?: string;
    avatar?: string | null;
    role?: string;
  }
}
