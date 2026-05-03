'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
          className={`rounded-card px-4 py-3 text-sm leading-relaxed md:text-base ${
            isUser
              ? 'whitespace-pre-wrap bg-brand-500 text-white'
              : 'bg-cream-50 text-brand-900 ring-1 ring-brand-100'
          }`}
        >
          {isUser ? (
            message.content || (streaming ? <TypingDots /> : '')
          ) : message.content ? (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-bold text-brand-900">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => (
                    <code className="rounded bg-brand-100 px-1 py-0.5 font-mono text-[0.85em]">
                      {children}
                    </code>
                  ),
                  ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-0.5">{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 underline"
                    >
                      {children}
                    </a>
                  ),
                  h1: ({ children }) => <p className="mt-2 mb-1 text-base font-bold">{children}</p>,
                  h2: ({ children }) => <p className="mt-2 mb-1 text-base font-bold">{children}</p>,
                  h3: ({ children }) => <p className="mt-2 mb-1 font-bold">{children}</p>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : streaming ? (
            <TypingDots />
          ) : null}
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
