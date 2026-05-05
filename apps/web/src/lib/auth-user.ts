/**
 * 인증된 사용자의 Supabase users.id 조회 — lazy upsert.
 * Discord·Google 두 프로바이더 모두 지원.
 *
 * - jwt callback에서 DB 호출하지 않으므로, 실제 DB에 의존하는 API/Server Component 가
 *   필요할 때 이 함수로 users 행 보장.
 * - 캐시: 5분 TTL 인메모리 (서버리스 인스턴스 별로 독립)
 */
import { auth } from '@/lib/auth';
import { upsertUserFromDiscord, upsertUserFromGoogle } from '@/lib/db/users';
import type { DbUser } from '@/lib/db';

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { user: DbUser; expires: number }>();

/**
 * 현재 세션의 우하귀 user 정보. 미인증이면 null.
 * users 행이 아직 없으면 upsert로 생성.
 */
export async function getCurrentUhagwiUser(): Promise<DbUser | null> {
  const session = await auth();
  const u = session?.user;
  if (!u) return null;

  const cacheKey = u.discordId
    ? `discord:${u.discordId}`
    : u.googleId
      ? `google:${u.googleId}`
      : null;
  if (!cacheKey) return null;

  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.user;

  try {
    let user: DbUser;
    if (u.discordId) {
      user = await upsertUserFromDiscord({
        id: u.discordId,
        username: u.username ?? null,
        global_name: u.globalName ?? null,
        avatar: extractAvatarHash(u.image ?? null, u.discordId),
      });
    } else if (u.googleId) {
      user = await upsertUserFromGoogle({
        sub: u.googleId,
        name: u.globalName ?? u.name ?? null,
        email: u.email ?? null,
        picture: u.image ?? null,
      });
    } else {
      return null;
    }
    cache.set(cacheKey, { user, expires: Date.now() + CACHE_TTL_MS });
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
