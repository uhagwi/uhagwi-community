'use client';

import { useCallback } from 'react';
import type { Phase4Result } from '../phases';
import { type ChatMessage, type V6State, extractErrorDetail } from './state';

interface Args {
  state: V6State;
  setState: React.Dispatch<React.SetStateAction<V6State>>;
}

export function usePhase4({ state, setState }: Args) {
  const runPhase4 = useCallback(
    async (phase3Messages: ChatMessage[]) => {
      setState((s) => ({ ...s, phase4Loading: true, phase4Error: null }));
      try {
        const res = await fetch('/api/interview/analyze', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            messages: state.phase1Messages.map((m) => ({ role: m.role, content: m.content })),
            phase: 4,
            phase2_result: state.phase2Result ? JSON.stringify(state.phase2Result) : undefined,
            phase3_messages: phase3Messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok) throw new Error(await extractErrorDetail(res));
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
    [state.phase1Messages, state.phase2Result, setState],
  );

  const retryPhase4 = useCallback(() => {
    if (state.phase3Messages.length < 2) return;
    runPhase4(state.phase3Messages);
  }, [state.phase3Messages, runPhase4]);

  return { runPhase4, retryPhase4 };
}
