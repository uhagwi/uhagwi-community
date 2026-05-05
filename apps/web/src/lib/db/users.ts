/**
 * users 테이블 게이트웨이 — Discord·Google OAuth 콜백에서 호출.
 * 2026-05-06 Google OAuth 추가 (마이그레이션 0105_google_oauth.sql 필요).
 */
import { getDb, type DbUser } from './index';

type DiscordProfileLite = {
  id?: string | null;
  username?: string | null;
  global_name?: string | null;
  avatar?: string | null;
  email?: string | null;
};

type GoogleProfileLite = {
  sub?: string | null;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

/** Discord profile 로 users 행 upsert. */
export async function upsertUserFromDiscord(profile: DiscordProfileLite): Promise<DbUser> {
  if (!profile.id) throw new Error('Discord profile.id 누락');

  const db = getDb();
  const displayName = profile.global_name ?? profile.username ?? `user_${profile.id.slice(-6)}`;
  const avatarUrl = profile.avatar
    ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
    : null;

  const { data: existing, error: selErr } = await db
    .from('users')
    .select('*')
    .eq('discord_id', profile.id)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    return await updateExisting(existing as DbUser, displayName, avatarUrl);
  }

  return await insertNew({
    discord_id: profile.id,
    google_id: null,
    baseHandleHint: profile.username ?? `user${profile.id.slice(-6)}`,
    displayName,
    avatarUrl,
  });
}

/** Google profile 로 users 행 upsert. */
export async function upsertUserFromGoogle(profile: GoogleProfileLite): Promise<DbUser> {
  if (!profile.sub) throw new Error('Google profile.sub 누락');

  const db = getDb();
  const displayName = profile.name ?? `user_${profile.sub.slice(-6)}`;
  const avatarUrl = profile.picture ?? null;

  const { data: existing, error: selErr } = await db
    .from('users')
    .select('*')
    .eq('google_id', profile.sub)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    return await updateExisting(existing as DbUser, displayName, avatarUrl);
  }

  // 이메일 기반 핸들 (Google은 username 없음)
  const baseHandleHint = profile.email?.split('@')[0] ?? `user${profile.sub.slice(-6)}`;
  return await insertNew({
    discord_id: null,
    google_id: profile.sub,
    baseHandleHint,
    displayName,
    avatarUrl,
  });
}

async function updateExisting(
  existing: DbUser,
  displayName: string,
  avatarUrl: string | null,
): Promise<DbUser> {
  const db = getDb();
  const patch: Record<string, unknown> = {};
  if (existing.display_name !== displayName) patch.display_name = displayName;
  if ((existing.avatar_url ?? null) !== avatarUrl) patch.avatar_url = avatarUrl;
  if (Object.keys(patch).length === 0) return existing;
  const { data: updated, error: updErr } = await db
    .from('users')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', existing.id)
    .select('*')
    .single();
  if (updErr) throw updErr;
  return updated as DbUser;
}

async function insertNew(args: {
  discord_id: string | null;
  google_id: string | null;
  baseHandleHint: string;
  displayName: string;
  avatarUrl: string | null;
}): Promise<DbUser> {
  const db = getDb();
  const baseHandle = sanitizeHandle(args.baseHandleHint);
  let handle = baseHandle;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: ins, error: insErr } = await db
      .from('users')
      .insert({
        discord_id: args.discord_id,
        google_id: args.google_id,
        handle,
        display_name: args.displayName,
        avatar_url: args.avatarUrl,
      })
      .select('*')
      .single();
    if (!insErr && ins) return ins as DbUser;
    if (insErr && insErr.code !== '23505') throw insErr;
    handle = `${baseHandle}_${randomSuffix()}`.slice(0, 20);
  }
  throw new Error('users handle 발급 실패 — 5회 충돌');
}

function sanitizeHandle(raw: string): string {
  const s = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 14);
  return s.length >= 3 ? s : `user${randomSuffix()}`;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}
