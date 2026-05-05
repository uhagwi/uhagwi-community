import Link from 'next/link';
import Image from 'next/image';
import { JuzzepReactions } from '@/components/juzzep-reactions';
import { JuzzepBadge } from '@uhagwi/ui';
import type { HarnessDetailRow } from '@/lib/db/harnesses';
import type { ReactionType } from '@/lib/db/reactions';

const FALLBACK_EMOJI = '🌊';

interface Props {
  harness: HarnessDetailRow;
  authorHandle: string;
  authorDisplay: string;
  authorAvatar: string | null;
  juzzepAvg: number;
  initialActive: ReactionType[];
  isAuthenticated: boolean;
}

export function Sidebar({
  harness,
  authorHandle,
  authorDisplay,
  authorAvatar,
  juzzepAvg,
  initialActive,
  isAuthenticated,
}: Props) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-brand-800">작성자</h2>
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-200 to-juzzep-400/40 text-2xl"
          >
            {authorAvatar ? (
              <Image src={authorAvatar} alt="" fill sizes="48px" className="object-cover" />
            ) : (
              <span>{FALLBACK_EMOJI}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-brand-900">{authorDisplay}</p>
            <p className="text-xs text-[color:var(--color-ink-600)]">@{authorHandle}</p>
          </div>
        </div>
        <Link
          href={`/u/${authorHandle}`}
          className="block w-full rounded-[10px] border border-brand-200 bg-white px-3 py-2 text-center text-xs font-medium text-brand-700 transition hover:bg-brand-50"
        >
          프로필 보기 →
        </Link>
      </div>

      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-brand-800">주접 요약</h2>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[color:var(--color-ink-600)]">평균 주접지수</span>
          <JuzzepBadge score={juzzepAvg} />
        </div>
        <div className="space-y-1 text-xs text-[color:var(--color-ink-600)]">
          {harness.persona_job ? (
            <p>
              <span className="font-medium text-brand-700">대상:</span> {harness.persona_job}
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

      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-brand-800">이 하네스 주접 놓기</h2>
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

      <div className="card space-y-2 border-2 border-brand-200 bg-cream-50">
        <h2 className="text-sm font-semibold text-brand-800">내 업무에 이식하기</h2>
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
  );
}
