/**
 * POST /api/lab/publish — Lab creature → 우하귀 harnesses 게시.
 *
 * 인증: NextAuth 세션 필수 (getCurrentUserId). 미인증 401.
 * Rate Limit: publish — 5/10min/user.
 * 멱등성: posts.content_hash = `lab:{creatureId}` + (author_id, content_hash) unique index 활용.
 *   기존 row가 있으면 update + 동일 slug 반환, 없으면 insert + 새 slug.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-user';
import { checkRateLimit } from '@/lib/rate-limit';
import { problem, unauthorized, badRequest, internal } from '@/lib/problem';

const Schema = z.object({
  title: z.string().min(1).max(120),
  one_liner: z.string().min(1).max(200),
  purpose: z.string().min(1),
  components: z.array(z.string()).default([]),
  prompt_snippet: z.string().nullable().optional(),
  persona_name: z.string().nullable().optional(),
  persona_job: z.string().nullable().optional(),
  structure_mermaid: z.string().nullable().optional(),
  media_urls: z.array(z.string()).default([]),
  source: z.literal('lab'),
  lab_meta: z.object({
    creatureId: z.string().min(1),
    type: z.string(),
    level: z.number(),
    isExisting: z.boolean(),
    feedCount: z.number(),
    statSnapshot: z.record(z.number()),
  }),
});

type Body = z.infer<typeof Schema>;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function makeSlug(body: Body): string {
  const base = slugify(body.title) || 'harness';
  return `${base}-${body.lab_meta.creatureId.slice(-6)}`;
}

function harnessRow(body: Body) {
  return {
    title: body.title,
    one_liner: body.one_liner,
    purpose: body.purpose,
    components: body.components,
    persona_name: body.persona_name ?? null,
    persona_job: body.persona_job ?? null,
    prompt_snippet: body.prompt_snippet ?? null,
    structure_mermaid: body.structure_mermaid ?? null,
    media_urls: body.media_urls ?? [],
  };
}

export async function POST(req: NextRequest) {
  const authorId = await getCurrentUserId();
  if (!authorId) return unauthorized();

  const rl = await checkRateLimit('publish', authorId);
  if (!rl.ok) {
    return problem('rate-limit', {
      detail: '게시는 10분에 5회까지 가능해요.',
      headers: rl.retryAfter ? { 'retry-after': String(rl.retryAfter) } : undefined,
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return badRequest('JSON 파싱 실패');
  }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return badRequest('요청 형식이 올바르지 않아요', parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    })));
  }
  const body = parsed.data;

  const db = getDb();
  const contentHash = `lab:${body.lab_meta.creatureId}`;

  const { data: existingPost, error: lookupErr } = await db
    .from('posts')
    .select('id, slug')
    .eq('author_id', authorId)
    .eq('content_hash', contentHash)
    .maybeSingle();
  if (lookupErr) return internal(`멱등성 조회 실패: ${lookupErr.message}`);

  if (existingPost) {
    const { error: updErr } = await db
      .from('harnesses')
      .update(harnessRow(body))
      .eq('post_id', existingPost.id);
    if (updErr) return internal(`기존 하네스 갱신 실패: ${updErr.message}`);
    return Response.json({ slug: existingPost.slug, idempotent: true });
  }

  const slug = makeSlug(body);
  const { data: post, error: postErr } = await db
    .from('posts')
    .insert({
      author_id: authorId,
      type: 'harness',
      status: 'published',
      visibility: 'public',
      slug,
      content_hash: contentHash,
      published_at: new Date().toISOString(),
    })
    .select('id, slug')
    .single();
  if (postErr || !post) return internal(`posts insert 실패: ${postErr?.message ?? 'unknown'}`);

  const { error: harnessErr } = await db
    .from('harnesses')
    .insert({ post_id: post.id, ...harnessRow(body) });
  if (harnessErr) {
    await db.from('posts').delete().eq('id', post.id);
    return internal(`harnesses insert 실패: ${harnessErr.message}`);
  }

  return Response.json({ slug: post.slug, idempotent: false });
}
