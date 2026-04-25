/**
 * 인증된 사용자의 Supabase users.id 조회 — lazy upsert.
 *
 * - jwt callback에서 DB 호출하지 않으므로, 실제 DB에 의존하는 API/Server Component 가
 *   필요할 때 이 함수로 users 행 보장.
 * - 캐시: 5분 TTL 인메모리 (서버리스 인스턴스 별로 독립)
 */
import { auth } from '@/lib/auth';
import { upsertUserFromDiscord } from '@/lib/db/users';
import type { DbUser } from '@/lib/db';

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { user: DbUser; expires: number }>();

/**
 * 현재 세션의 우하귀 user 정보. 미인증이면 null.
 * users 행이 아직 없으면 upsert로 생성.
 */
export async function getCurrentUhagwiUser(): Promise<DbUser | null> {
  const session = await auth();
  const u = session?.user as
    | { discordId?: string; username?: string; globalName?: string; image?: string | null }
    | undefined;
  if (!u?.discordId) return null;

  const hit = cache.get(u.discordId);
  if (hit && hit.expires > Date.now()) return hit.user;

  try {
    const user = await upsertUserFromDiscord({
      id: u.discordId,
      username: u.username ?? null,
      global_name: u.globalName ?? null,
      // image URL → avatar hash 추출은 생략 (display_name·avatar_url 만 갱신)
      avatar: extractAvatarHash(u.image ?? null, u.discordId),
    });
    cache.set(u.discordId, { user, expires: Date.now() + CACHE_TTL_MS });
    return user;
  } catch (err) {
    console.error('[auth-user] upsert 실패', err);
    return null;
  }
}

/** users.id 만 필요한 경우의 짧은 헬퍼. 미인증/실패 시 null. */
export async function getCurrentUserId(): Promise<string | null> {
  const u = await getCurrentUhagwiUser();
  return u?.id ?? null;
}

/** Discord avatar URL 에서 해시 추출 (캐시 무효화용) */
function extractAvatarHash(imageUrl: string | null, discordId: string): string | null {
  if (!imageUrl) return null;
  const m = imageUrl.match(new RegExp(`avatars/${discordId}/([^.]+)\\.`));
  return m ? (m[1] ?? null) : null;
}
