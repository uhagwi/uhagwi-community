/**
 * 리액션 게이트웨이 — heart/fire/bow/pinch 4종.
 * 1인 1harness 1type 1회 (UNIQUE 제약). 같은 type 재클릭 = 토글로 끄기.
 */
import { getDb } from './index';

export type ReactionType = 'heart' | 'fire' | 'bow' | 'pinch';
export type ReactionCounts = Record<ReactionType, number>;

export const REACTION_TYPES: readonly ReactionType[] = ['heart', 'fire', 'bow', 'pinch'];

export async function toggleReaction(params: {
  harnessId: string;
  userId: string;
  type: ReactionType;
}): Promise<{ active: boolean; counts: ReactionCounts }> {
  const db = getDb();
  // 기존 리액션 존재 여부
  const { data: existing } = await db
    .from('reactions')
    .select('id')
    .eq('harness_id', params.harnessId)
    .eq('user_id', params.userId)
    .eq('type', params.type)
    .maybeSingle();

  let active: boolean;
  if (existing) {
    await db.from('reactions').delete().eq('id', existing.id);
    active = false;
  } else {
    const { error } = await db.from('reactions').insert({
      harness_id: params.harnessId,
      user_id: params.userId,
      type: params.type,
    });
    if (error && error.code !== '23505') throw error; // unique 충돌은 무시 (이미 active)
    active = true;
  }

  const counts = await countReactions(params.harnessId);
  return { active, counts };
}

export async function countReactions(harnessId: string): Promise<ReactionCounts> {
  const db = getDb();
  const { data } = await db
    .from('reactions')
    .select('type')
    .eq('harness_id', harnessId);
  const counts: ReactionCounts = { heart: 0, fire: 0, bow: 0, pinch: 0 };
  for (const r of data ?? []) {
    const t = r.type as ReactionType;
    if (t in counts) counts[t] += 1;
  }
  return counts;
}

export async function getActiveReactions(params: {
  harnessId: string;
  userId: string;
}): Promise<Set<ReactionType>> {
  const db = getDb();
  const { data } = await db
    .from('reactions')
    .select('type')
    .eq('harness_id', params.harnessId)
    .eq('user_id', params.userId);
  const set = new Set<ReactionType>();
  for (const r of data ?? []) {
    set.add(r.type as ReactionType);
  }
  return set;
}
