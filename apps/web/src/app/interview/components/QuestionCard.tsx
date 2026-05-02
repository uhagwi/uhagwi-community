'use client';

import { useEffect, useRef, useState } from 'react';
import type { FlatQuestion } from '../questions';

interface Props {
  question: FlatQuestion;
  initialAnswer: string;
  onSubmit: (text: string) => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function QuestionCard({ question, initialAnswer, onSubmit, onPrev, onSkip, isFirst, isLast }: Props) {
  const [text, setText] = useState(initialAnswer);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(initialAnswer);
    ref.current?.focus();
  }, [question.id, initialAnswer]);

  function handleSubmit() {
    onSubmit(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="card md:p-8">
      <p className="text-xs font-medium text-brand-600">{question.sectionTitle}</p>
      <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
        {question.index} / {question.total}
      </p>
      <h2 className="mt-4 text-lg font-bold leading-relaxed text-brand-900 md:text-xl">
        {question.text}
      </h2>

      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={question.placeholder ?? '자유롭게 답해주세요. 짧아도 됩니다. (Ctrl+Enter로 다음)'}
        rows={5}
        className="mt-5 w-full rounded-card border border-brand-200 bg-cream-50 p-4 text-sm leading-relaxed text-brand-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-base"
        aria-label={`답변 입력 ${question.index}번`}
      />

      <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="btn-ghost disabled:opacity-40"
        >
          ← 이전
        </button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={onSkip} className="btn-ghost">
            건너뛰기
          </button>
          <button type="button" onClick={handleSubmit} className="btn-cta">
            {isLast ? '진단 마치기 ✓' : '다음 →'}
          </button>
        </div>
      </div>

      <p className="mt-3 text-right text-[11px] text-[color:var(--color-ink-600)]">
        Ctrl+Enter로 다음
      </p>
    </div>
  );
}
