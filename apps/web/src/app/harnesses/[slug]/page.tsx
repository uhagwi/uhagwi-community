/**
 * 하네스 상세 `/harnesses/[slug]` — 데이터 fetch + 레이아웃 컨테이너.
 * 섹션은 _sections/ (MainContent · Sidebar · MarkdownBody)로 분할 (300줄 한도).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth-user';
import { getHarnessBySlug, type HarnessDetailRow } from '@/lib/db/harnesses';
import { listCommentsByHarness, type DbComment } from '@/lib/db/comments';
import { getActiveReactions, type ReactionType } from '@/lib/db/reactions';
import { findSeedBySlug } from '@/lib/seed/showcase-harnesses';
import { MainContent } from './_sections/MainContent';
import { Sidebar } from './_sections/Sidebar';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

const FALLBACK_EMOJI = '🌊';

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

async function safeGetHarness(slug: string): Promise<HarnessDetailRow | null> {
  try {
    const row = await getHarnessBySlug(slug);
    if (row) return row;
  } catch (err) {
    console.error('[detail] getHarnessBySlug failed:', err);
  }
  return findSeedBySlug(slug);
}

async function safeListComments(harnessId: string): Promise<DbComment[]> {
  try {
    return await listCommentsByHarness(harnessId);
  } catch (err) {
    console.error('[detail] listCommentsByHarness failed:', err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const harness = await safeGetHarness(params.slug);
  if (!harness) return { title: '하네스를 찾을 수 없습니다' };
  return {
    title: harness.title,
    description: harness.one_liner,
    openGraph: {
      title: `${harness.persona_name ?? ''} — ${harness.title}`.trim(),
      description: harness.one_liner,
      type: 'article',
      publishedTime: harness.published_at ?? undefined,
    },
  };
}

export default async function HarnessDetailPage({ params }: { params: Params }) {
  const harness = await safeGetHarness(params.slug);
  if (!harness) notFound();

  const currentUserId = await getCurrentUserId();
  const isAuthenticated = !!currentUserId;
  let initialActive: ReactionType[] = [];
  if (currentUserId) {
    try {
      initialActive = Array.from(
        await getActiveReactions({ harnessId: harness.id, userId: currentUserId }),
      );
    } catch (err) {
      console.error('[detail] getActiveReactions failed:', err);
    }
  }

  const comments = await safeListComments(harness.id);
  const juzzepAvg = Math.round(harness.avg_juzzep ?? 0);
  const dateSource = harness.published_at ?? harness.created_at;
  const formattedDate = dateSource ? dateFormatter.format(new Date(dateSource)) : '';

  const author = harness.author;
  const authorHandle = author?.handle ?? 'anonymous';
  const authorDisplay = author?.display_name ?? '익명의 빌더';
  const authorAvatar = author?.avatar_url ?? null;

  return (
    <article className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/harnesses"
          className="text-sm text-[color:var(--color-ink-600)] hover:text-brand-700"
          aria-label="갤러리로 돌아가기"
        >
          ← 갤러리
        </Link>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost text-sm" disabled>공유</button>
          <button type="button" className="btn-ghost text-sm" disabled>이식하기 beta</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
        <MainContent
          harness={harness}
          authorHandle={authorHandle}
          formattedDate={formattedDate}
          comments={comments}
          juzzepAvg={juzzepAvg}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
        />
        <Sidebar
          harness={harness}
          authorHandle={authorHandle}
          authorDisplay={authorDisplay}
          authorAvatar={authorAvatar}
          juzzepAvg={juzzepAvg}
          initialActive={initialActive}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </article>
  );
}
