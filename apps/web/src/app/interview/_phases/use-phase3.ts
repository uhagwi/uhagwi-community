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
  runPhase4: (phase3Messages: ChatMessage[]) => Promise<void>;
}

export function usePhase3({ state, setState, streaming, setStreaming, setError, abortRef, runPhase4 }: Args) {
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
        if (!res.ok) throw new Error(await extractErrorDetail(res));
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
    [
      state.phase3Messages,
      state.phase3Done,
      state.phase2Result,
      streaming,
      setState,
      setStreaming,
      setError,
      abortRef,
      runPhase4,
    ],
  );

  const completePhase3 = useCallback(() => {
    if (state.phase3Messages.length < 4) return;
    setState((s) => ({ ...s, phase3Done: true }));
    runPhase4(state.phase3Messages);
  }, [state.phase3Messages, runPhase4, setState]);

  return { sendPhase3Message, completePhase3 };
}
