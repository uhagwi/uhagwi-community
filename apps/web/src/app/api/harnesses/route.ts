/**
 * /api/harnesses — 목록(GET) · 생성(POST)
 * 근거: docs/service-dev/02_design/api.md §2-2
 *
 * NOTE: 설계 정본은 `/api/v1/harness` (단수). 요청서 지시대로 `/api/harnesses` 스캐폴딩.
 *       W1 중 `/api/v1/harness` 로 rewrite 또는 통일 예정.
 *
 * 구현 정책 (POST):
 *   - service_role 다중 INSERT + 부분 실패 시 cleanup (Supabase는 단일 RPC만 트랜잭션 지원)
 *   - slug: util_slugify(title) RPC → 충돌 시 -2..-5 재시도 (5회)
 *   - tags: upsert(slug) 후 harness_tags 다대다 INSERT — 부분 실패 허용 (warning)
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/auth-user';
import {
  problem,
  notImplemented,
  unauthorized,
  badRequest,
  internal,
} from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';
import { getDb } from '@/lib/db/index';

export const runtime = 'nodejs';

/** 하네스 생성 요청 스키마 */
const HarnessCreateSchema = z.object({
  title: z.string().min(2).max(120),
  one_liner: z.string().min(1).max(200),
  persona_name: z.string().max(40).optional().nullable(),
  persona_job: z.string().max(40).optional().nullable(),
  purpose: z.string().min(1).max(2000),
  body_md: z.string().max(20000).optional(),
  components: z.array(z.string().max(40)).max(20).default([]),
  category: z
    .enum(['verify', 'improve', 'proposal', 'develop', 'other'])
    .default('other'),
  tags: z.array(z.string().min(1).max(30)).max(8).default([]),
  visibility: z.enum(['public', 'link', 'private']).default('public'),
});

export type HarnessCreateInput = z.infer<typeof HarnessCreateSchema>;

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  const rl = await checkRateLimit('pub', ip);
  if (!rl.ok) {
    return problem('rate-limit', { detail: '잠시 후 다시 시도해 주세요.' });
  }
  return notImplemented('GET /api/harnesses — 구현 대기 (api.md §2-2)');
}

/** util_slugify RPC + 충돌 시 -N suffix 재시도 (총 5회) */
async function generateUniqueSlug(title: string): Promise<string> {
  const db = getDb();
  const { data: base, error } = await db.rpc('util_slugify', { input: title });
  if (error) throw new Error(`slugify RPC 실패: ${error.message}`);
  const baseSlug = (base as string | null) ?? '';
  if (!baseSlug) throw new Error('빈 슬러그');

  // 1차: base 그대로 시도
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data: hit, error: selErr } = await db
      .from('posts')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (selErr) throw new Error(`slug 충돌 검사 실패: ${selErr.message}`);
    if (!hit) return candidate;
  }
  // 5회 모두 충돌 시 timestamp suffix 폴백
  return `${baseSlug}-${Date.now().toString(36)}`;
}

/** tags 처리: 각 라벨을 slug 로 변환 후 upsert, harness_tags 조인 INSERT */
async function attachTags(harnessId: string, labels: string[]): Promise<{ ok: number; fail: number }> {
  if (labels.length === 0) return { ok: 0, fail: 0 };
  const db = getDb();
  let ok = 0;
  let fail = 0;

  // 1) 각 라벨 → slug 변환 (RPC) + tags upsert
  const tagIds: number[] = [];
  for (const raw of labels) {
    const label = raw.trim().slice(0, 40);
    if (!label) continue;
    const { data: slugData, error: slugErr } = await db.rpc('util_slugify', { input: label });
    if (slugErr || !slugData) {
      fail += 1;
      continue;
    }
    const slug = String(slugData);
    const { data: tag, error: tagErr } = await db
      .from('tags')
      .upsert({ slug, label, category: 'topic' }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (tagErr || !tag) {
      fail += 1;
      continue;
    }
    tagIds.push(tag.id as number);
  }

  // 2) harness_tags INSERT (중복 무시)
  if (tagIds.length > 0) {
    const rows = tagIds.map((tag_id) => ({ harness_id: harnessId, tag_id }));
    const { error: joinErr } = await db
      .from('harness_tags')
      .upsert(rows, { onConflict: 'harness_id,tag_id', ignoreDuplicates: true });
    if (joinErr) {
      fail += tagIds.length;
    } else {
      ok += tagIds.length;
    }
  }
  return { ok, fail };
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return unauthorized();
  }

  // Rate limit: write — 30/60s/user
  const rl = await checkRateLimit('write', userId);
  if (!rl.ok) {
    return problem('rate-limit');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('JSON 본문을 파싱할 수 없어요.');
  }

  const parsed = HarnessCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(
      '입력값을 확인해 주세요.',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
  }
  const input = parsed.data;
  const db = getDb();

  // 1) slug 생성
  let slug: string;
  try {
    slug = await generateUniqueSlug(input.title);
  } catch (err) {
    console.error('[POST /api/harnesses] slug 생성 실패', err);
    return internal('슬러그 생성에 실패했어요.');
  }

  // 2) posts INSERT
  const nowIso = new Date().toISOString();
  const { data: post, error: postErr } = await db
    .from('posts')
    .insert({
      author_id: userId,
      type: 'harness',
      status: 'published',
      visibility: input.visibility,
      slug,
      published_at: nowIso,
    })
    .select('id, slug')
    .single();

  if (postErr || !post) {
    console.error('[POST /api/harnesses] posts insert 실패', postErr);
    return internal(`포스트 저장 실패: ${postErr?.message ?? 'unknown'}`);
  }

  // 3) harnesses INSERT (실패 시 posts cleanup)
  const { data: harness, error: hErr } = await db
    .from('harnesses')
    .insert({
      post_id: post.id,
      title: input.title,
      one_liner: input.one_liner,
      persona_name: input.persona_name ?? null,
      persona_job: input.persona_job ?? null,
      purpose: input.purpose,
      body_md: input.body_md ?? null,
      components: input.components,
      category: input.category,
    })
    .select('id')
    .single();

  if (hErr || !harness) {
    console.error('[POST /api/harnesses] harnesses insert 실패 — posts cleanup', hErr);
    await db.from('posts').delete().eq('id', post.id);
    return internal(`하네스 저장 실패: ${hErr?.message ?? 'unknown'}`);
  }

  // 4) tags 처리 (실패해도 본 INSERT는 살아남음)
  const tagResult = await attachTags(harness.id as string, input.tags);
  if (tagResult.fail > 0) {
    console.warn(
      `[POST /api/harnesses] tags 부분 실패: ok=${tagResult.ok}, fail=${tagResult.fail}`,
    );
  }

  return new Response(
    JSON.stringify({
      id: harness.id,
      slug: post.slug,
      url: `/harnesses/${post.slug}`,
      tags: { ok: tagResult.ok, fail: tagResult.fail },
    }),
    {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Location: `/harnesses/${post.slug}`,
      },
    },
  );
}
