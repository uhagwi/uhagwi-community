'use client';

import { useEffect, useMemo, useState } from 'react';

/** 마켓플레이스 식별자 — uhagwi/harness-gallery */
const MARKETPLACE_ADD = 'claude plugin marketplace add uhagwi/harness-gallery';
const MARKETPLACE_NAME = 'uhagwi-harness-gallery';

/** 패키징된 하네스 slug → 설치 플러그인 이름. 패키징 늘면 여기 추가 */
const PLUGIN_BY_SLUG: Record<string, string> = {
  'govgrant-proposal': 'proposal-builder',
};

/** 이식 대상 — 코딩 에이전트 2종 (Claude Code · Codex) */
const TARGETS = [
  {
    key: 'claude-code',
    label: 'Claude Code',
    icon: '🟣',
    how: '아래 명령 2줄을 터미널(claude 실행 창)에 붙여넣으면 에이전트·스킬·오케스트레이션이 통째로 설치됩니다. 설치 후 세션에서 이 하네스의 트리거 문구를 입력하세요.',
    howFallback:
      '이 하네스는 아직 플러그인으로 패키징되지 않았습니다. 아래 내용을 프로젝트 루트 CLAUDE.md에 넣으면 세션마다 적용됩니다.',
  },
  {
    key: 'codex',
    label: 'Codex',
    icon: '🟢',
    how: '프로젝트 루트의 AGENTS.md에 아래 내용을 넣으면 Codex가 세션마다 역할·규칙으로 적용합니다. (또는 첫 지시로 붙여넣기)',
    howFallback: '',
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
  const [target, setTarget] = useState<TargetKey>('claude-code');
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildPrompt(harness), [harness]);
  const active = TARGETS.find((t) => t.key === target)!;

  const pluginName = PLUGIN_BY_SLUG[harness.slug];
  const installCmds = pluginName
    ? [MARKETPLACE_ADD, `claude plugin install ${pluginName}@${MARKETPLACE_NAME}`]
    : null;
  const showInstall = target === 'claude-code' && !!installCmds;
  const copyText = showInstall ? installCmds!.join('\n') : prompt;

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
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 클립보드 차단 환경 */
    }
  }

  const howText =
    target === 'claude-code' && !installCmds ? active.howFallback : active.how;

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
              {active.icon} {active.label}
              {showInstall ? '에 원클릭 설치' : '에 이식'}
            </span>
            <br />
            {howText}
          </p>

          {showInstall ? (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-brand-700">⌨️ 설치 명령 (터미널)</span>
              {installCmds!.map((c, i) => (
                <pre
                  key={i}
                  className="overflow-x-auto rounded-[10px] bg-[color:var(--color-ink-900,#1c1c1e)] px-3 py-2.5 text-[11.5px] leading-relaxed text-cream-50"
                >
                  {c}
                </pre>
              ))}
            </div>
          ) : (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-700">
                  📋 {target === 'codex' ? 'AGENTS.md 내용' : 'CLAUDE.md 내용'}
                </span>
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
          )}
        </div>

        <div className="border-t border-brand-100 px-5 py-3">
          <button
            type="button"
            onClick={copy}
            className="w-full rounded-[10px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700"
          >
            {copied
              ? '복사됨 ✓ — 붙여넣어 사용하세요'
              : showInstall
                ? '📋 설치 명령 전체 복사'
                : '📋 전체 복사'}
          </button>
          <p className="mt-2 text-center text-[11px] text-[color:var(--color-ink-600)]">
            {showInstall
              ? '* 터미널에 붙여넣어 설치 → 세션에서 트리거 문구 입력'
              : '* beta — 설치형 패키징은 순차 확대 중입니다.'}
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
        Claude Code · Codex에 이 하네스를 설치할 수 있습니다.
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
