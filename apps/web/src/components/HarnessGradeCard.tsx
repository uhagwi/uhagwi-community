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
  /** 클릭 핸들러 (사용·자세히 보기 등) */
  onClick?: () => void;
}

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
  onClick,
}: Props) {
  const meta = GRADE_META[grade];

  if (!flipped) {
    // 뒷면 — 가챠 미공개 상태
    return (
      <button
        type="button"
        onClick={onClick}
        className="aspect-[3/4] w-full rounded-card border-2 border-brand-200 bg-gradient-to-br from-cream-100 to-brand-50 transition hover:scale-[1.02] hover:shadow-float"
        aria-label="카드 뒤집기"
      >
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <p className="text-5xl">🎴</p>
          <p className="text-xs font-bold text-brand-600">우하귀 카드</p>
          <p className="text-[10px] text-[color:var(--color-ink-600)]">탭하여 뒤집기</p>
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
