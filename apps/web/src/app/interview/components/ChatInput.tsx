'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
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
    <div className="sticky bottom-0 border-t border-brand-100 bg-cream-50/95 p-3 backdrop-blur md:p-4">
      <div className="mx-auto flex max-w-[760px] items-end gap-2">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder ?? '편하게 답해주세요. 짧아도 됩니다. (Enter 전송 / Shift+Enter 줄바꿈)'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-card border border-brand-200 bg-white p-3 text-sm leading-relaxed text-brand-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-50 md:text-base"
          aria-label="답변 입력"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
          className="btn-cta shrink-0 disabled:opacity-40"
          aria-label="전송"
        >
          전송 →
        </button>
      </div>
    </div>
  );
}
