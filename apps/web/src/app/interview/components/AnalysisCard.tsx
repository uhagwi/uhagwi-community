'use client';

import type { AnalyzeResult } from '../use-chat-state';

const CREATURE_EMOJI: Record<AnalyzeResult['creature_type'], string> = {
  coder: '🧑‍💻',
  writer: '📝',
  analyst: '📊',
  designer: '🎨',
  researcher: '🔬',
};

interface Props {
  analysis: AnalyzeResult;
}

export function AnalysisCard({ analysis }: Props) {
  const emoji = CREATURE_EMOJI[analysis.creature_type];
  const hours = Math.floor(analysis.total_save_min_per_week / 60);
  const mins = analysis.total_save_min_per_week % 60;
  const totalLabel = hours > 0 ? `주 ${hours}시간 ${mins ? `${mins}분` : ''}` : `주 ${mins}분`;

  return (
    <div className="space-y-4">
      {/* 페르소나 코드 + creature */}
      <div className="card text-center md:p-6">
        <p className="text-5xl" aria-hidden>
          {emoji}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-pill bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
          {analysis.persona_code}
        </p>
        <h2 className="mt-3 font-display text-xl font-bold text-brand-900 md:text-2xl">
          {analysis.persona_name_kr}
        </h2>
        <p className="mt-2 text-xs text-[color:var(--color-ink-600)]">
          {analysis.creature_personality}
        </p>
      </div>

      {/* 요약 */}
      <div className="card md:p-5">
        <p className="text-sm leading-relaxed text-brand-800 md:text-base">{analysis.summary}</p>
      </div>

      {/* 강점 / 주의 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="card md:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">강점</p>
          <ul className="mt-2 space-y-1.5 text-sm text-brand-800">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden>✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        {analysis.watch_outs.length > 0 ? (
          <div className="card md:p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-warning)]">
              눈여겨볼 점
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-brand-800">
              {analysis.watch_outs.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>⚠</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* 자동화 후보 톱5 */}
      <div className="card md:p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-bold text-brand-900 md:text-base">자동화 가능한 일 톱 {analysis.auto_candidates.length}</p>
          <p className="text-xs text-brand-600">예상 절약 {totalLabel}</p>
        </div>

        <ol className="mt-3 space-y-3">
          {analysis.auto_candidates.map((c) => (
            <li
              key={c.rank}
              className={`rounded-card border p-3 ${
                c.rank === analysis.recommended_first_demo
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-brand-100 bg-cream-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {c.rank}
                </span>
                <p className="text-sm font-bold text-brand-900">{c.title}</p>
                {c.rank === analysis.recommended_first_demo ? (
                  <span className="ml-auto rounded-pill bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    먼저 시연
                  </span>
                ) : null}
              </div>
              <p className="mt-1 ml-8 text-xs text-brand-600">
                {c.domain} · 주 {c.estimated_save_min_per_week}분 절약 추정
              </p>
              <p className="mt-1.5 ml-8 text-xs leading-relaxed text-[color:var(--color-ink-600)]">
                {c.why}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <div className="card md:p-5">
        <p className="text-sm font-bold text-brand-900">다음 단계</p>
        <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
          (다음 세션 구현 예정) Pro 결제 → MCP 설치 → Claude Desktop·Cursor에서 위 톱
          {analysis.recommended_first_demo} 자동화 즉시 가동
        </p>
      </div>
    </div>
  );
}
