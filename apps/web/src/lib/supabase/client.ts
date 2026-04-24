/**
 * Supabase 브라우저 클라이언트 (Client Components)
 * 근거: docs/service-dev/02_design/api.md §1-3
 */
'use client';

import { createBrowserClient } from '@supabase/ssr';

let _client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (_client) return _client;
  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return _client;
}
