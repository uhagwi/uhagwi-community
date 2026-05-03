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
  const { hydrated, state, streaming, error, sendUser, reset, retryAnalyze, exportJson } =
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
  const totalMsgs = state.messages.length;
  // v0.4: 13~18턴 권장. 메시지 수 = 사용자+AI 합계 (1턴 = 2메시지)
  const turnsWarn = totalMsgs >= 30 && totalMsgs < 38 && !state.done; // 15~18턴 임박
  const turnsCritical = totalMsgs >= 38 && !state.done; // 19턴 초과 임박

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
                  ? '대화 종료 · 5 차원 종합 분석 중…'
                  : `편하게 답해주세요 · ${Math.ceil(totalMsgs / 2)}/18턴 (13~18턴 권장)`}
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

      {/* 사전 경고 배너 */}
      {turnsCritical || turnsWarn ? (
        <div className="border-b border-brand-100 bg-yellow-50 px-4 py-2 text-xs md:px-6">
          <p className="mx-auto max-w-[760px] text-[color:var(--color-warning,#a87a00)]">
            {turnsCritical
              ? `⚠️ 대화가 길어졌어요 (${Math.ceil(totalMsgs / 2)}턴) — 챗봇이 곧 자동으로 정리할 거예요.`
              : `💡 진단 거의 끝나가요 (${Math.ceil(totalMsgs / 2)}/18턴). 곧 챗봇이 마무리해요.`}
          </p>
        </div>
      ) : null}

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
            <div className="card md:p-5">
              <p className="text-center text-2xl">⚠️</p>
              <p className="mt-2 text-center text-sm font-bold text-[color:var(--color-danger)]">
                분석 실패 — 자동 재시도 안 됨
              </p>
              <p className="mt-2 break-words rounded-card bg-red-50 p-3 text-xs text-[color:var(--color-ink-600)]">
                {state.analyzeError}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={retryAnalyze}
                  disabled={state.analyzing}
                  className="btn-cta flex-1 disabled:opacity-50"
                >
                  {state.analyzing ? '분석 중…' : '🔄 분석 다시 시도'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('대화는 유지되고 분석만 다시 시도해요. 인터뷰부터 다시 하려면 "처음부터" 버튼을 누르세요.')) {
                      retryAnalyze();
                    }
                  }}
                  className="btn-ghost flex-1"
                >
                  새로고침 후 다시 시도
                </button>
              </div>
              <p className="mt-3 text-[11px] text-[color:var(--color-ink-600)]">
                계속 실패하면 페이지 새로고침(Ctrl+Shift+R) 후 *분석 다시 시도* 버튼을 눌러주세요.
                Vercel 빌드가 적용되는데 1~3분 걸릴 수 있어요.
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
          totalMessages={totalMsgs}
          placeholder={
            streaming
              ? '도반이 답하는 중…'
              : state.analyzing
                ? '분석 중…'
                : lastIsAssistant
                  ? '짧게 답해도 충분해요'
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
