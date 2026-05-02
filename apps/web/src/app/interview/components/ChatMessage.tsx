'use client';

import type { ChatMessage as MessageType } from '../use-chat-state';

interface Props {
  message: MessageType;
  streaming?: boolean;
}

export function ChatMessage({ message, streaming }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser ? (
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base">
            🌊
          </div>
        ) : null}
        <div
          className={`whitespace-pre-wrap rounded-card px-4 py-3 text-sm leading-relaxed md:text-base ${
            isUser
              ? 'bg-brand-500 text-white'
              : 'bg-cream-50 text-brand-900 ring-1 ring-brand-100'
          }`}
        >
          {message.content || (streaming ? <TypingDots /> : '')}
          {streaming && message.content ? <span className="ml-1 animate-pulse">▍</span> : null}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 text-[color:var(--color-ink-600)]">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: '0ms' }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: '300ms' }} />
    </span>
  );
}
