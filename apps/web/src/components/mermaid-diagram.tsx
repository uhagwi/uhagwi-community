'use client';

/**
 * MermaidDiagram — 한 줄 그림을 Mermaid flowchart로 렌더.
 * loop-designer.html과 동일하게 CDN에서 mermaid를 1회 로드 (번들 무영향).
 * 실패 시 원본 텍스트로 fallback (서비스 무중단).
 *
 * 톤: 우하귀 cream/brand 팔레트 (base theme + themeVariables 오버라이드).
 */
import { useEffect, useRef, useState } from 'react';

const CDN = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';

type MermaidApi = {
  initialize: (cfg: Record<string, unknown>) => void;
  render: (id: string, src: string) => Promise<{ svg: string }>;
};
declare global {
  interface Window {
    mermaid?: MermaidApi;
  }
}

let loader: Promise<MermaidApi> | null = null;
function loadMermaid(): Promise<MermaidApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.mermaid) return Promise.resolve(window.mermaid);
  if (loader) return loader;
  loader = new Promise<MermaidApi>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CDN;
    s.async = true;
    s.onload = () =>
      window.mermaid ? resolve(window.mermaid) : reject(new Error('mermaid missing'));
    s.onerror = () => reject(new Error('mermaid cdn failed'));
    document.head.appendChild(s);
  });
  return loader;
}

interface Props {
  chart: string;
  fallbackText: string;
  domId: string;
}

export function MermaidDiagram({ chart, fallbackText, domId }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then(async (m) => {
        m.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          fontFamily: 'inherit',
          themeVariables: {
            primaryColor: '#fdf6e9',
            primaryBorderColor: '#d8b878',
            primaryTextColor: '#1f2a37',
            lineColor: '#8a96aa',
            fontSize: '14px',
          },
        });
        const { svg: out } = await m.render(`${domId}-svg`, chart);
        if (!cancelled) setSvg(out);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chart, domId]);

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded-card bg-brand-900 p-4 font-mono text-[13px] leading-6 text-cream-50">
        {fallbackText}
      </pre>
    );
  }

  const wrapClass =
    'overflow-x-auto rounded-card border border-[color:var(--color-ink-300)]/40 bg-cream-50 p-4';

  if (svg) {
    return (
      <div
        ref={boxRef}
        className={wrapClass}
        aria-label="하네스 구조도"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }
  return (
    <div ref={boxRef} className={wrapClass} aria-label="하네스 구조도">
      <p className="text-sm text-[color:var(--color-ink-600)]">구조도 그리는 중…</p>
    </div>
  );
}
