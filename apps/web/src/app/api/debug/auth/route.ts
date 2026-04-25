/**
 * 임시 진단 — NextAuth init 단계 시뮬레이션. 진단 후 삭제.
 * 절대 secret 값은 노출 안 함.
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const env = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    NEXTAUTH_SECRET_present: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_SECRET_len: process.env.NEXTAUTH_SECRET?.length ?? 0,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? null,
    DISCORD_CLIENT_SECRET_present: !!process.env.DISCORD_CLIENT_SECRET,
    DISCORD_CLIENT_SECRET_len: process.env.DISCORD_CLIENT_SECRET?.length ?? 0,
    AUTH_SECRET_present: !!process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? null,
    AUTH_URL: process.env.AUTH_URL ?? null,
    VERCEL_URL: process.env.VERCEL_URL ?? null,
    VERCEL_ENV: process.env.VERCEL_ENV ?? null,
    NODE_ENV: process.env.NODE_ENV ?? null,
    NODE_VERSION: process.versions.node,
  };

  let importErr: string | null = null;
  let nextAuthVersion: string | null = null;
  try {
    const mod = await import('next-auth/package.json' as string);
    const m = mod as { default?: { version?: string }; version?: string };
    nextAuthVersion = m.default?.version ?? m.version ?? null;
  } catch (e) {
    importErr = e instanceof Error ? e.message : String(e);
  }

  let initErr: string | null = null;
  try {
    const { default: NextAuth } = await import('next-auth');
    const Discord = (await import('next-auth/providers/discord')).default;
    NextAuth({
      trustHost: true,
      secret: process.env.NEXTAUTH_SECRET,
      providers: [
        Discord({
          clientId: process.env.DISCORD_CLIENT_ID,
          clientSecret: process.env.DISCORD_CLIENT_SECRET,
        }),
      ],
    });
  } catch (e) {
    initErr = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  return NextResponse.json({
    env,
    nextAuthVersion,
    importErr,
    initErr,
    deployment_commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
