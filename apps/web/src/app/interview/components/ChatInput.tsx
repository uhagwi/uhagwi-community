'use client';

import { useEffect, useRef, useState } from 'react';

const MAX_LEN = 8000;
const WARN_LEN = 7000;
const MIN_LEN = 1;

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  totalMessages?: number;
}

export function ChatInput({ onSend, disabled, placeholder, totalMessages = 0 }: Props) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  const len = text.length;
  const overLimit = len > MAX_LEN;
  const nearLimit = len >= WARN_LEN && !overLimit;
  const tooShort = text.trim().length < MIN_LEN;
  const turnsExceeded = totalMessages >= 70; // 80 한도 대비 안전 마진

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed || disabled || overLimit || turnsExceeded) return;
    onSend(trimmed);
    setText('');
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="sticky bottom-0 border-t border-brand-100 bg-cream-50/95 backdrop-blur">
      {/* 경고 라인 */}
      {(nearLimit || overLimit || turnsExceeded) ? (
        <div className="mx-auto max-w-[760px] px-3 pt-2 md:px-4">
          {turnsExceeded ? (
            <p className="rounded-card bg-red-50 px-3 py-1.5 text-xs text-[color:var(--color-danger)]">
              ⚠️ 대화가 너무 길어졌어요 ({totalMessages}/80턴). 챗봇이 곧 자동으로 마무리해요.
            </p>
          ) : overLimit ? (
            <p className="rounded-card bg-red-50 px-3 py-1.5 text-xs text-[color:var(--color-danger)]">
              ⚠️ 메시지가 너무 길어요 ({len.toLocaleString()}자 / 최대 {MAX_LEN.toLocaleString()}자) — 줄여서 보내주세요.
            </p>
          ) : (
            <p className="rounded-card bg-yellow-50 px-3 py-1.5 text-xs text-[color:var(--color-warning,#a87a00)]">
              💡 거의 한계예요 ({len.toLocaleString()}/{MAX_LEN.toLocaleString()}자). 핵심만 짧게 적어도 충분해요.
            </p>
          )}
        </div>
      ) : null}

      <div className="p-3 md:p-4">
        <div className="mx-auto flex max-w-[760px] items-end gap-2">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder ?? '편하게 답해주세요. 짧아도 충분해요. (Enter 전송 / Shift+Enter 줄바꿈)'}
            disabled={disabled || turnsExceeded}
            rows={1}
            className={`flex-1 resize-none rounded-card border bg-white p-3 text-sm leading-relaxed text-brand-900 outline-none focus:ring-2 disabled:opacity-50 md:text-base ${
              overLimit
                ? 'border-[color:var(--color-danger)] focus:border-[color:var(--color-danger)] focus:ring-red-200'
                : 'border-brand-200 focus:border-brand-500 focus:ring-brand-200'
            }`}
            aria-label="답변 입력"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || tooShort || overLimit || turnsExceeded}
            className="btn-cta shrink-0 disabled:opacity-40"
            aria-label="전송"
          >
            전송 →
          </button>
        </div>

        {/* 글자 수 카운터 */}
        {len > 0 ? (
          <p className={`mx-auto mt-1 max-w-[760px] text-right text-[10px] ${
            overLimit ? 'text-[color:var(--color-danger)]' : nearLimit ? 'text-[color:var(--color-warning,#a87a00)]' : 'text-[color:var(--color-ink-600)]'
          }`}>
            {len.toLocaleString()} / {MAX_LEN.toLocaleString()}자
          </p>
        ) : null}
      </div>
    </div>
  );
}
