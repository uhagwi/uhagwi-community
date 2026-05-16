/**
 * Showcase 시드 — 범용 하네스 카탈로그 builder.
 *
 * RAW_SEEDS(showcase-data.ts)를 HarnessDetailRow로 확장한다.
 * Supabase 미연결·0건일 때 갤러리/상세 fallback (DB row가 들어오면 자동 후순위).
 * 정책: 특정 기관·인물·지역·제품명 비노출 — intimate-context 가드와 동일 방향.
 */
import type { HarnessDetailRow, HarnessFeedRow } from '@/lib/db/harnesses';
import { RAW_SEEDS, type RawSeed } from './showcase-data';

const AUTHOR = {
  id: 'seed-demo',
  handle: 'demo',
  display_name: '우하귀 데모',
  avatar_url: null,
} as const;

function expand(raw: RawSeed): HarnessDetailRow {
  const iso = `${raw.d}T09:00:00+09:00`;
  const [heart, fire, bow, pinch] = raw.r;
  return {
    id: `seed-${raw.s}`,
    slug: raw.s,
    title: raw.t,
    one_liner: raw.o,
    purpose: raw.pp,
    persona_name: raw.pn,
    persona_job: raw.pj,
    thumbnail_url: null,
    thumbnail_emoji: raw.e,
    category: raw.c,
    components: raw.k,
    view_count: raw.v,
    avg_juzzep: raw.j,
    reaction_counts: { heart, fire, bow, pinch },
    author: AUTHOR,
    tags: raw.g,
    published_at: iso,
    created_at: iso,
    body_md: `## 한 줄 그림\n\n\`${raw.fig}\`\n\n## 일상 언어로\n\n${raw.pl}`,
  };
}

const SHOWCASE: readonly HarnessDetailRow[] = RAW_SEEDS.map(expand);

/** 갤러리 fallback — DB 0건일 때 사용 (최신 발행순) */
export function getSeedFeedRows(): HarnessFeedRow[] {
  return [...SHOWCASE]
    .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
    .map(({ body_md: _b, purpose: _p, ...feed }) => feed);
}

/** 상세 fallback — DB miss 시 slug 조회 */
export function findSeedBySlug(slug: string): HarnessDetailRow | null {
  return SHOWCASE.find((s) => s.slug === slug) ?? null;
}
