/**
 * 우하귀 DB 게이트웨이 — 서버 전용 Supabase service_role 클라이언트
 *
 * MVP 정책: API route·Server Component에서 service_role 로 직접 쿼리.
 * RLS는 활성화돼 있으되 service_role 가 우회. 클라이언트 직접 접근은 금지.
 * Phase 2: NextAuth JWT → Supabase JWT 서명 후 anon 클라이언트 + RLS 흐름으로 전환.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/** service_role 키로 전체 권한 갖는 서버 전용 클라이언트. 절대 클라이언트 노출 금지. */
export function getDb(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase 미설정 — SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요');
  }
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

export type DbUser = {
  id: string;
  discord_id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'member' | 'builder' | 'operator';
  status: 'active' | 'suspended' | 'withdrawn';
  can_post: boolean;
  created_at: string;
};

export type DbHarness = {
  id: string;
  post_id: string;
  title: string;
  persona_name: string | null;
  one_liner: string;
  purpose: string | null;
  components: string[];
  persona_job: string | null;
  body_md: string | null;
  thumbnail_url: string | null;
  thumbnail_emoji: string | null;
  category: 'verify' | 'improve' | 'proposal' | 'develop' | 'other' | null;
  created_at: string;
};

export type DbPost = {
  id: string;
  author_id: string;
  type: 'harness';
  status: 'draft' | 'published' | 'featured' | 'reported' | 'deleted';
  visibility: 'public' | 'link' | 'private';
  slug: string;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
