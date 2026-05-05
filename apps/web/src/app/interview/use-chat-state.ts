'use client';

/**
 * 인터뷰 v0.6 — 4 Phase 상태 머신.
 *
 * Phase 0: 시작 화면
 * Phase 1: 사람 파악 인터뷰 (Haiku, 10~15턴)
 * Phase 2: 업무 추천 결과 카드 (Opus 자동 호출)
 * Phase 3: 자동화 욕구 인터뷰 (Haiku, 5~12턴)
 * Phase 4: 자동화 후보 결과 카드 (Opus 자동 호출)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { INTERVIEW_COMPLETE_TOKEN } from './system-prompt';
import type { Phase2Result, Phase4Result } from './phases';

const STORAGE_KEY = 'uhagwi.interview.v0_6';
const PHASE1_FIRST_MSG =
  '안녕하세요! 🌊 30분 정도 편하게 대화하면서 당신이 어떤 일을 하시는 분인지 알아볼게요.\n\n먼저 — 요즘 어떤 일 하시면서 지내세요?';

export type ChatRole = 'user' | 'assistant';
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type V6Phase = 0 | 1 | 2 | 3 | 4;

export type V6State = {
  phase: V6Phase;
  startedAt: string | null;
  finishedAt: string | null;

  // Phase 1: 사람 파악 인터뷰
  phase1Messages: ChatMessage[];
  phase1Done: boolean;

  // Phase 2: 업무 추천
  phase2Result: Phase2Result | null;
  phase2Error: string | null;
  phase2Loading: boolean;

  // Phase 3: 자동화 욕구 인터뷰
  phase3Messages: ChatMessage[];
  phase3Done: boolean;

  // Phase 4: 자동화 후보
  phase4Result: Phase4Result | null;
  phase4Error: string | null;
  phase4Loading: boolean;
};

const INITIAL_STATE: V6State = {
  phase: 0,
  startedAt: null,
  finishedAt: null,
  phase1Messages: [],
  phase1Done: false,
  phase2Result: null,
  phase2Error: null,
  phase2Loading: false,
  phase3Messages: [],
  phase3Done: false,
  phase4Result: null,
  phase4Error: null,
  phase4Loading: false,
};

function genId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadState(): V6State {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    // 옛 storage key 정리
    [
      'uhagwi.interview.chat.v0_2',
      'uhagwi.interview.chat.v0_3',
      'uhagwi.interview.chat.v0_4',
      'uhagwi.interview.v0_1',
    ].forEach((k) => window.localStorage.removeItem(k));

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return { ...INITIAL_STATE, ...JSON.parse(raw) };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: V6State) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 무시 */
  }
}

function makeFirstMsg(content: string): ChatMessage {
  return { id: genId(), role: 'assistant', content, createdAt: new Date().toISOString() };
}

