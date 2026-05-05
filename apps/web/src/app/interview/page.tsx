'use client';

/**
 * 우하귀 인터뷰 v0.6 — 4 Phase 분리 흐름 (컨테이너).
 * 섹션은 _sections/ (StartScreen · ProgressHeader · StatusCards)로 분할.
 */

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ChatInput } from './components/ChatInput';
import { TaskRecommendCard } from './components/TaskRecommendCard';
import { AutomationDistillCard } from './components/AutomationDistillCard';
import { useV6State } from './use-chat-state';
import { StartScreen } from './_sections/StartScreen';
import { ProgressHeader, CompleteBar } from './_sections/ProgressHeader';
import { ChatList, LoadingCard, ErrorCard } from './_sections/StatusCards';

export default function InterviewPage() {
  const {
    hydrated, state, streaming, error,
    startInterview, sendPhase1Message, completePhase1,
    retryPhase2, advanceToPhase3,
    sendPhase3Message, completePhase3,
    retryPhase4, reset,
  } = useV6State();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [
    state.phase,
    state.phase1Messages.length,
    state.phase3Messages.length,
    streaming,
    state.phase2Loading,
    state.phase4Loading,
  ]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[760px] py-16 text-center">
        <p className="text-sm text-[color:var(--color-ink-600)]">불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-4rem)] flex-col md:-mx-6 md:-my-12">
      <ProgressHeader
        phase={state.phase}
        phase2Loading={state.phase2Loading}
        phase4Loading={state.phase4Loading}
        onReset={reset}
      />

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[760px] space-y-4">
          {state.phase === 0 ? (
            <StartScreen onStart={startInterview} />
          ) : state.phase === 1 ? (
            <ChatList messages={state.phase1Messages} streaming={streaming} />
          ) : state.phase === 2 ? (
            state.phase2Loading ? (
              <LoadingCard
                emoji="🔬"
                title="업무 분석 중…"
                detail="Opus 4.7이 Phase 1 인터뷰를 깊이 분석하고 있어요. 30~60초 걸려요."
              />
            ) : state.phase2Result ? (
              <TaskRecommendCard result={state.phase2Result} onAdvance={advanceToPhase3} />
            ) : state.phase2Error ? (
              <ErrorCard
                title="Phase 2 분석 실패"
                detail={state.phase2Error}
                onRetry={retryPhase2}
                retryLabel="🔄 분석 다시 시도"
              />
            ) : null
          ) : state.phase === 3 ? (
            <ChatList messages={state.phase3Messages} streaming={streaming} />
          ) : state.phase === 4 ? (
            state.phase4Loading ? (
              <LoadingCard
                emoji="🎯"
                title="자동화 후보 도출 중…"
                detail="Opus 4.7이 Phase 1+2+3 통합해 자동화 후보를 정제하고 있어요."
              />
            ) : state.phase4Result ? (
              <AutomationDistillCard result={state.phase4Result} />
            ) : state.phase4Error ? (
              <ErrorCard
                title="Phase 4 분석 실패"
                detail={state.phase4Error}
                onRetry={retryPhase4}
                retryLabel="🔄 자동화 후보 다시 시도"
              />
            ) : null
          ) : null}

          {error ? (
            <div className="rounded-card border border-[color:var(--color-danger)] bg-red-50 px-4 py-3 text-xs text-[color:var(--color-danger)]">
              {error}
            </div>
          ) : null}

          <div ref={scrollRef} />
        </div>
      </main>

      {state.phase === 1 && !state.phase1Done ? (
        <>
          <CompleteBar
            visible={state.phase1Messages.length >= 4}
            label={`이 대화로 분석 받기 (지금까지 ${Math.ceil(state.phase1Messages.length / 2)}턴)`}
            disabled={streaming || state.phase2Loading}
            onComplete={completePhase1}
          />
          <ChatInput
            onSend={sendPhase1Message}
            disabled={streaming || state.phase2Loading}
            totalMessages={state.phase1Messages.length}
            placeholder={streaming ? '도반이 답하는 중…' : '편하게 답해주세요. 짧아도 충분해요.'}
          />
        </>
      ) : state.phase === 3 && !state.phase3Done ? (
        <>
          <CompleteBar
            visible={state.phase3Messages.length >= 4}
            label={`이 대화로 자동화 후보 받기 (지금까지 ${Math.ceil(state.phase3Messages.length / 2)}턴)`}
            disabled={streaming || state.phase4Loading}
            onComplete={completePhase3}
          />
          <ChatInput
            onSend={sendPhase3Message}
            disabled={streaming || state.phase4Loading}
            totalMessages={state.phase3Messages.length}
            placeholder={streaming ? '도반이 답하는 중…' : '편하게 답해주세요. "없어요"도 OK.'}
          />
        </>
      ) : state.phase === 4 && state.phase4Result ? (
        <footer className="border-t border-brand-100 bg-cream-50 px-4 py-4 md:px-6">
          <div className="mx-auto max-w-[760px]">
            <Link href="/" className="btn-cta block w-full text-center">
              홈으로 돌아가기 →
            </Link>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
