'use client';

/**
 * 우하귀 인터뷰 v0.6 — 4 Phase 분리 흐름.
 *
 * Phase 0: 시작 화면 (4단계 안내)
 * Phase 1: 사람 파악 인터뷰 (Haiku, 10~15턴)
 * Phase 2: 업무 추천 결과 카드 (Opus 자동, TaskRecommendCard)
 * Phase 3: 자동화 욕구 인터뷰 (Haiku, 5~12턴)
 * Phase 4: 자동화 후보 결과 카드 (Opus 자동, AutomationDistillCard)
 */

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TaskRecommendCard } from './components/TaskRecommendCard';
import { AutomationDistillCard } from './components/AutomationDistillCard';
import { useV6State } from './use-chat-state';

export default function InterviewPage() {
  const {
    hydrated,
    state,
    streaming,
    error,
    startInterview,
    sendPhase1Message,
    retryPhase2,
    advanceToPhase3,
    sendPhase3Message,
    retryPhase4,
    reset,
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
      {/* 헤더 + 진행 인디케이터 */}
      <header className="border-b border-brand-100 bg-cream-50 px-4 py-3 md:px-6">
        <div className="mx-auto max-w-[760px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-brand-900">🌊 우하귀 진단 도반</p>
              <p className="text-xs text-[color:var(--color-ink-600)]">
                {phaseLabel(state.phase, state.phase2Loading, state.phase4Loading)}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="btn-ghost text-xs">
                홈
              </Link>
              {state.phase > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('정말 처음부터 다시 시작할까요? 지금까지 데이터는 사라져요.'))
                      reset();
                  }}
                  className="btn-ghost text-xs"
                >
                  처음부터
                </button>
              ) : null}
            </div>
          </div>
          {state.phase > 0 ? <PhaseProgress phase={state.phase} /> : null}
        </div>
      </header>

      {/* 본문 */}
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

      {/* 입력 영역 — Phase 1·3에서만 */}
      {state.phase === 1 && !state.phase1Done ? (
        <ChatInput
          onSend={sendPhase1Message}
          disabled={streaming || state.phase2Loading}
          totalMessages={state.phase1Messages.length}
          placeholder={streaming ? '도반이 답하는 중…' : '편하게 답해주세요. 짧아도 충분해요.'}
        />
      ) : state.phase === 3 && !state.phase3Done ? (
        <ChatInput
          onSend={sendPhase3Message}
          disabled={streaming || state.phase4Loading}
          totalMessages={state.phase3Messages.length}
          placeholder={
            streaming ? '도반이 답하는 중…' : '편하게 답해주세요. "없어요"도 OK.'
          }
        />
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

function phaseLabel(
  phase: number,
  p2Loading: boolean,
  p4Loading: boolean,
): string {
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
          className={`h-1 flex-1 rounded-full ${
            phase >= p ? 'bg-brand-500' : 'bg-cream-200'
          }`}
          aria-label={`Phase ${p} ${phase >= p ? '진행됨' : '대기'}`}
        />
      ))}
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

function ChatList({
  messages,
  streaming,
}: {
  messages: { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }[];
  streaming: boolean;
}) {
  return (
    <div className="space-y-4">
      {messages.map((m, i) => (
        <ChatMessage
          key={m.id}
          message={m}
          streaming={streaming && i === messages.length - 1 && m.role === 'assistant'}
        />
      ))}
    </div>
  );
}

function LoadingCard({
  emoji,
  title,
  detail,
}: {
  emoji: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="card text-center md:p-6">
      <p className="text-3xl">{emoji}</p>
      <p className="mt-3 text-sm font-bold text-brand-900">{title}</p>
      <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">{detail}</p>
    </div>
  );
}

function ErrorCard({
  title,
  detail,
  onRetry,
  retryLabel,
}: {
  title: string;
  detail: string;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <div className="card md:p-5">
      <p className="text-center text-2xl">⚠️</p>
      <p className="mt-2 text-center text-sm font-bold text-[color:var(--color-danger)]">
        {title}
      </p>
      <p className="mt-2 break-words rounded-card bg-red-50 p-3 text-xs text-[color:var(--color-ink-600)]">
        {detail}
      </p>
      <button type="button" onClick={onRetry} className="btn-cta mt-4 w-full">
        {retryLabel}
      </button>
      <p className="mt-3 text-[11px] text-[color:var(--color-ink-600)]">
        계속 실패하면 페이지 새로고침(Ctrl+Shift+R) 후 다시 시도해주세요.
      </p>
    </div>
  );
}
