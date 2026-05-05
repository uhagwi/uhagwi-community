import Link from 'next/link';

interface Props {
  phase: number;
  phase2Loading: boolean;
  phase4Loading: boolean;
  onReset: () => void;
}

export function ProgressHeader({ phase, phase2Loading, phase4Loading, onReset }: Props) {
  return (
    <header className="border-b border-brand-100 bg-cream-50 px-4 py-3 md:px-6">
      <div className="mx-auto max-w-[760px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-brand-900">🌊 우하귀 진단 도반</p>
            <p className="text-xs text-[color:var(--color-ink-600)]">
              {phaseLabel(phase, phase2Loading, phase4Loading)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost text-xs">홈</Link>
            {phase > 0 ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('정말 처음부터 다시 시작할까요? 지금까지 데이터는 사라져요.'))
                    onReset();
                }}
                className="btn-ghost text-xs"
              >
                처음부터
              </button>
            ) : null}
          </div>
        </div>
        {phase > 0 ? <PhaseProgress phase={phase} /> : null}
      </div>
    </header>
  );
}

function phaseLabel(phase: number, p2Loading: boolean, p4Loading: boolean): string {
  if (phase === 0) return '4단계로 당신을 분석해드려요';
  if (phase === 1) return 'Phase 1/4 — 사람 파악 인터뷰 (10~15턴)';
  if (phase === 2)
    return p2Loading ? 'Phase 2/4 — 업무 분석 중…' : 'Phase 2/4 — 업무 추천 완료';
  if (phase === 3) return 'Phase 3/4 — 자동화 욕구 인터뷰 (5~12턴)';
  if (phase === 4)
    return p4Loading ? 'Phase 4/4 — 자동화 후보 도출 중…' : 'Phase 4/4 — 진단 완료 🎉';
  return '';
}

function PhaseProgress({ phase }: { phase: number }) {
  const phases = [1, 2, 3, 4];
  return (
    <div className="mt-2 flex items-center gap-1.5">
      {phases.map((p) => (
        <div
          key={p}
          className={`h-1 flex-1 rounded-full ${phase >= p ? 'bg-brand-500' : 'bg-cream-200'}`}
          aria-label={`Phase ${p} ${phase >= p ? '진행됨' : '대기'}`}
        />
      ))}
    </div>
  );
}

export function CompleteBar({
  visible,
  label,
  disabled,
  onComplete,
}: {
  visible: boolean;
  label: string;
  disabled: boolean;
  onComplete: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="border-t border-brand-100 bg-yellow-50 px-3 py-2 md:px-4">
      <div className="mx-auto flex max-w-[760px] items-center justify-between gap-2">
        <p className="text-xs text-[color:var(--color-warning,#a87a00)]">
          💡 충분히 들었으면 언제든 분석으로 넘어가세요
        </p>
        <button
          type="button"
          onClick={onComplete}
          disabled={disabled}
          className="btn-cta shrink-0 px-3 py-1.5 text-xs disabled:opacity-50"
        >
          {label} →
        </button>
      </div>
    </div>
  );
}
