import { ChatMessage } from '../components/ChatMessage';

export function ChatList({
  messages,
  streaming,
}: {
  messages: { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }[];
  streaming: boolean;
}) {
  return (
    <div className="space-y-4">
      {messages.map((m, i) => (
        <ChatMessage
          key={m.id}
          message={m}
          streaming={streaming && i === messages.length - 1 && m.role === 'assistant'}
        />
      ))}
    </div>
  );
}

export function LoadingCard({
  emoji,
  title,
  detail,
}: {
  emoji: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="card text-center md:p-6">
      <p className="text-3xl">{emoji}</p>
      <p className="mt-3 text-sm font-bold text-brand-900">{title}</p>
      <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">{detail}</p>
    </div>
  );
}

export function ErrorCard({
  title,
  detail,
  onRetry,
  retryLabel,
}: {
  title: string;
  detail: string;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <div className="card md:p-5">
      <p className="text-center text-2xl">⚠️</p>
      <p className="mt-2 text-center text-sm font-bold text-[color:var(--color-danger)]">
        {title}
      </p>
      <p className="mt-2 break-words rounded-card bg-red-50 p-3 text-xs text-[color:var(--color-ink-600)]">
        {detail}
      </p>
      <button type="button" onClick={onRetry} className="btn-cta mt-4 w-full">
        {retryLabel}
      </button>
      <p className="mt-3 text-[11px] text-[color:var(--color-ink-600)]">
        계속 실패하면 페이지 새로고침(Ctrl+Shift+R) 후 다시 시도해주세요.
      </p>
    </div>
  );
}
