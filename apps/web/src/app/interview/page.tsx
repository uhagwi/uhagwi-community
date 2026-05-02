'use client';

/**
 * 우하귀 인터뷰 v0.2 — 챗봇 기반 자연 대화 진단.
 *
 * 흐름:
 * 1. 첫 진입 시 AI 인사 자동 표시
 * 2. 사용자 답변 → Anthropic Haiku 4.5 스트리밍 응답
 * 3. AI가 5 영역 자연 대화로 cover (15~25턴)
 * 4. AI가 충분하다 판단 → [INTERVIEW_COMPLETE] 토큰 → 자동으로 Opus 4.7 종합 분석
 * 5. 페르소나 + 자동화 후보 톱5 카드 표시
 *
 * v0.1 시퀀셜 폼은 폐기됨 (questions.ts 데이터는 system-prompt 가이드로 활용).
 */

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { AnalysisCard } from './components/AnalysisCard';
import { useChatState } from './use-chat-state';

export default function InterviewPage() {
  const { hydrated, state, streaming, error, sendUser, reset, exportJson } =
    useChatState();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지·스트리밍 시 하단 스크롤
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.messages.length, streaming, state.analyzing, state.analysis]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[760px] py-16 text-center">
        <p className="text-sm text-[color:var(--color-ink-600)]">불러오는 중…</p>
      </div>
    );
  }

  const lastMsg = state.messages[state.messages.length - 1];
  const lastIsAssistant = lastMsg?.role === 'assistant';

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-4rem)] flex-col md:-mx-6 md:-my-12">
      {/* 헤더 */}
      <div className="border-b border-brand-100 bg-cream-50 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[760px] items-center justify-between">
          <div>
            <p className="text-sm font-bold text-brand-900">🌊 우하귀 진단 도반</p>
            <p className="text-xs text-[color:var(--color-ink-600)]">
              {state.done
                ? '진단 완료 — 결과는 아래'
                : state.analyzing
                  ? '대화 종료 · 종합 분석 중…'
                  : '편하게 대화해주세요. 30분 정도면 충분해요.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost text-xs">
              홈
            </Link>
            <button
              type="button"
              onClick={() => {
                if (confirm('정말 처음부터 다시 시작할까요? 지금까지 대화는 사라져요.')) reset();
              }}
              className="btn-ghost text-xs"
            >
              처음부터
            </button>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[760px] space-y-4">
          {state.messages.map((m, i) => (
            <ChatMessage
              key={m.id}
              message={m}
              streaming={streaming && i === state.messages.length - 1 && m.role === 'assistant'}
            />
          ))}

          {state.analyzing ? (
            <div className="card text-center md:p-5">
              <p className="text-2xl">🔬</p>
              <p className="mt-2 text-sm font-bold text-brand-900">종합 분석 중…</p>
              <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
                Opus 4.7 모델이 대화 전체를 깊이 분석하고 있어요. 30~60초 걸려요.
              </p>
            </div>
          ) : null}

          {state.analyzeError ? (
            <div className="card text-center md:p-5">
              <p className="text-sm font-bold text-[color:var(--color-danger)]">
                분석 실패
              </p>
              <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
                {state.analyzeError}
              </p>
              <p className="mt-2 text-xs text-[color:var(--color-ink-600)]">
                ANTHROPIC_API_KEY 환경변수가 Vercel에 등록되어 있는지 확인해주세요.
              </p>
            </div>
          ) : null}

          {state.analysis ? <AnalysisCard analysis={state.analysis} /> : null}

          {error ? (
            <div className="rounded-card border border-[color:var(--color-danger)] bg-red-50 px-4 py-3 text-xs text-[color:var(--color-danger)]">
              {error}
            </div>
          ) : null}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      {!state.done ? (
        <ChatInput
          onSend={sendUser}
          disabled={streaming || state.analyzing}
          placeholder={
            streaming
              ? '도반이 답하는 중…'
              : state.analyzing
                ? '분석 중…'
                : lastIsAssistant
                  ? '편하게 답해주세요. 짧아도 됩니다.'
                  : ''
          }
        />
      ) : (
        <div className="border-t border-brand-100 bg-cream-50 px-4 py-4 md:px-6">
          <div className="mx-auto flex max-w-[760px] flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                const json = exportJson();
                const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `uhagwi-interview-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="btn-ghost flex-1"
            >
              대화 JSON 다운로드
            </button>
            <Link href="/" className="btn-cta flex-1 text-center">
              홈으로 돌아가기 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
