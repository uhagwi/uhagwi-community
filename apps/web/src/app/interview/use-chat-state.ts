'use client';

/**
 * 인터뷰 v0.6 — 4 Phase 상태 머신 (합성 훅).
 *
 * Phase 0: 시작 화면
 * Phase 1: 사람 파악 인터뷰 (Haiku)        — _phases/use-phase1
 * Phase 2: 업무 추천 결과 카드 (Opus)       — _phases/use-phase2
 * Phase 3: 자동화 욕구 인터뷰 (Haiku)       — _phases/use-phase3
 * Phase 4: 자동화 후보 결과 카드 (Opus)     — _phases/use-phase4
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  INITIAL_STATE,
  PHASE1_FIRST_MSG,
  STORAGE_KEY,
  type V6State,
  loadState,
  makeFirstMsg,
  saveState,
} from './_phases/state';
import { usePhase1 } from './_phases/use-phase1';
import { usePhase2 } from './_phases/use-phase2';
import { usePhase3 } from './_phases/use-phase3';
import { usePhase4 } from './_phases/use-phase4';

export type { ChatMessage, ChatRole, V6Phase, V6State } from './_phases/state';

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

  // Phase별 훅 합성 — runPhaseN forward reference는 인자 주입 패턴으로 해결
  const { runPhase4, retryPhase4 } = usePhase4({ state, setState });
  const { sendPhase3Message, completePhase3 } = usePhase3({
    state, setState, streaming, setStreaming, setError, abortRef, runPhase4,
  });
  const { runPhase2, retryPhase2, advanceToPhase3 } = usePhase2({ state, setState });
  const { sendPhase1Message, completePhase1 } = usePhase1({
    state, setState, streaming, setStreaming, setError, abortRef, runPhase2,
  });

  const startInterview = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: 1,
      startedAt: s.startedAt ?? new Date().toISOString(),
      phase1Messages:
        s.phase1Messages.length > 0 ? s.phase1Messages : [makeFirstMsg(PHASE1_FIRST_MSG)],
    }));
  }, []);

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
