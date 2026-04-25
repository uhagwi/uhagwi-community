/**
 * JuzzepReactions — 주접 리액션 4종 버튼 (❤️ 🔥 🙇 🤌)
 * 근거: docs/service-dev/02_design/ui.md §4-2 · api.md §2-4
 *
 * - 클릭 시 낙관적 업데이트 → POST /api/reactions → 서버 응답으로 동기화
 * - 실패 시 원래 상태로 롤백 + 인라인 에러 메시지 노출
 * - aria-pressed 로 active 상태 표시 (색약 대응 — 숫자 라벨 항상 동반)
 * - 미인증 사용자는 클릭 시 /login 으로 이동 (next 파라미터 첨부)
 */
'use client';

import { useCallback, useId, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export type ReactionType = 'heart' | 'fire' | 'bow' | 'pinch';
export type ReactionCounts = Record<ReactionType, number>;

export type JuzzepReactionsProps = {
  harnessId: string;
  /** 카운트 초기값 — 서버 컴포넌트에서 주입 */
  initial: ReactionCounts;
  /** 현재 사용자가 이미 누른 타입들 (미로그인이면 빈 배열) */
  mine?: ReactionType[];
  /** 인증 여부 — 명시 안 되면 mine.length>0 인 경우에만 인증으로 가정 */
  isAuthenticated?: boolean;
  /** 카드용(작은) vs 상세용(큰) — 시각만 변경 */
  variant?: 'sm' | 'md';
  className?: string;
};

const CONFIG: Record<ReactionType, { emoji: string; label: string; tone: string; activeTone: string }> = {
  heart: {
    emoji: '❤️',
    label: '사랑해',
    tone: 'bg-juzzep-400/20 hover:bg-juzzep-400/40 text-brand-900',
    activeTone: 'bg-juzzep-500 text-white ring-juzzep-500',
  },
  fire: {
    emoji: '🔥',
    label: '불탄다',
    tone: 'bg-orange-200/40 hover:bg-orange-200/80 text-brand-900',
    activeTone: 'bg-orange-400 text-white ring-orange-400',
  },
  bow: {
    emoji: '🙇',
    label: '절하고갑니다',
    tone: 'bg-brand-200/40 hover:bg-brand-200/80 text-brand-900',
    activeTone: 'bg-brand-600 text-white ring-brand-600',
  },
  pinch: {
    emoji: '🤌',
    label: '조각이야',
    tone: 'bg-mint-400/30 hover:bg-mint-400/60 text-brand-900',
    activeTone: 'bg-mint-400 text-brand-900 ring-mint-400',
  },
};

const REACTION_ORDER: readonly ReactionType[] = ['heart', 'fire', 'bow', 'pinch'];

export function JuzzepReactions({
  harnessId,
  initial,
  mine = [],
  isAuthenticated,
  variant = 'md',
  className = '',
}: JuzzepReactionsProps) {
  const router = useRouter();
  const errId = useId();
  const [counts, setCounts] = useState<ReactionCounts>(initial);
  const [active, setActive] = useState<Set<ReactionType>>(new Set(mine));
  const [error, setError] = useState<string | null>(null);
  const [pendingType, setPendingType] = useState<ReactionType | null>(null);
  const [, startTransition] = useTransition();

  // mine 이 채워졌으면 인증으로 간주. 명시값이 우선.
  const authed = isAuthenticated ?? mine.length > 0;

  const onToggle = useCallback(
    (type: ReactionType) => {
      // 미인증이면 로그인 유도
      if (!authed) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?next=${next}`);
        return;
      }
      if (pendingType) return; // 다른 토글이 진행 중이면 무시 (중복 방지)

      // 낙관 업데이트
      const wasActive = active.has(type);
      const prevCounts = counts;
      const prevActive = new Set(active);
      const nextActive = new Set(active);
      if (wasActive) nextActive.delete(type);
      else nextActive.add(type);

      const optimisticCounts: ReactionCounts = {
        ...counts,
        [type]: Math.max(0, counts[type] + (wasActive ? -1 : 1)),
      };
      setActive(nextActive);
      setCounts(optimisticCounts);
      setError(null);
      setPendingType(type);

      startTransition(async () => {
        try {
          const res = await fetch('/api/reactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 1분 윈도우 안 동일 토글 멱등화 — 사용자별 user/ harness/type 구분
              'Idempotency-Key': `${harnessId}:${type}:${Date.now()}`,
            },
            body: JSON.stringify({ harness_id: harnessId, type }),
          });
          if (!res.ok) {
            // 401 → 로그인 유도, 그 외 → 롤백 + 에러 메시지
            if (res.status === 401) {
              const next = encodeURIComponent(window.location.pathname + window.location.search);
              router.push(`/login?next=${next}`);
              return;
            }
            const detail = await safeProblemDetail(res);
            throw new Error(detail);
          }
          const data = (await res.json()) as { active: boolean; counts: ReactionCounts };
          // 서버 응답으로 정규화 (낙관 결과와 차이 있으면 서버값 우선)
          setCounts(data.counts);
          setActive((cur) => {
            const next = new Set(cur);
            if (data.active) next.add(type);
            else next.delete(type);
            return next;
          });
        } catch (e) {
          // 롤백
          setCounts(prevCounts);
          setActive(prevActive);
          setError(e instanceof Error ? e.message : '리액션 실패 — 잠시 후 다시 시도해주세요.');
        } finally {
          setPendingType(null);
        }
      });
    },
    [active, authed, counts, harnessId, pendingType, router],
  );

  const sizeClasses =
    variant === 'sm'
      ? 'gap-1.5 text-xs'
      : 'gap-2 text-sm';
  const buttonSize =
    variant === 'sm'
      ? 'px-2.5 py-1 gap-1.5'
      : 'px-4 py-2 gap-2';

  return (
    <div className={className}>
      <div
        role="group"
        aria-label="주접 리액션"
        aria-describedby={error ? errId : undefined}
        className={`flex flex-wrap ${sizeClasses}`}
      >
        {REACTION_ORDER.map((type) => {
          const cfg = CONFIG[type];
          const isOn = active.has(type);
          const isBusy = pendingType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggle(type)}
              aria-pressed={isOn}
              aria-busy={isBusy}
              aria-label={`${cfg.label} ${counts[type]}개${isOn ? ' (눌림)' : ''}`}
              disabled={isBusy}
              className={`inline-flex items-center rounded-pill font-medium transition active:scale-95 disabled:cursor-wait disabled:opacity-70 ${buttonSize} ${
                isOn ? `${cfg.activeTone} ring-2` : cfg.tone
              }`}
            >
              <span aria-hidden="true">{cfg.emoji}</span>
              <span className="tabular-nums">{counts[type]}</span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p
          id={errId}
          role="alert"
          className="mt-2 text-xs text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

async function safeProblemDetail(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { title?: string; detail?: string };
    return j.detail ?? j.title ?? `요청 실패 (${res.status})`;
  } catch {
    return `요청 실패 (${res.status})`;
  }
}
