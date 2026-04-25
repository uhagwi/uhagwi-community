/**
 * 하네스 상세 `/harnesses/[slug]`
 * 근거: docs/service-dev/02_design/ui.md §2-3 하네스 상세 와이어프레임
 *
 * MVP Phase 1: 하드코딩 샘플 4종 대상. 2-column 레이아웃 (desktop) / stacked (mobile).
 * - 좌측 메인: 제목 · tagline · body_md(Markdown) · 구성요소 · 태그
 * - 우측 사이드: 작성자 카드 · 주접지수 뱃지 · 리액션 바 · 이식 beta 버튼
 * - 하단: 댓글 리스트
 * Phase 2: Supabase fetch · 구조도 Mermaid SSR · 실제 이식 동작.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { JuzzepReactions } from '@/components/juzzep-reactions';
import { CommentList } from '@/components/comment-list';
import {
  SAMPLE_HARNESSES,
  SAMPLE_AUTHOR,
  averageJuzzep,
  getHarnessBySlug,
} from '@/data/sample-harnesses';
import { JuzzepBadge } from '@uhagwi/ui';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return SAMPLE_HARNESSES.map((h) => ({ slug: h.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const harness = getHarnessBySlug(params.slug);
  if (!harness) {
    return { title: '하네스를 찾을 수 없습니다' };
  }
  return {
    title: harness.title,
    description: harness.one_liner,
    openGraph: {
      title: `${harness.persona_name ?? ''} — ${harness.title}`.trim(),
      description: harness.tagline,
      type: 'article',
      publishedTime: harness.published_at,
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export default function HarnessDetailPage({ params }: { params: Params }) {
  const harness = getHarnessBySlug(params.slug);
  if (!harness) {
    notFound();
  }

  const {
    title,
    tagline,
    persona_name,
    persona_job,
    one_liner,
    purpose,
    body_md,
    components,
    tags,
    reaction_counts,
    comments,
    view_count,
    published_at,
    thumbnail_emoji,
    id,
  } = harness;

  const juzzepAvg = averageJuzzep(comments);
  const formattedDate = dateFormatter.format(new Date(published_at));

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
              {persona_name ? `🌊 ${persona_name}` : '🌊'}
            </p>
            <h1 className="font-display text-[28px] font-bold leading-tight text-brand-900 md:text-[36px]">
              {title}
            </h1>
            <p className="text-base text-[color:var(--color-ink-600)] md:text-lg">
              {tagline}
            </p>
            <p className="text-sm text-[color:var(--color-ink-600)]">
              by{' '}
              <Link
                href={`/u/${SAMPLE_AUTHOR.handle}`}
                className="font-medium text-brand-700 hover:underline"
              >
                @{SAMPLE_AUTHOR.handle}
              </Link>
              {' · '}
              {formattedDate}
              {' · '}
              👁 {view_count.toLocaleString('ko-KR')}
            </p>
            {tags.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5" aria-label="태그 목록">
                {tags.map((tag) => (
                  <li key={tag} className="tag-chip">
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </header>

          {/* 결과 섬네일 */}
          <figure
            aria-label={`${title} 결과 이미지`}
            className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-card bg-gradient-to-br from-brand-100 via-cream-100 to-mint-400/40"
          >
            <span className="text-[96px]" aria-hidden="true">
              {thumbnail_emoji}
            </span>
          </figure>

          {/* 한줄요약 + 목적 */}
          <section aria-labelledby="purpose" className="space-y-3">
            <h2 id="purpose" className="text-lg font-semibold text-brand-800">
              📝 한줄요약
            </h2>
            <p className="text-base font-medium text-brand-900">{one_liner}</p>
            <h3 className="pt-2 text-base font-semibold text-brand-800">
              목적
            </h3>
            <p className="text-[color:var(--color-ink-900)]">{purpose}</p>
          </section>

          {/* 본문 (Markdown) */}
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
                {body_md}
              </ReactMarkdown>
            </div>
          </section>

          {/* 구성요소 */}
          <section aria-labelledby="components" className="space-y-3">
            <h2 id="components" className="text-lg font-semibold text-brand-800">
              🧰 구성요소 ({components.length})
            </h2>
            <ul className="flex flex-wrap gap-2">
              {components.map((c) => (
                <li
                  key={c}
                  className="inline-flex items-center rounded-pill bg-brand-50 px-3 py-1 text-sm text-brand-800"
                >
                  <code className="font-mono text-xs">{c}</code>
                </li>
              ))}
            </ul>
          </section>

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
            <CommentList comments={comments} />
            <div className="card border-2 border-dashed border-brand-200 bg-cream-50 text-center">
              <p className="text-sm text-[color:var(--color-ink-600)]">
                주접 쓰기는 Discord 로그인 후 가능합니다 🤌 (Phase 2 연동 예정)
              </p>
            </div>
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
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-200 to-juzzep-400/40 text-2xl"
              >
                {SAMPLE_AUTHOR.avatar_emoji}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-brand-900">
                  {SAMPLE_AUTHOR.display_name}
                </p>
                <p className="text-xs text-[color:var(--color-ink-600)]">
                  @{SAMPLE_AUTHOR.handle}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[color:var(--color-ink-600)]">
              {SAMPLE_AUTHOR.bio}
            </p>
            <Link
              href={`/u/${SAMPLE_AUTHOR.handle}`}
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
              {persona_job ? (
                <p>
                  <span className="font-medium text-brand-700">대상:</span>{' '}
                  {persona_job}
                </p>
              ) : null}
              <p>
                <span className="font-medium text-brand-700">구성요소:</span>{' '}
                {components.length}개
              </p>
              <p>
                <span className="font-medium text-brand-700">조회:</span>{' '}
                {view_count.toLocaleString('ko-KR')}회
              </p>
            </div>
          </div>

          {/* 리액션 */}
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-brand-800">
              이 하네스 주접 놓기
            </h2>
            <JuzzepReactions harnessId={id} initial={reaction_counts} />
            <p className="text-[11px] text-[color:var(--color-ink-600)]">
              * MVP: 로그인 전에는 로컬 상태만 변경됩니다.
            </p>
          </div>

          {/* 이식 CTA */}
          <div className="card space-y-2 border-2 border-brand-200 bg-cream-50">
            <h2 className="text-sm font-semibold text-brand-800">
              내 업무에 이식하기
            </h2>
            <p className="text-xs text-[color:var(--color-ink-600)]">
              Claude / ChatGPT / n8n / Zapier 등에 이 하네스를 복사할 수 있습니다.
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
