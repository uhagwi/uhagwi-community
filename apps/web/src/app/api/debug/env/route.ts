/**
 * 임시 진단 엔드포인트 — 환경변수 키 존재 여부만 노출.
 * 값은 절대 노출 안 함. 진단 끝난 뒤 삭제 예정.
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEYS = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DISCORD_BOT_WEBHOOK_SECRET',
  'VERCEL_URL',
  'VERCEL_ENV',
  'NODE_ENV',
] as const;

export function GET() {
  const result: Record<string, { present: boolean; length: number }> = {};
  for (const k of KEYS) {
    const v = process.env[k];
    result[k] = { present: !!v && v.length > 0, length: v?.length ?? 0 };
  }
  return NextResponse.json({
    deployment_commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown',
    env: result,
  });
}
