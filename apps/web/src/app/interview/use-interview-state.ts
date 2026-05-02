'use client';

/**
 * 우하귀 인터뷰 상태 hook — localStorage 영속.
 * 응답 누적·다음 문항 진행·종료 처리.
 */

import { useCallback, useEffect, useState } from 'react';
import { FLAT_QUESTIONS, TOTAL_QUESTIONS } from './questions';

const STORAGE_KEY = 'uhagwi.interview.v0_1';

export type InterviewAnswers = Record<string, string>;

export type InterviewState = {
  currentIndex: number;
  answers: InterviewAnswers;
  done: boolean;
  startedAt: string | null;
  finishedAt: string | null;
};

const INITIAL_STATE: InterviewState = {
  currentIndex: 0,
  answers: {},
  done: false,
  startedAt: null,
  finishedAt: null,
};

function loadState(): InterviewState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return { ...INITIAL_STATE, ...JSON.parse(raw) };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: InterviewState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage 용량 초과 등 무시 */
  }
}

export function useInterviewState() {
  const [state, setState] = useState<InterviewState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      startedAt: prev.startedAt ?? new Date().toISOString(),
    }));
  }, []);

  const answer = useCallback((id: string, text: string) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [id]: text },
    }));
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      const nextIdx = prev.currentIndex + 1;
      if (nextIdx >= TOTAL_QUESTIONS) {
        return {
          ...prev,
          currentIndex: TOTAL_QUESTIONS,
          done: true,
          finishedAt: new Date().toISOString(),
        };
      }
      return { ...prev, currentIndex: nextIdx };
    });
  }, []);

  const prev = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: Math.max(0, s.currentIndex - 1),
      done: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportJson = useCallback(() => {
    const payload = {
      version: 'v0.1',
      startedAt: state.startedAt,
      finishedAt: state.finishedAt,
      answers: FLAT_QUESTIONS.map((q) => ({
        id: q.id,
        section: q.sectionTitle,
        question: q.text,
        answer: state.answers[q.id] ?? '',
      })),
    };
    return JSON.stringify(payload, null, 2);
  }, [state]);

  const currentQuestion = FLAT_QUESTIONS[Math.min(state.currentIndex, TOTAL_QUESTIONS - 1)];
  const answeredCount = Object.keys(state.answers).filter((k) => state.answers[k]?.trim()).length;
  const progressPct = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

  return {
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
  };
}
