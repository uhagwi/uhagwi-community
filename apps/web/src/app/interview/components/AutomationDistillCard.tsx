'use client';

import type { Phase4Candidate, Phase4Result } from '../phases';

const CREATURE_EMOJI: Record<Phase4Result['creature_type'], string> = {
  coder: '🧑‍💻',
  writer: '📝',
  analyst: '📊',
  designer: '🎨',
  researcher: '🔬',
};

const CATEGORY_LABEL: Record<Phase4Candidate['category'], { emoji: string; label: string }> = {
  daily: { emoji: '🔥', label: '매일' },
  weekly: { emoji: '🌱', label: '매주' },
  one_time: { emoji: '📦', label: '단발성' },
  social: { emoji: '🌐', label: '외부·SNS' },
};

const PRIORITY_COLOR: Record<Phase4Candidate['first_demo_priority'], string> = {
  high: 'border-brand-500 bg-brand-50',
  medium: 'border-brand-100 bg-cream-50',
  low: 'border-brand-100 bg-white',
};

interface Props {
  result: Phase4Result;
}

export function AutomationDistillCard({ result }: Props) {
  const emoji = CREATURE_EMOJI[result.creature_type] ?? '🌊';
  const hours = Math.floor(result.total_save_min_per_week / 60);
  const mins = result.total_save_min_per_week % 60;
  const totalLabel = hours > 0 ? `주 ${hours}시간 ${mins ? `${mins}분` : ''}` : `주 ${mins}분`;

  // 카테고리별 그룹
  const grouped: Record<Phase4Candidate['category'], Phase4Candidate[]> = {
    daily: [],
    weekly: [],
    one_time: [],
    social: [],
  };
  for (const c of result.auto_candidates) {
    if (grouped[c.category]) grouped[c.category].push(c);
  }

  return (
    <div className="space-y-4">
      {/* Phase 4 인디케이터 */}
      <div className="card md:p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
          Phase 4 / 4 — 진단 완료 🎉
        </p>
        <p className="mt-1 text-sm text-[color:var(--color-ink-600)]">
          당신 욕구·금기·품질 기준 반영해 자동화 후보 {result.auto_candidates.length}개를 정제했어요.
        </p>
      </div>

      {/* 페르소나 + creature */}
      <div className="card text-center md:p-6">
        <p className="text-5xl" aria-hidden>
          {emoji}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-pill bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
          {result.persona_code}
        </p>
        <h2 className="mt-3 font-display text-xl font-bold text-brand-900 md:text-2xl">
          {result.persona_name_kr}
        </h2>
        <p className="mt-2 text-xs text-[color:var(--color-ink-600)]">{result.creature_personality}</p>
      </div>

      {/* 종합 요약 */}
      <div className="card md:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">종합 요약</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-800 md:text-base">
          {result.summary}
        </p>
      </div>

      {/* 자동화 우선순위 (must_have / want / off_limits) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {result.automation_priorities.must_have.length > 0 ? (
          <div className="card md:p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">반드시</p>
            <ul className="mt-2 space-y-1 text-sm text-brand-800">
              {result.automation_priorities.must_have.map((s, i) => (
                <li key={i} className="flex gap-1.5">
                  <span aria-hidden>★</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {result.automation_priorities.want.length > 0 ? (
          <div className="card md:p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">원함</p>
            <ul className="mt-2 space-y-1 text-sm text-brand-800">
              {result.automation_priorities.want.map((s, i) => (
                <li key={i} className="flex gap-1.5">
                  <span aria-hidden>○</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {result.automation_priorities.off_limits.length > 0 ? (
          <div className="card md:p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-warning,#a87a00)]">
              금기
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-800">
              {result.automation_priorities.off_limits.map((s, i) => (
                <li key={i} className="flex gap-1.5">
                  <span aria-hidden>✗</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* 품질 기준 */}
      {result.quality_bar ? (
        <div className="card md:p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">품질 기준</p>
          <p className="mt-1 text-sm text-brand-800">{result.quality_bar}</p>
        </div>
      ) : null}

      {/* 자동화 후보 */}
      <div className="card md:p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-bold text-brand-900">자동화 후보 {result.auto_candidates.length}개</p>
          <p className="text-xs text-brand-600">예상 절약 {totalLabel}</p>
        </div>

        <div className="mt-3 space-y-4">
          {(Object.entries(grouped) as Array<[Phase4Candidate['category'], Phase4Candidate[]]>)
            .filter(([, items]) => items.length > 0)
            .map(([cat, items]) => (
              <div key={cat}>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  {CATEGORY_LABEL[cat].emoji} {CATEGORY_LABEL[cat].label} · {items.length}개
                </p>
                <ol className="mt-2 space-y-2">
                  {items.map((c) => (
                    <li key={c.rank} className={`rounded-card border p-3 ${PRIORITY_COLOR[c.first_demo_priority]}`}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                          {c.rank}
                        </span>
                        <p className="text-sm font-bold text-brand-900">{c.title}</p>
                        {c.rank === result.recommended_first_demo_rank ? (
                          <span className="ml-auto rounded-pill bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            먼저 시연
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 ml-8 text-xs text-brand-600">
                        {c.domain} · 주 {c.estimated_save_min_per_week}분 · 우선순위{' '}
                        {c.first_demo_priority}
                      </p>
                      <p className="mt-1.5 ml-8 text-xs leading-relaxed text-[color:var(--color-ink-600)]">
                        <strong className="text-brand-800">왜 골랐나:</strong> {c.why_user_chose}
                      </p>
                      <p className="mt-1 ml-8 text-xs leading-relaxed text-[color:var(--color-ink-600)]">
                        <strong className="text-brand-800">구현:</strong> {c.automation_approach}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
        </div>
      </div>

      {/* Pro CTA */}
      <div className="card border-2 border-brand-500 md:p-5">
        <p className="text-sm font-bold text-brand-900">🌊 실제 자동화 가동 — Pro 구독</p>
        <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
          진단은 무료지만, 위 자동화를 실제로 Claude·Cursor에서 가동하려면 Pro 구독이 필요해요.
        </p>
        <ul className="mt-3 space-y-1 text-xs text-brand-800">
          {result.pro_required_features.map((f, i) => (
            <li key={i} className="flex gap-1.5">
              <span aria-hidden>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled
          className="btn-cta mt-4 w-full opacity-50"
          title="다음 세션 구현 예정"
        >
          Pro 구독하기 ($9/월) — 다음 세션 구현 예정
        </button>
      </div>
    </div>
  );
}
