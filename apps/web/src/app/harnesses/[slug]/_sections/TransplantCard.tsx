'use client';

import { useEffect, useMemo, useState } from 'react';

const MARKETPLACE_ADD = 'claude plugin marketplace add uhagwi/harness-gallery';
const MARKETPLACE_NAME = 'uhagwi-harness-gallery';

/** 패키징된 하네스 slug → 플러그인 이름 */
const PLUGIN_BY_SLUG: Record<string, string> = {
  'govgrant-proposal': 'proposal-builder',
};

const TIERS = {
  easy: { label: '쉬움', bg: '#e7f6ee', fg: '#1f9d63' },
  mid: { label: '중간', bg: '#f0eafe', fg: '#8b5cf6' },
  hard: { label: '고급', bg: '#fdefe3', fg: '#e07b2f' },
} as const;

type Act = 'soon' | 'chatgpt' | 'cc' | 'agents' | 'n8n';
interface Method {
  key: string; mode: 'gen' | 'dev'; icon: string; label: string; tier: keyof typeof TIERS; perf: string; act: Act;
}
const METHODS: Method[] = [
  { key: 'inapp', mode: 'gen', icon: '🐹', label: '우하귀에서 바로 써보기', tier: 'easy', perf: '코드 0 · 체험·가벼운 결과', act: 'soon' },
  { key: 'kakao', mode: 'gen', icon: '💬', label: '카톡 봇으로 쓰기', tier: 'easy', perf: '카톡에서 대화로 상시', act: 'soon' },
  { key: 'chatgpt', mode: 'gen', icon: '🟢', label: 'ChatGPT에 붙여넣기', tier: 'easy', perf: '대화 한 컷 — 글·아이디어', act: 'chatgpt' },
  { key: 'cc', mode: 'dev', icon: '🟣', label: 'Claude Code', tier: 'hard', perf: '풀 하네스 — 진짜 성능(스킬·도구·내 파일)', act: 'cc' },
  { key: 'codex', mode: 'dev', icon: '⬛', label: 'Codex (AGENTS.md)', tier: 'hard', perf: '풀 하네스 · AGENTS.md', act: 'agents' },
  { key: 'n8n', mode: 'dev', icon: '🔶', label: 'n8n / Zapier', tier: 'mid', perf: '자동화 OK · 추론 단순화', act: 'n8n' },
];

export interface TransplantHarness {
  slug: string; title: string; one_liner: string; purpose: string;
  persona_name: string | null; persona_job: string | null; components: string[]; body_md: string | null;
}

function buildPrompt(h: TransplantHarness): string {
  const l = [`# ${h.title}`, '', h.one_liner, '', '## 목적', h.purpose];
  if (h.persona_name || h.persona_job) l.push('', '## 대상', [h.persona_name, h.persona_job].filter(Boolean).join(' — '));
  if (h.components.length) l.push('', '## 구성요소', ...h.components.map((c) => `- ${c}`));
  if (h.body_md?.trim()) l.push('', '## 내용', h.body_md.trim());
  l.push('', '---', `출처: 우하귀 하네스 갤러리 · /harnesses/${h.slug}`);
  return l.join('\n');
}

