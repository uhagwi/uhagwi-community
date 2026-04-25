/**
 * users 테이블 게이트웨이 — Discord OAuth 콜백에서 호출.
 */
import { getDb, type DbUser } from './index';

type DiscordProfileLite = {
  id?: string | null;
  username?: string | null;
  global_name?: string | null;
  avatar?: string | null;
  email?: string | null;
};

/**
 * Discord OAuth profile 로 users 행 upsert.
 * - discord_id 충돌 시 기존 사용자 정보 업데이트(display_name·avatar)
 * - 신규면 handle 자동 발급 (username + 6자 suffix가 충돌 시)
 */
export async function upsertUserFromDiscord(profile: DiscordProfileLite): Promise<DbUser> {
  if (!profile.id) throw new Error('Discord profile.id 누락');

  const db = getDb();
  const displayName = profile.global_name ?? profile.username ?? `user_${profile.id.slice(-6)}`;
  const avatarUrl = profile.avatar
    ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
    : null;

  // 1) 기존 사용자 조회
  const { data: existing, error: selErr } = await db
    .from('users')
    .select('*')
    .eq('discord_id', profile.id)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    // 변경된 정보만 업데이트
    const patch: Record<string, unknown> = {};
    if (existing.display_name !== displayName) patch.display_name = displayName;
    if ((existing.avatar_url ?? null) !== avatarUrl) patch.avatar_url = avatarUrl;
    if (Object.keys(patch).length === 0) return existing as DbUser;
    const { data: updated, error: updErr } = await db
      .from('users')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (updErr) throw updErr;
    return updated as DbUser;
  }

  // 2) 신규 — handle 자동 발급 (충돌 시 6자 suffix)
  const baseHandle = sanitizeHandle(profile.username ?? `user${profile.id.slice(-6)}`);
  let handle = baseHandle;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: ins, error: insErr } = await db
      .from('users')
      .insert({
        discord_id: profile.id,
        handle,
        display_name: displayName,
        avatar_url: avatarUrl,
      })
      .select('*')
      .single();
    if (!insErr && ins) return ins as DbUser;
    if (insErr && insErr.code !== '23505') throw insErr; // 23505 = unique violation
    // handle 충돌이면 6자 suffix 붙여 재시도
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
