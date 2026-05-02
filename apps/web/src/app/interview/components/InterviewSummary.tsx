'use client';

import { useState } from 'react';
import { FLAT_QUESTIONS } from '../questions';
import type { InterviewAnswers } from '../use-interview-state';

interface Props {
  answers: InterviewAnswers;
  startedAt: string | null;
  finishedAt: string | null;
  exportJson: () => string;
  onReset: () => void;
}

export function InterviewSummary({ answers, startedAt, finishedAt, exportJson, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const answered = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const skipped = FLAT_QUESTIONS.length - answered;

  function downloadJson() {
    const json = exportJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uhagwi-interview-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(exportJson());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* 무시 */
    }
  }

  // 섹션별 그룹화
  const grouped = new Map<string, typeof FLAT_QUESTIONS>();
  for (const q of FLAT_QUESTIONS) {
    const arr = grouped.get(q.sectionTitle) ?? [];
    arr.push(q);
    grouped.set(q.sectionTitle, arr);
  }

  const durationMin =
    startedAt && finishedAt
      ? Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 60000)
      : null;

  return (
    <div className="space-y-6">
      <div className="card md:p-8">
        <p className="text-3xl">🎉</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-brand-900 md:text-3xl">
          진단 응답 완료
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-600)] md:text-base">
          답변하신 응답이 저장되었습니다. 다음 단계에서 AI가 이 응답을 읽어 <strong>당신의 페르소나</strong>와{' '}
          <strong>자동화 가능 영역 톱5</strong>를 진단합니다 (다음 세션에서 가동).
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="답변" value={`${answered}`} suffix={`/ ${FLAT_QUESTIONS.length}`} />
          <Stat label="건너뜀" value={`${skipped}`} />
          <Stat label="소요" value={durationMin !== null ? `${durationMin}분` : '—'} />
          <Stat label="버전" value="v0.1" />
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={downloadJson} className="btn-cta">
            JSON 다운로드
          </button>
          <button type="button" onClick={copyJson} className="btn-ghost">
            {copied ? '✓ 복사됨' : 'JSON 클립보드로 복사'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('정말 모든 답변을 초기화하고 다시 시작할까요?')) onReset();
            }}
            className="btn-ghost text-[color:var(--color-danger)]"
          >
            처음부터 다시
          </button>
        </div>
      </div>

      <div className="card md:p-6">
        <h2 className="text-base font-bold text-brand-900 md:text-lg">내 답변 요약</h2>
        <p className="mt-1 text-xs text-[color:var(--color-ink-600)]">
          섹션을 눌러 펼쳐 보세요. 다음 세션에 페르소나·자동화 후보 진단으로 이어집니다.
        </p>

        <div className="mt-4 space-y-2">
          {Array.from(grouped.entries()).map(([section, qs]) => {
            const open = openSection === section;
            const sectionAnswered = qs.filter((q) => answers[q.id]?.trim()).length;
            return (
              <div key={section} className="rounded-card border border-brand-100">
                <button
                  type="button"
                  onClick={() => setOpenSection(open ? null : section)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-cream-50"
                >
                  <span className="text-sm font-semibold text-brand-800">{section}</span>
                  <span className="text-xs text-[color:var(--color-ink-600)]">
                    {sectionAnswered} / {qs.length} {open ? '▾' : '▸'}
                  </span>
                </button>
                {open ? (
                  <ul className="border-t border-brand-100 px-4 py-3 space-y-3">
                    {qs.map((q) => (
                      <li key={q.id} className="text-xs">
                        <p className="font-medium text-brand-800">
                          {q.index}. {q.text}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-[color:var(--color-ink-600)]">
                          {answers[q.id]?.trim() || '(건너뜀)'}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-card bg-cream-50 px-3 py-3 text-center">
      <p className="text-xs text-[color:var(--color-ink-600)]">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-brand-900">
        {value}
        {suffix ? <span className="text-xs font-normal text-[color:var(--color-ink-600)]"> {suffix}</span> : null}
      </p>
    </div>
  );
}
