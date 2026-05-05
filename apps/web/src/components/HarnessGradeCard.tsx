'use client';

/**
 * 우하귀 하네스 등급 카드 — 가챠 UX placeholder.
 * v0.1: 시각만 박힘. 실 벤치마크·매칭은 다음 세션.
 */

import { GRADE_META, AXIS_LABELS, type Grade, type BenchmarkScore } from '@/lib/grades';

export type BuilderType = 'human' | 'ai';

interface Props {
  /** 하네스 메타 */
  title: string;
  domain: string;
  description: string;
  /** 벤치마크 결과 (optional — placeholder 표시 가능) */
  grade: Grade;
  score?: BenchmarkScore;
  /** creature 이모지 (다마고치 β와 결합) */
  creature_emoji?: string;
  /** 빌더 종류 — 사람·AI */
  builder_type?: BuilderType;
  /** 빌더 이름 (사람: "이진명" / AI: "우하귀 AI") */
  builder_name?: string;
  /** 카드 뒤집힘 애니메이션 (가챠) */
  flipped?: boolean;
  /** 미수집 카드 — 뒷면에 키워드 힌트(도메인·creature 이모지) 노출 */
  lockedHint?: boolean;
  /** 클릭 핸들러 (사용·자세히 보기 등) */
  onClick?: () => void;
}

const DOMAIN_LABEL_MAP: Record<string, string> = {
  education: '교육',
  admin: '행정',
  cafe_business: '자영업',
  research: '연구',
  design: '디자인',
  engineering: '개발',
  general: '일반',
};

export function HarnessGradeCard({
  title,
  domain,
  description,
  grade,
  score,
  creature_emoji = '🌊',
  builder_type,
  builder_name,
  flipped = false,
  lockedHint = false,
  onClick,
}: Props) {
  const meta = GRADE_META[grade];

  if (!flipped) {
    // 뒷면 — 가챠 미공개 또는 갤러리 미수집 (키워드 힌트)
    const domainLabel = DOMAIN_LABEL_MAP[domain] ?? domain;
    return (
      <button
        type="button"
        onClick={onClick}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-card border-2 border-brand-200 bg-gradient-to-br from-cream-100 to-brand-50 transition hover:scale-[1.02] hover:shadow-float"
        aria-label={lockedHint ? `미수집 카드 — ${domainLabel}` : '카드 뒤집기'}
      >
        {/* 점선 패턴 배경 (미공개 분위기) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(155, 130, 200, 0.3) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-center gap-2 p-3">
          {lockedHint ? (
            <>
              {/* 도메인 칩 (살짝 노출) */}
              <span className="rounded-pill bg-white/80 px-2 py-0.5 text-[10px] font-bold text-brand-700 shadow">
                {domainLabel}
              </span>
              {/* creature 이모지 — 흐릿하게 */}
              <p className="text-5xl opacity-60 grayscale">{creature_emoji}</p>
              {/* 등급 자리 (가려짐) */}
              <p className="font-display text-2xl font-bold text-brand-300">??</p>
              <p className="text-[10px] text-[color:var(--color-ink-600)]">
                🔒 미수집 — 가챠로 뽑기
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl">🎴</p>
              <p className="text-xs font-bold text-brand-600">우하귀 카드</p>
              <p className="text-[10px] text-[color:var(--color-ink-600)]">탭하여 뒤집기</p>
            </>
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-card border-2 ${meta.bg} ${meta.border} ${
        onClick ? 'cursor-pointer transition hover:scale-[1.02] hover:shadow-float' : ''
      } ${meta.shimmer ? 'animate-pulse-slow' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* 등급 배지 (우상단) */}
      <div
        className={`absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white font-display text-xl font-bold shadow ${meta.color}`}
      >
        {meta.label}
      </div>

      {/* 빌더 배지 (좌상단) */}
      {builder_type ? (
        <div
          className={`absolute left-2 top-2 z-10 flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-bold shadow ${
            builder_type === 'human'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-sky-100 text-sky-800'
          }`}
        >
          <span>{builder_type === 'human' ? '👤' : '🤖'}</span>
          <span>{builder_name ?? (builder_type === 'human' ? '사람' : 'AI')}</span>
        </div>
      ) : null}

      {/* S 등급 반짝 */}
      {meta.shimmer ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent" />
      ) : null}

      <div className="relative flex h-full flex-col p-3">
        {/* creature */}
        <div className="text-center">
          <p className="mt-2 text-4xl" aria-hidden>
            {creature_emoji}
          </p>
        </div>

        {/* 제목·도메인 */}
        <div className="mt-2 text-center">
          <p className="line-clamp-1 text-sm font-bold text-brand-900">{title}</p>
          <p className="mt-0.5 text-[10px] text-brand-600">{domain}</p>
        </div>

        {/* 설명 */}
        <p className="mt-2 line-clamp-3 text-[10px] leading-tight text-[color:var(--color-ink-600)]">
          {description}
        </p>

        {/* 점수 (있을 때만) */}
        {score ? (
          <div className="mt-auto">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-[color:var(--color-ink-600)]">종합</span>
              <span className={`font-display text-2xl font-bold ${meta.color}`}>
                {Math.round(score.total)}
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/60">
              <div
                className={`h-full ${
                  grade === 'S'
                    ? 'bg-gradient-to-r from-yellow-400 to-pink-400'
                    : grade === 'A'
                      ? 'bg-purple-500'
                      : grade === 'B'
                        ? 'bg-blue-500'
                        : grade === 'C'
                          ? 'bg-gray-400'
                          : 'bg-stone-400'
                }`}
                style={{ width: `${score.total}%` }}
              />
            </div>
            <div className="mt-1 grid grid-cols-5 gap-0.5 text-[8px] text-[color:var(--color-ink-600)]">
              {(Object.keys(score.axes) as Array<keyof typeof score.axes>).map((k) => (
                <div key={k} className="text-center">
                  <span title={AXIS_LABELS[k]}>{Math.round(score.axes[k])}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-auto text-center text-[10px] text-[color:var(--color-ink-600)]">
            (벤치마크 측정 대기)
          </p>
        )}
      </div>
    </div>
  );
}
