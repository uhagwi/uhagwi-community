/**
 * 댓글 게이트웨이
 */
import { getDb } from './index';

export type DbComment = {
  id: string;
  harness_id: string;
  body: string;
  juzzep_score: number;
  created_at: string;
  author: { id: string; handle: string; display_name: string; avatar_url: string | null } | null;
};

export async function listCommentsByHarness(harnessId: string): Promise<DbComment[]> {
  const db = getDb();
  const { data, error } = await db
    .from('comments')
    .select('id,harness_id,body,juzzep_score,created_at,author:users(id,handle,display_name,avatar_url)')
    .eq('harness_id', harnessId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    harness_id: row.harness_id as string,
    body: row.body as string,
    juzzep_score: (row.juzzep_score as number | null) ?? 50,
    created_at: row.created_at as string,
    author: extractAuthor(row.author),
  }));
}

export async function insertComment(params: {
  harnessId: string;
  authorId: string;
  body: string;
}): Promise<DbComment> {
  const db = getDb();
  const { data, error } = await db
    .from('comments')
    .insert({
      harness_id: params.harnessId,
      author_id: params.authorId,
      body: params.body,
    })
    .select('id,harness_id,body,juzzep_score,created_at,author:users(id,handle,display_name,avatar_url)')
    .single();
  if (error) throw error;
  return {
    id: data.id as string,
    harness_id: data.harness_id as string,
    body: data.body as string,
    juzzep_score: (data.juzzep_score as number | null) ?? 50,
    created_at: data.created_at as string,
    author: extractAuthor(data.author),
  };
}

export async function softDeleteComment(commentId: string, authorId: string): Promise<boolean> {
  const db = getDb();
  const { data, error } = await db
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('author_id', authorId)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

function extractAuthor(raw: unknown): DbComment['author'] {
  if (!raw) return null;
  const obj = Array.isArray(raw) ? raw[0] : raw;
  if (!obj) return null;
  const a = obj as { id: string; handle: string; display_name: string; avatar_url: string | null };
  return { id: a.id, handle: a.handle, display_name: a.display_name, avatar_url: a.avatar_url };
}
