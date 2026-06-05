'use client';

import { useEffect, useMemo, useState } from 'react';

/** 이식 대상 플랫폼별 상세 안내 (Phase 2 DB 기록 전 — 설명 + 복사만) */
const TARGETS = [
  {
    key: 'claude',
    label: 'Claude',
    icon: '🟣',
    how: '새 대화를 열고 아래 프롬프트를 첫 메시지로 붙여넣으세요. Claude Code라면 프로젝트 루트의 CLAUDE.md에 넣으면 세션마다 자동 적용됩니다.',
  },
  {
    key: 'chatgpt',
    label: 'ChatGPT',
    icon: '🟢',
    how: '“맞춤 설정(Custom Instructions)” 또는 새 GPT의 Instructions 칸에 아래 프롬프트를 붙여넣으세요. 일반 대화라면 첫 메시지로 넣어도 됩니다.',
  },
  {
    key: 'n8n',
    label: 'n8n',
    icon: '🔶',
    how: 'AI Agent 또는 OpenAI/Anthropic 노드의 System Prompt 칸에 아래 내용을 붙여넣고, 앞단 트리거와 뒷단 액션 노드를 연결하세요.',
  },
  {
    key: 'zapier',
    label: 'Zapier',
    icon: '🟠',
    how: 'Zap의 AI 단계(OpenAI/Anthropic)에서 System/Prompt 필드에 아래 내용을 붙여넣고, 트리거·액션을 구성하세요.',
  },
] as const;

type TargetKey = (typeof TARGETS)[number]['key'];

export interface TransplantHarness {
  slug: string;
  title: string;
  one_liner: string;
  purpose: string;
  persona_name: string | null;
  persona_job: string | null;
  components: string[];
  body_md: string | null;
}

function buildPrompt(h: TransplantHarness): string {
  const lines = [`# ${h.title}`, '', h.one_liner, '', '## 목적', h.purpose];
  if (h.persona_name || h.persona_job) {
    lines.push('', '## 대상', [h.persona_name, h.persona_job].filter(Boolean).join(' — '));
  }
  if (h.components.length) {
    lines.push('', '## 구성요소', ...h.components.map((c) => `- ${c}`));
  }
  if (h.body_md?.trim()) {
    lines.push('', '## 내용', h.body_md.trim());
  }
  lines.push('', '---', `출처: 우하귀 하네스 갤러리 · /harnesses/${h.slug}`);
  return lines.join('\n');
}

/** 이식 안내 모달 — 사이드바 카드·상단 버튼이 공유 */
function TransplantModal({
  harness,
  onClose,
}: {
  harness: TransplantHarness;
  onClose: () => void;
}) {
  const [target, setTarget] = useState<TargetKey>('claude');
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildPrompt(harness), [harness]);
  const active = TARGETS.find((t) => t.key === target)!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 클립보드 차단 환경: 사용자가 직접 선택 복사 */
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="하네스 이식 안내"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-card sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-brand-100 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-brand-900">내 업무에 이식하기</h3>
            <p className="mt-0.5 truncate text-xs text-[color:var(--color-ink-600)]">
              {harness.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full px-2 py-1 text-lg leading-none text-brand-500 transition hover:bg-brand-50"
          >
            ×
          </button>
        </div>

        <div className="flex gap-1.5 border-b border-brand-100 px-4 py-3">
          {TARGETS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTarget(t.key)}
              className={`flex-1 rounded-[10px] px-2 py-1.5 text-xs font-semibold transition ${
                t.key === target
                  ? 'bg-brand-600 text-white shadow-card'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 overflow-y-auto px-5 py-4">
          <p className="rounded-[10px] border-l-[3px] border-brand-400 bg-brand-50 px-3 py-2.5 text-[13px] leading-relaxed text-brand-800">
            <span className="font-bold">
              {active.icon} {active.label}에 이식
            </span>
            <br />
            {active.how}
          </p>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-700">📋 이식용 프롬프트</span>
              <button
                type="button"
                onClick={copy}
                className="rounded-[8px] border border-brand-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                {copied ? '복사됨 ✓' : '복사'}
              </button>
            </div>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-[10px] bg-[color:var(--color-ink-900,#1c1c1e)] px-3 py-3 text-[11.5px] leading-relaxed text-cream-50">
              {prompt}
            </pre>
          </div>
        </div>

        <div className="border-t border-brand-100 px-5 py-3">
          <button
            type="button"
            onClick={copy}
            className="w-full rounded-[10px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700"
          >
            {copied ? '복사됨 ✓ — 붙여넣어 사용하세요' : '📋 프롬프트 전체 복사'}
          </button>
          <p className="mt-2 text-center text-[11px] text-[color:var(--color-ink-600)]">
            * beta — 이식 기록·성공률 집계는 곧 추가됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

/** 사이드바 카드 — 프롬프트 이식 진입점 */
export function TransplantCard({ harness }: { harness: TransplantHarness }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card space-y-2 border-2 border-brand-200 bg-cream-50">
      <h2 className="text-sm font-semibold text-brand-800">내 업무에 이식하기</h2>
      <p className="text-xs text-[color:var(--color-ink-600)]">
        Claude / ChatGPT / n8n / Zapier 등에 이 하네스를 복사할 수 있습니다.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-[10px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700"
      >
        이식하기 beta 🚀
      </button>
      {open ? <TransplantModal harness={harness} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

/** 상단 액션바용 고스트 버튼 — 사이드바 카드와 같은 모달 */
export function TransplantHeaderButton({ harness }: { harness: TransplantHarness }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(true)}>
        이식하기 beta
      </button>
      {open ? <TransplantModal harness={harness} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
