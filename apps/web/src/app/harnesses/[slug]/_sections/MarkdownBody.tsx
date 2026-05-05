import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  body: string;
}

export function MarkdownBody({ body }: Props) {
  return (
    <section aria-labelledby="body" className="space-y-3">
      <h2 id="body" className="sr-only">본문</h2>
      <div className="markdown-body space-y-4 text-[15px] leading-relaxed text-[color:var(--color-ink-900)]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h3 className="mt-6 font-display text-xl font-bold text-brand-900">{children}</h3>
            ),
            h3: ({ children }) => (
              <h4 className="mt-4 text-lg font-semibold text-brand-800">{children}</h4>
            ),
            p: ({ children }) => <p className="leading-7">{children}</p>,
            ul: ({ children }) => (
              <ul className="ml-5 list-disc space-y-1 marker:text-brand-500">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="ml-5 list-decimal space-y-1 marker:text-brand-500">{children}</ol>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-brand-800">{children}</strong>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-brand-700 underline underline-offset-2 hover:text-brand-900"
                target="_blank"
                rel="noreferrer"
              >
                {children}
              </a>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.startsWith('language-');
              if (isBlock) {
                return <code className={`${className} text-cream-50`}>{children}</code>;
              }
              return (
                <code className="rounded bg-cream-100 px-1 py-0.5 font-mono text-[13px] text-brand-800">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="overflow-x-auto rounded-card bg-brand-900 p-4 font-mono text-[13px] leading-6 text-cream-50">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-brand-300 bg-cream-50 py-2 pl-4 italic text-[color:var(--color-ink-600)]">
                {children}
              </blockquote>
            ),
          }}
        >
          {body}
        </ReactMarkdown>
      </div>
    </section>
  );
}
