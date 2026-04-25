/**
 * 하네스 상세 `/harnesses/[slug]`
 * 근거: docs/service-dev/02_design/ui.md §2-3 하네스 상세 와이어프레임
 *
 * Phase 2: Supabase 실 DB fetch (force-dynamic).
 * - 좌측 메인: 제목 · 한줄요약 · 본문(Markdown) · 구성요소 · 댓글
 * - 우측 사이드: 작성자 카드 · 주접지수 · 리액션 · 이식 CTA
 * - 환경변수 미설정·DB 오류 시 notFound() (안전한 404)
 * - generateStaticParams 제거 — 갤러리·상세 모두 동적 렌더
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CharacterThumbnail } from '@/components/character-thumbnail';
import { JuzzepReactions } from '@/components/juzzep-reactions';
import { CommentList } from '@/components/comment-list';
import { CommentForm } from '@/components/comment-form';
import { getCurrentUserId } from '@/lib/auth-user';
import {
  getHarnessBySlug,
  type HarnessDetailRow,
} from '@/lib/db/harnesses';
import { listCommentsByHarness, type DbComment } from '@/lib/db/comments';
import { getActiveReactions, type ReactionType } from '@/lib/db/reactions';
import { JuzzepBadge } from '@uhagwi/ui';

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
    return await getHarnessBySlug(slug);
  } catch (err) {
    console.error('[detail] getHarnessBySlug failed:', err);
    return null;
  }
}

async function safeListComments(harnessId: string): Promise<DbComment[]> {
  try {
    return await listCommentsByHarness(harnessId);
  } catch (err) {
    console.error('[detail] listCommentsByHarness failed:', err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const harness = await safeGetHarness(params.slug);
  if (!harness) {
    return { title: '하네스를 찾을 수 없습니다' };
  }
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

export default async function HarnessDetailPage({
  params,
}: {
  params: Params;
}) {
  const harness = await safeGetHarness(params.slug);
  if (!harness) {
    notFound();
  }

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
  const formattedDate = dateSource
    ? dateFormatter.format(new Date(dateSource))
    : '';

  const author = harness.author;
  const authorHandle = author?.handle ?? 'anonymous';
  const authorDisplay = author?.display_name ?? '익명의 빌더';
  const authorAvatar = author?.avatar_url ?? null;
  const fallbackEmoji = harness.thumbnail_emoji ?? FALLBACK_EMOJI;

  return (
    <article className="mx-auto max-w-[1100px]">
      {/* Top Nav */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/harnesses"
          className="text-sm text-[color:var(--color-ink-600)] hover:text-brand-700"
          aria-label="갤러리로 돌아가기"
        >
          ← 갤러리
        </Link>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost text-sm" disabled>
            공유
          </button>
          <button type="button" className="btn-ghost text-sm" disabled>
            이식하기 beta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
        {/* ===== 좌측 메인 ===== */}
        <div className="space-y-6">
          <header className="space-y-3">
            <p className="font-display text-base text-brand-700">
              {harness.persona_name ? `🌊 ${harness.persona_name}` : '🌊'}
            </p>
            <h1 className="font-display text-[28px] font-bold leading-tight text-brand-900 md:text-[36px]">
              {harness.title}
            </h1>
            <p className="text-base text-[color:var(--color-ink-600)] md:text-lg">
              {harness.one_liner}
            </p>
            <p className="text-sm text-[color:var(--color-ink-600)]">
              by{' '}
              <Link
                href={`/u/${authorHandle}`}
                className="font-medium text-brand-700 hover:underline"
              >
                @{authorHandle}
              </Link>
              {formattedDate ? ` · ${formattedDate}` : ''}
              {' · '}
              👁 {harness.view_count.toLocaleString('ko-KR')}
            </p>
            {harness.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5" aria-label="태그 목록">
                {harness.tags.map((tag) => (
                  <li key={tag} className="tag-chip">
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </header>

          {/* 결과 섬네일 — 캐릭터 이미지 우선, 404·없으면 emoji fallback */}
          <figure
            aria-label={`${harness.title} 캐릭터 이미지`}
            className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-card bg-gradient-to-br from-brand-100 via-cream-100 to-mint-400/40"
          >
            <CharacterThumbnail
              src={harness.thumbnail_url}
              fallbackEmoji={fallbackEmoji}
              alt={`${harness.persona_name ?? harness.title} 캐릭터`}
              sizes="(max-width: 1024px) 100vw, 720px"
              imageClassName="object-contain p-6"
              emojiClassName="text-[96px]"
            />
          </figure>

          {/* 한줄요약 + 목적 */}
          <section aria-labelledby="purpose" className="space-y-3">
            <h2 id="purpose" className="text-lg font-semibold text-brand-800">
              📝 한줄요약
            </h2>
            <p className="text-base font-medium text-brand-900">
              {harness.one_liner}
            </p>
            <h3 className="pt-2 text-base font-semibold text-brand-800">목적</h3>
            <p className="text-[color:var(--color-ink-900)]">{harness.purpose}</p>
          </section>

          {/* 본문 (Markdown) */}
          {harness.body_md ? (
            <section aria-labelledby="body" className="space-y-3">
              <h2 id="body" className="sr-only">
                본문
              </h2>
              <div className="markdown-body space-y-4 text-[15px] leading-relaxed text-[color:var(--color-ink-900)]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => (
                      <h3 className="mt-6 font-display text-xl font-bold text-brand-900">
                        {children}
                      </h3>
                    ),
                    h3: ({ children }) => (
                      <h4 className="mt-4 text-lg font-semibold text-brand-800">
                        {children}
                      </h4>
                    ),
                    p: ({ children }) => <p className="leading-7">{children}</p>,
                    ul: ({ children }) => (
                      <ul className="ml-5 list-disc space-y-1 marker:text-brand-500">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="ml-5 list-decimal space-y-1 marker:text-brand-500">
                        {children}
                      </ol>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-brand-800">
                        {children}
                      </strong>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-brand-700 underline underline-offset-2 hover:text-brand-900"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.startsWith('language-');
                      if (isBlock) {
                        return (
                          <code className={`${className} text-cream-50`}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="rounded bg-cream-100 px-1 py-0.5 font-mono text-[13px] text-brand-800">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="overflow-x-auto rounded-card bg-brand-900 p-4 font-mono text-[13px] leading-6 text-cream-50">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-brand-300 bg-cream-50 py-2 pl-4 italic text-[color:var(--color-ink-600)]">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {harness.body_md}
                </ReactMarkdown>
              </div>
            </section>
          ) : null}

          {/* 구성요소 */}
          {harness.components.length > 0 ? (
            <section aria-labelledby="components" className="space-y-3">
              <h2
                id="components"
                className="text-lg font-semibold text-brand-800"
              >
                🧰 구성요소 ({harness.components.length})
              </h2>
              <ul className="flex flex-wrap gap-2">
                {harness.components.map((c) => (
                  <li
                    key={c}
                    className="inline-flex items-center rounded-pill bg-brand-50 px-3 py-1 text-sm text-brand-800"
                  >
                    <code className="font-mono text-xs">{c}</code>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* 댓글 */}
          <section aria-labelledby="comments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="comments" className="text-lg font-semibold text-brand-800">
                💬 주접 댓글 ({comments.length})
              </h2>
              <span className="text-xs text-[color:var(--color-ink-600)]">
                평균 주접지수 {juzzepAvg}
              </span>
            </div>
            <CommentForm harnessId={harness.id} isAuthenticated={isAuthenticated} />
            <CommentList comments={comments} currentUserId={currentUserId ?? undefined} />
          </section>
        </div>

        {/* ===== 우측 사이드 ===== */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* 작성자 카드 */}
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-brand-800">작성자</h2>
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-200 to-juzzep-400/40 text-2xl"
              >
                {authorAvatar ? (
                  <Image
                    src={authorAvatar}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span>{FALLBACK_EMOJI}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-brand-900">{authorDisplay}</p>
                <p className="text-xs text-[color:var(--color-ink-600)]">
                  @{authorHandle}
                </p>
              </div>
            </div>
            <Link
              href={`/u/${authorHandle}`}
              className="block w-full rounded-[10px] border border-brand-200 bg-white px-3 py-2 text-center text-xs font-medium text-brand-700 transition hover:bg-brand-50"
            >
              프로필 보기 →
            </Link>
          </div>

          {/* 주접 요약 */}
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-brand-800">주접 요약</h2>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-ink-600)]">
                평균 주접지수
              </span>
              <JuzzepBadge score={juzzepAvg} />
            </div>
            <div className="space-y-1 text-xs text-[color:var(--color-ink-600)]">
              {harness.persona_job ? (
                <p>
                  <span className="font-medium text-brand-700">대상:</span>{' '}
                  {harness.persona_job}
                </p>
              ) : null}
              <p>
                <span className="font-medium text-brand-700">구성요소:</span>{' '}
                {harness.components.length}개
              </p>
              <p>
                <span className="font-medium text-brand-700">조회:</span>{' '}
                {harness.view_count.toLocaleString('ko-KR')}회
              </p>
            </div>
          </div>

          {/* 리액션 */}
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-brand-800">
              이 하네스 주접 놓기
            </h2>
            <JuzzepReactions
              harnessId={harness.id}
              initial={harness.reaction_counts}
              mine={initialActive}
              isAuthenticated={isAuthenticated}
            />
            {!isAuthenticated ? (
              <p className="text-[11px] text-[color:var(--color-ink-600)]">
                * 로그인 후 진짜로 카운트됩니다.
              </p>
            ) : null}
          </div>

          {/* 이식 CTA */}
          <div className="card space-y-2 border-2 border-brand-200 bg-cream-50">
            <h2 className="text-sm font-semibold text-brand-800">
              내 업무에 이식하기
            </h2>
            <p className="text-xs text-[color:var(--color-ink-600)]">
              Claude / ChatGPT / n8n / Zapier 등에 이 하네스를 복사할 수
              있습니다.
            </p>
            <button
              type="button"
              className="w-full rounded-[10px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              aria-label="이식 기능 준비 중 — Phase 2에 오픈"
            >
              이식하기 beta 🚀
            </button>
          </div>
        </aside>
      </div>
    </article>
  );
}
