// POST /api/lab/publish
// Lab creature → 우하귀 harnesses 게시
// MVP: payload 검증 + Mock 슬러그 반환. Supabase 연동은 후속 단계(W2 인증/RLS 검증 후).
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
    creatureId: z.string(),
    type: z.string(),
    level: z.number(),
    isExisting: z.boolean(),
    feedCount: z.number(),
    statSnapshot: z.record(z.number()),
  }),
});

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

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch (_) {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
  }

  // TODO(W2-인증): NextAuth 세션에서 author_id 추출 후 supabase insert
  // TODO(W2-DB): packages/db createServerClient → posts(type=harness, status=draft) + harnesses INSERT
  // TODO(W2-멱등): lab_meta.creatureId 단위 upsert (이미 존재하면 update)
  const slug = slugify(parsed.data.title) + '-' + parsed.data.lab_meta.creatureId.slice(-6);
  return NextResponse.json({ slug, mock: true });
}
