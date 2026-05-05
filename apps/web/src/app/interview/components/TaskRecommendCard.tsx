'use client';

import type { Phase2Result, Phase2Task } from '../phases';

const CATEGORY_LABEL: Record<Phase2Task['category'], { emoji: string; label: string }> = {
  daily: { emoji: '🔥', label: '매일' },
  weekly: { emoji: '🌱', label: '매주' },
  monthly: { emoji: '🗓', label: '매월' },
  one_time: { emoji: '📦', label: '단발성' },
  social: { emoji: '🌐', label: '외부·SNS' },
};

const PAIN_COLOR: Record<Phase2Task['current_pain_level'], string> = {
  low: 'bg-green-50 text-green-800',
  medium: 'bg-yellow-50 text-yellow-800',
  high: 'bg-red-50 text-red-800',
};

interface Props {
  result: Phase2Result;
  onAdvance: () => void;
}

export function TaskRecommendCard({ result, onAdvance }: Props) {
  // 카테고리별 그룹
  const grouped: Record<Phase2Task['category'], Phase2Task[]> = {
    daily: [],
    weekly: [],
    monthly: [],
    one_time: [],
    social: [],
  };
  for (const t of result.tasks) {
    if (grouped[t.category]) grouped[t.category].push(t);
  }

  return (
    <div className="space-y-4">
      {/* Phase 2 인디케이터 */}
      <div className="card md:p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
          Phase 2 / 4 — 업무 추천 완료
        </p>
        <p className="mt-1 text-sm text-[color:var(--color-ink-600)]">
          AI가 당신 일을 분석해 매주 반복되는 업무 {result.tasks.length}개를 도출했어요.
          다음 단계에서 이 중 어떤 걸 자동화하고 싶은지 다시 대화해요.
        </p>
      </div>

      {/* 사용자 프로파일 요약 */}
      <div className="card md:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">당신은 누구인가</p>
        <p className="mt-2 text-sm leading-relaxed text-brand-800 md:text-base whitespace-pre-wrap">
          {result.user_profile_summary}
        </p>
        {result.primary_domains.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.primary_domains.map((d, i) => (
              <span
                key={i}
                className="rounded-pill bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800"
              >
                {d}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* 카테고리별 업무 그리드 */}
      <div className="card md:p-5">
        <p className="text-sm font-bold text-brand-900">반복되는 업무 {result.tasks.length}개</p>

        <div className="mt-3 space-y-4">
          {(Object.entries(grouped) as Array<[Phase2Task['category'], Phase2Task[]]>)
            .filter(([, items]) => items.length > 0)
            .map(([cat, items]) => (
              <div key={cat}>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  {CATEGORY_LABEL[cat].emoji} {CATEGORY_LABEL[cat].label} · {items.length}개
                </p>
                <ul className="mt-2 space-y-2">
                  {items.map((t) => (
                    <li
                      key={t.rank}
                      className="rounded-card border border-brand-100 bg-cream-50 p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                          {t.rank}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-brand-900">{t.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="text-brand-600">{t.domain}</span>
                            <span className="text-[color:var(--color-ink-600)]">·</span>
                            <span className="text-[color:var(--color-ink-600)]">{t.frequency}</span>
                            <span
                              className={`rounded-pill px-1.5 py-0.5 ${PAIN_COLOR[t.current_pain_level]}`}
                            >
                              {t.current_pain_level === 'high'
                                ? '답답함 큼'
                                : t.current_pain_level === 'medium'
                                  ? '답답함 중'
                                  : '답답함 낮음'}
                            </span>
                            {t.discovery_type === 'inferred' ? (
                              <span className="rounded-pill bg-purple-50 px-1.5 py-0.5 text-purple-800">
                                추론
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--color-ink-600)]">
                            {t.why_relevant}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>

      {/* 진행 버튼 */}
      <div className="card md:p-5">
        <p className="text-sm font-bold text-brand-900">다음 단계 — 자동화 욕구 인터뷰</p>
        <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
          위 업무들 중 *내가 안 해도 되면 좋겠다* 싶은 일을 함께 정리해볼게요. 5~10분 더 걸려요.
        </p>
        <button type="button" onClick={onAdvance} className="btn-cta mt-4 w-full">
          자동화 욕구 인터뷰 시작 →
        </button>
      </div>
    </div>
  );
}
