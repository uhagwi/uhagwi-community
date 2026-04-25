/**
 * harnesses 게이트웨이 — 갤러리·상세·작성 모두 여기로 통과.
 *
 * 조인 패턴:
 *   posts (slug·status·view·published_at) ← harnesses ← (reactions·comments·tags)
 * MVP에서는 한 번의 fetch + 후속 집계 쿼리로 단순화 (N+1 허용).
 */
import { getDb } from './index';

export type HarnessFeedRow = {
  id: string;
  slug: string;
  title: string;
  one_liner: string;
  persona_name: string | null;
  persona_job: string | null;
  thumbnail_url: string | null;
  thumbnail_emoji: string | null;
  category: string | null;
  components: string[];
  view_count: number;
  avg_juzzep: number | null;
  reaction_counts: { heart: number; fire: number; bow: number; pinch: number };
  author: { id: string; handle: string; display_name: string; avatar_url: string | null } | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
};

export type HarnessDetailRow = HarnessFeedRow & {
  body_md: string | null;
  purpose: string;
};

const POSTS_SELECT =
  'id,slug,status,visibility,view_count,published_at,created_at,author:users(id,handle,display_name,avatar_url)';
const REACTION_TYPES = ['heart', 'fire', 'bow', 'pinch'] as const;

type PostJoin = {
  id: string;
  slug: string;
  status: string;
  visibility: string;
  view_count: number;
  published_at: string | null;
  created_at: string;
  author?: {
    id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
};

type HarnessRow = {
  id: string;
  post_id: string;
  title: string;
  one_liner: string;
  purpose: string;
  persona_name: string | null;
  persona_job: string | null;
  components: string[] | null;
  body_md: string | null;
  thumbnail_url: string | null;
  thumbnail_emoji: string | null;
  category: string | null;
  view_count: number;
  avg_juzzep: number | null;
  created_at: string;
  posts?: PostJoin | null;
};

async function attachReactionsAndTags(rows: HarnessRow[]): Promise<HarnessFeedRow[]> {
  if (rows.length === 0) return [];
  const db = getDb();
  const harnessIds = rows.map((r) => r.id);

  // reactions 집계 (1쿼리 로 type별 count)
  const { data: rx } = await db
    .from('reactions')
    .select('harness_id,type')
    .in('harness_id', harnessIds);
  const counts: Record<string, { heart: number; fire: number; bow: number; pinch: number }> = {};
  for (const id of harnessIds) counts[id] = { heart: 0, fire: 0, bow: 0, pinch: 0 };
  for (const r of rx ?? []) {
    const c = counts[r.harness_id as string];
    const t = r.type as string;
    if (c && (REACTION_TYPES as readonly string[]).includes(t)) {
      c[t as 'heart' | 'fire' | 'bow' | 'pinch'] += 1;
    }
  }

  // tags 집계 (조인)
  const { data: tagRows } = await db
    .from('harness_tags')
    .select('harness_id,tags(slug)')
    .in('harness_id', harnessIds);
  const tagMap: Record<string, string[]> = {};
  for (const id of harnessIds) tagMap[id] = [];
  for (const tr of tagRows ?? []) {
    const tags = tr.tags as { slug: string } | { slug: string }[] | null;
    const slug = Array.isArray(tags) ? tags[0]?.slug : tags?.slug;
    if (slug && tagMap[tr.harness_id as string]) tagMap[tr.harness_id as string]!.push(slug);
  }

  return rows.map((r) => {
    const post = r.posts ?? null;
    return {
      id: r.id,
      slug: post?.slug ?? '',
      title: r.title,
      one_liner: r.one_liner,
      persona_name: r.persona_name,
      persona_job: r.persona_job,
      thumbnail_url: r.thumbnail_url,
      thumbnail_emoji: r.thumbnail_emoji,
      category: r.category,
      components: r.components ?? [],
      view_count: post?.view_count ?? r.view_count ?? 0,
      avg_juzzep: r.avg_juzzep,
      reaction_counts: counts[r.id] ?? { heart: 0, fire: 0, bow: 0, pinch: 0 },
      author: post?.author ?? null,
      tags: tagMap[r.id] ?? [],
      published_at: post?.published_at ?? null,
      created_at: r.created_at ?? post?.created_at ?? new Date().toISOString(),
    };
  });
}

/** 갤러리용 — published & public 만, 최신순 */
export async function listPublishedHarnesses(limit = 24): Promise<HarnessFeedRow[]> {
  const db = getDb();
  const { data, error } = await db
    .from('harnesses')
    .select(`*, posts!inner(${POSTS_SELECT})`)
    .eq('posts.status', 'published')
    .eq('posts.visibility', 'public')
    .order('created_at', { foreignTable: 'posts', ascending: false })
    .limit(limit);
  if (error) throw error;
  return attachReactionsAndTags((data ?? []) as unknown as HarnessRow[]);
}

/** 상세 — slug 로 단건 fetch */
export async function getHarnessBySlug(slug: string): Promise<HarnessDetailRow | null> {
  const db = getDb();
  const { data, error } = await db
    .from('harnesses')
    .select(`*, posts!inner(${POSTS_SELECT})`)
    .eq('posts.slug', slug)
    .eq('posts.status', 'published')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [feed] = await attachReactionsAndTags([data as unknown as HarnessRow]);
  if (!feed) return null;
  const harness = data as unknown as HarnessRow;
  return { ...feed, body_md: harness.body_md, purpose: harness.purpose };
}

/** author_id 로 본인 작성 하네스 (마이페이지) */
export async function listHarnessesByAuthor(authorId: string): Promise<HarnessFeedRow[]> {
  const db = getDb();
  const { data, error } = await db
    .from('harnesses')
    .select(`*, posts!inner(${POSTS_SELECT})`)
    .eq('posts.author_id', authorId)
    .order('created_at', { foreignTable: 'posts', ascending: false });
  if (error) throw error;
  return attachReactionsAndTags((data ?? []) as unknown as HarnessRow[]);
}
