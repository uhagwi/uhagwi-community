import Link from 'next/link';
import { CharacterThumbnail } from '@/components/character-thumbnail';
import { CommentList } from '@/components/comment-list';
import { CommentForm } from '@/components/comment-form';
import type { HarnessDetailRow } from '@/lib/db/harnesses';
import type { DbComment } from '@/lib/db/comments';
import { MarkdownBody } from './MarkdownBody';
import { MermaidDiagram } from '@/components/mermaid-diagram';
import { bodyToMermaid, extractFlowLine } from '@/lib/flow-to-mermaid';

const FALLBACK_EMOJI = '🌊';

interface Props {
  harness: HarnessDetailRow;
  authorHandle: string;
  formattedDate: string;
  comments: DbComment[];
  juzzepAvg: number;
  isAuthenticated: boolean;
  currentUserId: string | null;
}

export function MainContent({
  harness,
  authorHandle,
  formattedDate,
  comments,
  juzzepAvg,
  isAuthenticated,
  currentUserId,
}: Props) {
  const fallbackEmoji = harness.thumbnail_emoji ?? FALLBACK_EMOJI;
  const flowLine = extractFlowLine(harness.body_md);
  const mermaidChart = bodyToMermaid(harness.body_md);

  return (
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
          <Link href={`/u/${authorHandle}`} className="font-medium text-brand-700 hover:underline">
            @{authorHandle}
          </Link>
          {formattedDate ? ` · ${formattedDate}` : ''}
          {' · '}
          👁 {harness.view_count.toLocaleString('ko-KR')}
        </p>
        {harness.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="태그 목록">
            {harness.tags.map((tag) => (
              <li key={tag} className="tag-chip">#{tag}</li>
            ))}
          </ul>
        ) : null}
      </header>

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

      {mermaidChart && flowLine ? (
        <section aria-labelledby="structure" className="space-y-3">
          <h2 id="structure" className="text-lg font-semibold text-brand-800">
            🗺 구조도
          </h2>
          <MermaidDiagram
            chart={mermaidChart}
            fallbackText={flowLine}
            domId={`flow-${harness.id}`}
          />
        </section>
      ) : null}

      <section aria-labelledby="purpose" className="space-y-3">
        <h2 id="purpose" className="text-lg font-semibold text-brand-800">📝 한줄요약</h2>
        <p className="text-base font-medium text-brand-900">{harness.one_liner}</p>
        <h3 className="pt-2 text-base font-semibold text-brand-800">목적</h3>
        <p className="text-[color:var(--color-ink-900)]">{harness.purpose}</p>
      </section>

      {harness.body_md ? <MarkdownBody body={harness.body_md} /> : null}

      {harness.components.length > 0 ? (
        <section aria-labelledby="components" className="space-y-3">
          <h2 id="components" className="text-lg font-semibold text-brand-800">
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
  );
}
