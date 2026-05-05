'use client';

import { useCallback } from 'react';
import { INTERVIEW_COMPLETE_TOKEN } from '../system-prompt';
import {
  type ChatMessage,
  type V6State,
  extractErrorDetail,
  genId,
} from './state';

interface Args {
  state: V6State;
  setState: React.Dispatch<React.SetStateAction<V6State>>;
  streaming: boolean;
  setStreaming: (b: boolean) => void;
  setError: (s: string | null) => void;
  abortRef: React.MutableRefObject<AbortController | null>;
  runPhase2: (messages: ChatMessage[]) => Promise<void>;
}

export function usePhase1({ state, setState, streaming, setStreaming, setError, abortRef, runPhase2 }: Args) {
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
        if (!res.ok) throw new Error(await extractErrorDetail(res));
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
    [state.phase1Messages, state.phase1Done, streaming, setState, setStreaming, setError, abortRef, runPhase2],
  );

  const completePhase1 = useCallback(() => {
    if (state.phase1Messages.length < 4) return;
    setState((s) => ({ ...s, phase1Done: true }));
    runPhase2(state.phase1Messages);
  }, [state.phase1Messages, runPhase2, setState]);

  return { sendPhase1Message, completePhase1 };
}