function TransplantModal({ harness, onClose }: { harness: TransplantHarness; onClose: () => void }) {
  const [mode, setMode] = useState<'gen' | 'dev'>('gen');
  const [sel, setSel] = useState('chatgpt');
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildPrompt(harness), [harness]);
  const pluginName = PLUGIN_BY_SLUG[harness.slug];
  const recommended = pluginName ? 'cc' : 'inapp';
  const list = METHODS.filter((m) => m.mode === mode);
  const cur = METHODS.find((m) => m.key === sel)!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  function pickMode(m: 'gen' | 'dev') { setMode(m); setSel(METHODS.find((x) => x.mode === m)!.key); }

  // 현재 방법의 콘텐츠
  const installCmds = cur.act === 'cc' && pluginName
    ? [MARKETPLACE_ADD, `claude plugin install ${pluginName}@${MARKETPLACE_NAME}`] : null;
  const copyText = installCmds ? installCmds.join('\n') : prompt;

  async function copy() {
    try { await navigator.clipboard.writeText(copyText); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* */ }
  }
  function openChatGPT() { copy(); window.open('https://chatgpt.com/', '_blank', 'noopener'); }

  const fileLabel = cur.act === 'agents' ? 'AGENTS.md' : cur.act === 'n8n' ? 'System Prompt' : cur.act === 'chatgpt' ? '맞춤설정/첫 메시지' : 'CLAUDE.md';

  return (
    <div role="dialog" aria-modal="true" aria-label="하네스 이식"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-card sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-brand-100 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-brand-900">내 업무에 이식하기</h3>
            <p className="mt-0.5 truncate text-xs text-[color:var(--color-ink-600)]">{harness.title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="rounded-full px-2 py-1 text-lg leading-none text-brand-500 transition hover:bg-brand-50">×</button>
        </div>

        {/* 모드 토글 */}
        <div className="flex gap-2 px-5 pt-3">
          {([['gen', '👩 일반인', '코드 없이'], ['dev', '🧑‍💻 빌더', '실제 설치']] as const).map(([k, lb, ds]) => (
            <button key={k} type="button" onClick={() => pickMode(k)}
              className={`flex-1 rounded-[11px] border px-3 py-2 text-left transition ${mode === k ? 'border-brand-500 bg-brand-50' : 'border-brand-100 bg-white hover:bg-brand-50'}`}>
              <div className={`text-[13px] font-bold ${mode === k ? 'text-brand-700' : 'text-brand-900'}`}>{lb}</div>
              <div className="text-[10px] text-[color:var(--color-ink-600)]">{ds}</div>
            </button>
          ))}
        </div>

        <div className="space-y-3 overflow-y-auto px-5 py-4">
          {/* 방법 리스트 */}
          <div className="space-y-1.5">
            {list.map((m) => {
              const t = TIERS[m.tier]; const on = m.key === sel; const rec = m.key === recommended;
              return (
                <button key={m.key} type="button" onClick={() => setSel(m.key)}
                  className={`w-full rounded-[11px] border px-3 py-2 text-left transition ${on ? 'border-brand-500 bg-brand-50' : 'border-brand-100 bg-white hover:bg-brand-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{m.icon}</span>
                    <span className="text-[13px] font-bold text-brand-900">{m.label}</span>
                    <span className="rounded-[6px] px-1.5 py-0.5 text-[9.5px] font-extrabold" style={{ background: t.bg, color: t.fg }}>{t.label}</span>
                    {rec && <span className="rounded-[6px] bg-brand-600 px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">👍 추천</span>}
                    {m.act === 'soon' && <span className="ml-auto rounded-[6px] bg-[color:var(--color-ink-300,#eee)] px-1.5 py-0.5 text-[9.5px] font-bold text-[color:var(--color-ink-600)]">준비 중</span>}
                  </div>
                  <div className="mt-1 pl-7 text-[11px] text-[color:var(--color-ink-600)]">⚙ {m.perf}</div>
                </button>
              );
            })}
          </div>

          {/* 선택된 방법의 액션 */}
          {cur.act === 'soon' ? (
            <div className="rounded-[11px] border border-dashed border-brand-300 bg-cream-50 px-4 py-5 text-center">
              <div className="text-[13px] font-bold text-brand-700">🚧 준비 중 — 곧 열립니다</div>
              <p className="mt-1 text-[11px] text-[color:var(--color-ink-600)]">
                {cur.key === 'inapp' ? '우하귀가 하네스를 직접 실행해 결과를 보여주는 인앱 모드(코드 0)를 준비 중입니다.' : '카카오톡 채널 봇으로 바로 쓰는 기능을 준비 중입니다.'}
                <br />지금은 아래 <b>ChatGPT에 붙여넣기</b>로 체험하실 수 있어요.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {installCmds ? (
                <>
                  <span className="text-xs font-semibold text-brand-700">⌨️ 설치 명령 (터미널)</span>
                  {installCmds.map((c, i) => (
                    <pre key={i} className="overflow-x-auto rounded-[10px] bg-[color:var(--color-ink-900,#1c1c1e)] px-3 py-2.5 text-[11.5px] leading-relaxed text-cream-50">{c}</pre>
                  ))}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-700">📋 {fileLabel}에 붙여넣기</span>
                    <button type="button" onClick={copy} className="rounded-[8px] border border-brand-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50">{copied ? '복사됨 ✓' : '복사'}</button>
                  </div>
                  <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-[10px] bg-[color:var(--color-ink-900,#1c1c1e)] px-3 py-3 text-[11.5px] leading-relaxed text-cream-50">{prompt}</pre>
                </>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-brand-100 px-5 py-3">
          {cur.act === 'soon' ? (
            <button type="button" onClick={() => { setMode('gen'); setSel('chatgpt'); }} className="w-full rounded-[10px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700">대신 ChatGPT로 해보기 →</button>
          ) : cur.act === 'chatgpt' ? (
            <button type="button" onClick={openChatGPT} className="w-full rounded-[10px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700">{copied ? '복사됨 ✓ — ChatGPT에 붙여넣기' : '📋 복사하고 ChatGPT 열기'}</button>
          ) : (
            <button type="button" onClick={copy} className="w-full rounded-[10px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700">{copied ? '복사됨 ✓' : installCmds ? '📋 설치 명령 전체 복사' : '📋 전체 복사'}</button>
          )}
          <p className="mt-2 text-center text-[10.5px] text-[color:var(--color-ink-600)]">난이도↑ = 더 무거운 하네스를 제대로 · 가벼운 작업은 쉬움도 충분 · beta</p>
        </div>
      </div>
    </div>
  );
}

export function TransplantCard({ harness }: { harness: TransplantHarness }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card space-y-2 border-2 border-brand-200 bg-cream-50">
      <h2 className="text-sm font-semibold text-brand-800">내 업무에 이식하기</h2>
      <p className="text-xs text-[color:var(--color-ink-600)]">코드 없이(일반인) 또는 설치형(빌더) — 난이도별로 골라 쓰세요.</p>
      <button type="button" onClick={() => setOpen(true)} className="w-full rounded-[10px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700">이식하기 beta 🚀</button>
      {open ? <TransplantModal harness={harness} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

export function TransplantHeaderButton({ harness }: { harness: TransplantHarness }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(true)}>이식하기 beta</button>
      {open ? <TransplantModal harness={harness} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
