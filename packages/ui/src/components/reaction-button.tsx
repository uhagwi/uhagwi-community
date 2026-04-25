import type { ReactionType } from '../types';
import { REACTION_META } from '../types';

interface Props {
  type: ReactionType;
  count: number;
  active?: boolean;
  onClick?: () => void;
}

/**
 * 주접 리액션 버튼 placeholder.
 * 실제 낙관적 업데이트·Idempotency-Key 로직은 apps/web 에서 주입.
 * TODO: docs/service-dev/02_design/api.md §POST /reactions 연동
 */
export function ReactionButton({ type, count, active = false, onClick }: Props) {
  const meta = REACTION_META[type];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-sm transition ${
        active ? 'bg-juzzep-500 text-white' : 'bg-cream-100 text-brand-800 hover:bg-brand-100'
      }`}
    >
      <span aria-hidden>{meta.emoji}</span>
      <span className="sr-only">{meta.label}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
