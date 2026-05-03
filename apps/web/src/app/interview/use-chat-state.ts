'use client';

/**
 * 인터뷰 챗봇 상태 hook — localStorage 영속 + 스트리밍.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { INTERVIEW_COMPLETE_TOKEN } from './system-prompt';

// v0.4부터 storage key 변경 — 옛 v0.2/v0.3 캐시(dimensions·category 없음)와 호환 안 됨
const STORAGE_KEY = 'uhagwi.interview.chat.v0_4';
const FIRST_AI_MESSAGE =
  '안녕하세요! 30분 정도 편하게 대화하면서 당신 일을 알아볼게요.\n\n먼저 본인 소개부터 — 어떤 일 하시는 분이세요?';

export type ChatRole = 'user' | 'assistant';
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type AutoCandidate = {
  rank: number;
  category: 'daily' | 'weekly' | 'one_time' | 'social';
  title: string;
  domain: string;
  why: string;
  estimated_save_min_per_week: number;
};

export type Dimension = {
  score: number;
  evidence: string[];
  interpretation: string;
};

export type AnalyzeResult = {
  persona_code: string;
  persona_name_kr: string;
  summary: string;
  dimensions: {
    domain_breadth: Dimension;
    automation_drive: Dimension;
    systems_thinking: Dimension;
    exploration: Dimension;
    externalization: Dimension;
  };
  strengths: string[];
  watch_outs: string[];
  auto_candidates: AutoCandidate[];
  total_save_min_per_week: number;
  recommended_first_demo: number;
  creature_type: 'coder' | 'writer' | 'analyst' | 'designer' | 'researcher';
  creature_personality: string;
};

export type ChatState = {
  messages: ChatMessage[];
  startedAt: string | null;
  finishedAt: string | null;
  done: boolean;
  analysis: AnalyzeResult | null;
  analyzeError: string | null;
  analyzing: boolean;
};

const INITIAL_STATE: ChatState = {
  messages: [],
  startedAt: null,
  finishedAt: null,
  done: false,
  analysis: null,
  analyzeError: null,
  analyzing: false,
};

function loadState(): ChatState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    // v0.2/v0.3 옛 storage key 자동 정리 (호환 X)
    window.localStorage.removeItem('uhagwi.interview.chat.v0_2');
    window.localStorage.removeItem('uhagwi.interview.chat.v0_3');
    window.localStorage.removeItem('uhagwi.interview.v0_1');

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<ChatState>;

    // 옛 schema 분석 결과(dimensions·category 없음) 감지 → 분석만 폐기, 대화는 유지
    if (
      parsed.analysis &&
      (!parsed.analysis.dimensions ||
        !parsed.analysis.auto_candidates?.[0]?.category)
    ) {
      return { ...INITIAL_STATE, ...parsed, analysis: null };
    }

    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: ChatState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 용량 초과 등 무시 */
  }
}

function genId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useChatState() {
  const [state, setState] = useState<ChatState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const loaded = loadState();
    if (loaded.messages.length === 0 && !loaded.startedAt) {
      // 첫 진입 — AI 인사 자동 삽입
      setState({
        ...loaded,
        startedAt: new Date().toISOString(),
        messages: [
          {
            id: genId(),
            role: 'assistant',
            content: FIRST_AI_MESSAGE,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    } else {
      setState(loaded);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const sendUser = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming || state.done) return;
      setError(null);

      const userMsg: ChatMessage = {
        id: genId(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      // 메시지 추가 후 즉시 history 캡처
      const nextMessages = [...state.messages, userMsg];
      setState((s) => ({ ...s, messages: nextMessages }));

      // AI 메시지 placeholder 추가 (스트리밍 채울 자리)
      const aiId = genId();
      const aiPlaceholder: ChatMessage = {
        id: aiId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, messages: [...nextMessages, aiPlaceholder] }));
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/interview/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let detail = `HTTP ${res.status}`;
          try {
            const errJson = await res.json();
            detail = errJson.detail ?? detail;
          } catch {
            const txt = await res.text();
            detail = txt.slice(0, 300) || detail;
          }
          throw new Error(detail);
        }

        const json = (await res.json()) as { text: string };
        const acc = json.text;

        // 종료 토큰 감지
        const completed = acc.includes(INTERVIEW_COMPLETE_TOKEN);
        const cleaned = acc.replace(INTERVIEW_COMPLETE_TOKEN, '').trim();

        // 응답 + 종료 처리 한 번에
        setState((s) => ({
          ...s,
          messages: s.messages.map((m) => (m.id === aiId ? { ...m, content: cleaned } : m)),
          done: completed ? true : s.done,
          finishedAt: completed ? new Date().toISOString() : s.finishedAt,
        }));

        // 종료 시 Opus 분석 자동 호출
        if (completed) {
          setState((s) => ({ ...s, analyzing: true, analyzeError: null }));
          try {
            const finalMessages = [...nextMessages, { ...aiPlaceholder, content: cleaned }];
            const ar = await fetch('/api/interview/analyze', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                messages: finalMessages.map((m) => ({ role: m.role, content: m.content })),
              }),
            });
            if (!ar.ok) {
              const txt = await ar.text();
              throw new Error(`HTTP ${ar.status}: ${txt.slice(0, 300)}`);
            }
            const json = (await ar.json()) as { ok: boolean; result: AnalyzeResult };
            setState((s) => ({ ...s, analysis: json.result, analyzing: false }));
          } catch (err) {
            const msg = err instanceof Error ? err.message : '알 수 없는 오류';
            setState((s) => ({ ...s, analyzeError: msg, analyzing: false }));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        setError(msg);
        // placeholder 제거
        setState((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== aiId) }));
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [state.messages, state.done, streaming],
  );

  const retryAnalyze = useCallback(async () => {
    if (state.messages.length < 2) return;
    setState((s) => ({ ...s, analyzing: true, analyzeError: null }));
    try {
      const ar = await fetch('/api/interview/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: state.messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!ar.ok) {
        let detail = `HTTP ${ar.status}`;
        try {
          const errJson = await ar.json();
          detail = errJson.detail ?? detail;
        } catch {
          const txt = await ar.text();
          detail = txt.slice(0, 300) || detail;
        }
        throw new Error(detail);
      }
      const json = (await ar.json()) as { ok: boolean; result: AnalyzeResult };
      setState((s) => ({ ...s, analysis: json.result, analyzing: false }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '알 수 없는 오류';
      setState((s) => ({ ...s, analyzeError: msg, analyzing: false }));
    }
  }, [state.messages]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
    setError(null);
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
    // 첫 메시지 자동 재삽입
    setTimeout(() => {
      setState({
        messages: [
          {
            id: genId(),
            role: 'assistant',
            content: FIRST_AI_MESSAGE,
            createdAt: new Date().toISOString(),
          },
        ],
        startedAt: new Date().toISOString(),
        finishedAt: null,
        done: false,
        analysis: null,
        analyzeError: null,
        analyzing: false,
      });
    }, 50);
  }, []);

  const exportJson = useCallback(() => {
    return JSON.stringify(
      {
        version: 'v0.2-chat',
        startedAt: state.startedAt,
        finishedAt: state.finishedAt,
        messages: state.messages.map((m) => ({
          role: m.role,
          content: m.content,
          at: m.createdAt,
        })),
      },
      null,
      2,
    );
  }, [state]);

  return {
    hydrated,
    state,
    streaming,
    error,
    sendUser,
    reset,
    retryAnalyze,
    exportJson,
  };
}
