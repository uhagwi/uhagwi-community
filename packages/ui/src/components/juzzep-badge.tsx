interface Props {
  score: number;
}

/**
 * 주접지수 뱃지. 0~100 범위를 5단계로 표시.
 * 점수 산정 규칙: apps/web/src/lib/juzzep.ts (룰베이스 + Haiku 폴백)
 */
export function JuzzepBadge({ score }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tier = clamped >= 80 ? '🔥 폭주' : clamped >= 60 ? '⭐ 상급' : clamped >= 40 ? '🎯 중급' : clamped >= 20 ? '🌱 입문' : '😐 건조';
  return (
    <span
      title={`주접지수 ${clamped}/100`}
      className="inline-flex items-center gap-1 rounded-pill bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700"
    >
      <span aria-hidden>주접</span>
      <span className="tabular-nums">{clamped}</span>
      <span aria-hidden>· {tier}</span>
    </span>
  );
}
