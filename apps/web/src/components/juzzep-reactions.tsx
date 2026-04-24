/**
 * JuzzepReactions — 주접 리액션 4종 버튼 (❤️ 🔥 🙇 🤌)
 * 근거: docs/service-dev/02_design/ui.md §4-2 · api.md §2-4
 *
 * - 탭 시 0.3s 팝 애니메이션 + 낙관적 업데이트
 * - 같은 사용자 재탭 시 취소
 * - 색약 대응: 아이콘 옆 숫자 라벨 항상 동반
 */
'use client';

import { useState, useTransition } from 'react';

export type ReactionType = 'heart' | 'fire' | 'bow' | 'pinch';

export type JuzzepReactionsProps = {
  harnessId: string;
  initial: Record<ReactionType, number>;
  /** 사용자가 이미 누른 타입들 */
  mine?: ReactionType[];
};

const CONFIG: Record<ReactionType, { emoji: string; label: string; className: string }> = {
  heart: { emoji: '❤️', label: '사랑해', className: 'bg-juzzep-400/20 hover:bg-juzzep-400/40' },
  fire: { emoji: '🔥', label: '불탄다', className: 'bg-orange-200/40 hover:bg-orange-200/80' },
  bow: { emoji: '🙇', label: '절하고갑니다', className: 'bg-brand-200/40 hover:bg-brand-200/80' },
  pinch: { emoji: '🤌', label: '조각이야', className: 'bg-mint-400/30 hover:bg-mint-400/60' },
};

export function JuzzepReactions({ harnessId, initial, mine = [] }: JuzzepReactionsProps) {
  const [counts, setCounts] = useState(initial);
  const [active, setActive] = useState<Set<ReactionType>>(new Set(mine));
  const [, startTransition] = useTransition();

  const onToggle = (type: ReactionType) => {
    // 낙관적 업데이트
    const wasActive = active.has(type);
    const nextActive = new Set(active);
    if (wasActive) nextActive.delete(type);
    else nextActive.add(type);
    setActive(nextActive);
    setCounts((c) => ({ ...c, [type]: c[type] + (wasActive ? -1 : 1) }));

    startTransition(async () => {
      // TODO: 구현 — POST /api/reactions {harness_id, type}
      //   Idempotency-Key 헤더 포함 · 실패 시 rollback
      void harnessId;
    });
  };

  return (
    <div
      role="group"
      aria-label="주접 리액션"
      className="flex flex-wrap gap-2"
    >
      {(Object.keys(CONFIG) as ReactionType[]).map((type) => {
        const cfg = CONFIG[type];
        const isOn = active.has(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            aria-pressed={isOn}
            aria-label={`${cfg.label} ${counts[type]}개`}
            className={`inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition active:scale-95 ${cfg.className} ${
              isOn ? 'ring-2 ring-brand-500' : ''
            }`}
          >
            <span aria-hidden="true">{cfg.emoji}</span>
            <span>{counts[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
