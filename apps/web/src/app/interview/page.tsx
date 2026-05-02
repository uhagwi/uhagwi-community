'use client';

/**
 * 우하귀 인터뷰 `/interview` — Stage 1 진단의 1차 입력.
 * 30문항 시퀀셜, localStorage 영속, Ctrl+Enter 단축키.
 *
 * 다음 단계 (다음 세션 구현 대기):
 * - 응답 → Anthropic API → 페르소나 진술 + 자동화 후보 진단
 * - 결과 페이지(/result) — A+B+C+F+J 5종 디자인
 * - creature 1마리 부여, MCP 설치 가이드, Pro 결제 게이트
 */

import Link from 'next/link';
import { QuestionCard } from './components/QuestionCard';
import { InterviewSummary } from './components/InterviewSummary';
import { useInterviewState } from './use-interview-state';
import { TOTAL_QUESTIONS } from './questions';

export default function InterviewPage() {
  const {
    hydrated,
    state,
    currentQuestion,
    answeredCount,
    progressPct,
    start,
    answer,
    next,
    prev,
    reset,
    exportJson,
  } = useInterviewState();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[680px] py-16 text-center">
        <p className="text-sm text-[color:var(--color-ink-600)]">불러오는 중…</p>
      </div>
    );
  }

  // 종료 상태
  if (state.done) {
    return (
      <div className="mx-auto max-w-[760px]">
        <InterviewSummary
          answers={state.answers}
          startedAt={state.startedAt}
          finishedAt={state.finishedAt}
          exportJson={exportJson}
          onReset={reset}
        />
      </div>
    );
  }

  // 시작 전 화면
  if (!state.startedAt && state.currentIndex === 0 && answeredCount === 0) {
    return <StartScreen onStart={start} />;
  }

  // 인터뷰 진행 중 (currentQuestion은 hydrated && !done 일 때만 사용)
  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-[680px] py-16 text-center">
        <p className="text-sm text-[color:var(--color-ink-600)]">불러오는 중…</p>
      </div>
    );
  }
  const cq = currentQuestion;
  return (
    <div className="mx-auto max-w-[760px] space-y-5">
      <ProgressBar
        currentIndex={state.currentIndex}
        answeredCount={answeredCount}
        progressPct={progressPct}
      />
      <QuestionCard
        question={cq}
        initialAnswer={state.answers[cq.id] ?? ''}
        onSubmit={(text) => {
          answer(cq.id, text);
          next();
        }}
        onPrev={prev}
        onSkip={next}
        isFirst={state.currentIndex === 0}
        isLast={state.currentIndex === TOTAL_QUESTIONS - 1}
      />
      <p className="text-center text-[11px] text-[color:var(--color-ink-600)]">
        답변은 자동으로 브라우저에 저장됩니다 — 닫고 나중에 이어가도 됩니다.
      </p>
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-[680px] py-8">
      <div className="card text-center md:p-10">
        <p className="text-4xl">🌊</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-900 md:text-3xl">
          AI가 진단하고, AI가 일한다.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-600)] md:text-base">
          30분이면 AI가 당신 일을 알아냅니다.
          <br />
          5섹션 30문항 — 짧게 답해도 됩니다. 모르면 건너뛰셔도 됩니다.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 text-left text-xs md:grid-cols-5 md:text-sm">
          <Section label="정체성" />
          <Section label="도메인·일과" />
          <Section label="도구" />
          <Section label="고통·욕망" />
          <Section label="학습·진화" />
        </div>

        <button type="button" onClick={onStart} className="btn-cta mt-7 w-full sm:w-auto">
          시작하기 →
        </button>

        <p className="mt-4 text-xs text-[color:var(--color-ink-600)]">
          답변은 자동 저장됩니다 (브라우저 localStorage). 다음 세션에서 페르소나 진단으로 이어집니다.
          <br />
          <Link href="/" className="underline hover:text-brand-700">
            ← 홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

function Section({ label }: { label: string }) {
  return (
    <div className="rounded-card bg-cream-50 px-3 py-2 text-center">
      <span className="text-brand-800">{label}</span>
    </div>
  );
}

function ProgressBar({
  currentIndex,
  answeredCount,
  progressPct,
}: {
  currentIndex: number;
  answeredCount: number;
  progressPct: number;
}) {
  return (
    <div className="card md:p-5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-brand-700">
          진행 {currentIndex + 1} / {TOTAL_QUESTIONS}
        </span>
        <span className="text-[color:var(--color-ink-600)]">
          답변 {answeredCount}개 · {progressPct}%
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