export function useV6State() {
  const [state, setState] = useState<V6State>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  // ─── Phase 0 → 1: 인터뷰 시작 ─────────────────────────
  const startInterview = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: 1,
      startedAt: s.startedAt ?? new Date().toISOString(),
      phase1Messages:
        s.phase1Messages.length > 0 ? s.phase1Messages : [makeFirstMsg(PHASE1_FIRST_MSG)],
    }));
  }, []);

  // ─── Phase 1: 사용자 메시지 전송 → Haiku 응답 ─────────
  const sendPhase1Message = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming || state.phase1Done) return;
      setError(null);

      const userMsg: ChatMessage = {
        id: genId(),
        role: 'user',
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };
      const nextMessages = [...state.phase1Messages, userMsg];

      const aiId = genId();
      const aiPlaceholder: ChatMessage = {
        id: aiId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, phase1Messages: [...nextMessages, aiPlaceholder] }));
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/interview/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            phase: 1,
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
        const completed = acc.includes(INTERVIEW_COMPLETE_TOKEN);
        const cleaned = acc.replace(INTERVIEW_COMPLETE_TOKEN, '').trim();

        setState((s) => ({
          ...s,
          phase1Messages: s.phase1Messages.map((m) =>
            m.id === aiId ? { ...m, content: cleaned } : m,
          ),
          phase1Done: completed ? true : s.phase1Done,
        }));

        // 종료 시 Phase 2 자동 호출
        if (completed) {
          await runPhase2([...nextMessages, { ...aiPlaceholder, content: cleaned }]);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        setError(msg);
        setState((s) => ({
          ...s,
          phase1Messages: s.phase1Messages.filter((m) => m.id !== aiId),
        }));
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [state.phase1Messages, state.phase1Done, streaming],
  );

  // ─── Phase 2: 업무 추천 (Opus 자동) ───────────────────
  const runPhase2 = useCallback(async (messages: ChatMessage[]) => {
    setState((s) => ({ ...s, phase2Loading: true, phase2Error: null }));
    try {
      const res = await fetch('/api/interview/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          phase: 2,
        }),
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
      const json = (await res.json()) as { ok: boolean; result: Phase2Result };
      setState((s) => ({
        ...s,
        phase2Result: json.result,
        phase2Loading: false,
        phase: 2,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '알 수 없는 오류';
      setState((s) => ({ ...s, phase2Error: msg, phase2Loading: false }));
    }
  }, []);

  const retryPhase2 = useCallback(() => {
    if (state.phase1Messages.length < 2) return;
    runPhase2(state.phase1Messages);
  }, [state.phase1Messages, runPhase2]);

  // ─── Phase 2 → 3: 자동화 욕구 인터뷰 시작 ────────────
  const advanceToPhase3 = useCallback(() => {
    if (!state.phase2Result) return;
    const tasks = state.phase2Result.tasks.slice(0, 5);
    const taskList = tasks
      .map((t, i) => `${i + 1}. **${t.title}** (${t.domain}, ${t.frequency})`)
      .join('\n');
    const introMsg = `Phase 1 인터뷰를 보고 — 당신에게 자주 반복되는 일이 이런 것들이에요.\n\n${taskList}\n\n이 중에서 *내가 안 해도 되면 진짜 좋겠다* 싶은 일이 있으세요? (없으면 "없어요"도 OK)`;

    setState((s) => ({
      ...s,
      phase: 3,
      phase3Messages: [makeFirstMsg(introMsg)],
    }));
  }, [state.phase2Result]);

  // ─── Phase 3: 사용자 메시지 전송 ──────────────────────
  const sendPhase3Message = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming || state.phase3Done) return;
      setError(null);

      const userMsg: ChatMessage = {
        id: genId(),
        role: 'user',
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };
      const nextMessages = [...state.phase3Messages, userMsg];

      const aiId = genId();
      const aiPlaceholder: ChatMessage = {
        id: aiId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, phase3Messages: [...nextMessages, aiPlaceholder] }));
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const phase2Context = state.phase2Result
          ? JSON.stringify(state.phase2Result, null, 2)
          : undefined;

        const res = await fetch('/api/interview/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            phase: 3,
            phase2_context: phase2Context,
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
        const completed = acc.includes(INTERVIEW_COMPLETE_TOKEN);
        const cleaned = acc.replace(INTERVIEW_COMPLETE_TOKEN, '').trim();

        setState((s) => ({
          ...s,
          phase3Messages: s.phase3Messages.map((m) =>
            m.id === aiId ? { ...m, content: cleaned } : m,
          ),
          phase3Done: completed ? true : s.phase3Done,
        }));

        if (completed) {
          await runPhase4([...nextMessages, { ...aiPlaceholder, content: cleaned }]);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        setError(msg);
        setState((s) => ({
          ...s,
          phase3Messages: s.phase3Messages.filter((m) => m.id !== aiId),
        }));
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [state.phase3Messages, state.phase3Done, state.phase2Result, streaming],
  );

  // ─── Phase 4: 자동화 후보 도출 (Opus 자동) ────────────
  const runPhase4 = useCallback(
    async (phase3Messages: ChatMessage[]) => {
      setState((s) => ({ ...s, phase4Loading: true, phase4Error: null }));
      try {
        const res = await fetch('/api/interview/analyze', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            // Phase 1 messages를 messages 필드에 보냄 (서버가 Phase 1 + 2 + 3 통합)
            messages: state.phase1Messages.map((m) => ({ role: m.role, content: m.content })),
            phase: 4,
            phase2_result: state.phase2Result ? JSON.stringify(state.phase2Result) : undefined,
            phase3_messages: phase3Messages.map((m) => ({ role: m.role, content: m.content })),
          }),
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
        const json = (await res.json()) as { ok: boolean; result: Phase4Result };
        setState((s) => ({
          ...s,
          phase4Result: json.result,
          phase4Loading: false,
          phase: 4,
          finishedAt: new Date().toISOString(),
        }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        setState((s) => ({ ...s, phase4Error: msg, phase4Loading: false }));
      }
    },
    [state.phase1Messages, state.phase2Result],
  );

  const retryPhase4 = useCallback(() => {
    if (state.phase3Messages.length < 2) return;
    runPhase4(state.phase3Messages);
  }, [state.phase3Messages, runPhase4]);

  // ─── 수동 종료: Phase 1 끊고 분석으로 ────────────
  const completePhase1 = useCallback(() => {
    if (state.phase1Messages.length < 4) return; // 최소 2턴(사용자 응답 1회 이상) 필요
    setState((s) => ({ ...s, phase1Done: true }));
    runPhase2(state.phase1Messages);
  }, [state.phase1Messages, runPhase2]);

  // ─── 수동 종료: Phase 3 끊고 분석으로 ────────────
  const completePhase3 = useCallback(() => {
    if (state.phase3Messages.length < 4) return;
    setState((s) => ({ ...s, phase3Done: true }));
    runPhase4(state.phase3Messages);
  }, [state.phase3Messages, runPhase4]);

  // ─── 초기화 ──────────────────────────────────────
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
    setError(null);
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    hydrated,
    state,
    streaming,
    error,
    startInterview,
    sendPhase1Message,
    completePhase1,
    retryPhase2,
    advanceToPhase3,
    sendPhase3Message,
    completePhase3,
    retryPhase4,
    reset,
  };
}
