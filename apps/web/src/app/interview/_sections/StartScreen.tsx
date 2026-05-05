import Link from 'next/link';

interface Props {
  onStart: () => void;
}

export function StartScreen({ onStart }: Props) {
  return (
    <div className="mx-auto max-w-[680px] py-8">
      <div className="card text-center md:p-10">
        <p className="text-4xl">🌊</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-900 md:text-3xl">
          AI가 진단하고, AI가 일한다.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-600)] md:text-base">
          4단계로 당신에게 딱 맞는 자동화를 찾아드려요. 약 30~40분 걸려요.
        </p>

        <div className="mt-6 space-y-2 text-left">
          <PhaseStep n={1} title="사람 파악 인터뷰" desc="10~15턴 — 당신이 어떤 일 하시는지" />
          <PhaseStep n={2} title="업무 추천 (AI 분석)" desc="당신에게 필요한 업무 8~12개 도출" />
          <PhaseStep n={3} title="자동화 욕구 인터뷰" desc="5~12턴 — 어떤 걸 자동화하고 싶은지" />
          <PhaseStep n={4} title="자동화 후보 + Pro" desc="실 자동화 가동은 Pro 구독" />
        </div>

        <button type="button" onClick={onStart} className="btn-cta mt-7 w-full sm:w-auto">
          진단 시작하기 →
        </button>

        <p className="mt-4 text-xs text-[color:var(--color-ink-600)]">
          답변은 자동 저장됩니다 — 닫고 나중에 이어가셔도 돼요.
          <br />
          <Link href="/" className="underline hover:text-brand-700">
            ← 홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

function PhaseStep({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-card bg-cream-50 px-3 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
        {n}
      </span>
      <div>
        <p className="text-sm font-bold text-brand-900">{title}</p>
        <p className="text-xs text-[color:var(--color-ink-600)]">{desc}</p>
      </div>
    </div>
  );
}
