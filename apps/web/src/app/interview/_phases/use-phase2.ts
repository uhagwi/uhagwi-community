'use client';

import { useCallback } from 'react';
import type { Phase2Result } from '../phases';
import {
  type ChatMessage,
  type V6State,
  extractErrorDetail,
  makeFirstMsg,
} from './state';

interface Args {
  state: V6State;
  setState: React.Dispatch<React.SetStateAction<V6State>>;
}

export function usePhase2({ state, setState }: Args) {
  const runPhase2 = useCallback(
    async (messages: ChatMessage[]) => {
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
        if (!res.ok) throw new Error(await extractErrorDetail(res));
        const json = (await res.json()) as { ok: boolean; result: Phase2Result };
        setState((s) => ({ ...s, phase2Result: json.result, phase2Loading: false, phase: 2 }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        setState((s) => ({ ...s, phase2Error: msg, phase2Loading: false }));
      }
    },
    [setState],
  );

  const retryPhase2 = useCallback(() => {
    if (state.phase1Messages.length < 2) return;
    runPhase2(state.phase1Messages);
  }, [state.phase1Messages, runPhase2]);

  const advanceToPhase3 = useCallback(() => {
    if (!state.phase2Result) return;
    const tasks = state.phase2Result.tasks.slice(0, 5);
    const taskList = tasks
      .map((t, i) => `${i + 1}. **${t.title}** (${t.domain}, ${t.frequency})`)
      .join('\n');
    const introMsg = `Phase 1 인터뷰를 보고 — 당신에게 자주 반복되는 일이 이런 것들이에요.\n\n${taskList}\n\n이 중에서 *내가 안 해도 되면 진짜 좋겠다* 싶은 일이 있으세요? (없으면 "없어요"도 OK)`;

    setState((s) => ({ ...s, phase: 3, phase3Messages: [makeFirstMsg(introMsg)] }));
  }, [state.phase2Result, setState]);

  return { runPhase2, retryPhase2, advanceToPhase3 };
}
