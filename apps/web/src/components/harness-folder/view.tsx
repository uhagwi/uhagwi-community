'use client';

/**
 * 하네스 폴더 업로드 뷰 — 드래그 앤 드롭 + 폴더 선택.
 * 클라이언트 사이드 파싱(서버 업로드 없음).
 */

import type { ParsedHarness } from './parse';
import { useFolderUpload } from './use-folder-upload';

interface Props {
  onParsed: (data: ParsedHarness) => void;
}

export function HarnessFolderUploadView({ onParsed }: Props) {
  const {
    inputRef,
    parsing,
    error,
    stats,
    dragOver,
    setDragOver,
    openPicker,
    onInputChange,
    onDrop,
  } = useFolderUpload(onParsed);

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openPicker();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed px-6 py-8 text-center transition ${
          dragOver
            ? 'border-brand-500 bg-brand-50'
            : 'border-brand-200 bg-cream-50 hover:border-brand-400 hover:bg-brand-50/50'
        } ${parsing ? 'opacity-60 pointer-events-none' : ''}`}
        aria-label="하네스 폴더 업로드 영역"
      >
        <span className="text-3xl" aria-hidden>
          📂
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-brand-800">
            하네스 폴더를 끌어다 놓거나 클릭하세요
          </p>
          <p className="text-xs text-[color:var(--color-ink-600)]">
            CLAUDE.md · README.md · .claude/agents · .claude/skills 자동 분석
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          // @ts-expect-error — webkitdirectory 는 React 표준 prop이 아니지만 브라우저 지원
          webkitdirectory=""
          directory=""
          multiple
          onChange={onInputChange}
          className="hidden"
          aria-hidden
        />
      </div>

      {parsing ? (
        <p className="text-xs text-brand-700" role="status">
          분석 중…
        </p>
      ) : null}

      {stats ? (
        <div className="rounded-[10px] bg-mint-400/20 px-3 py-2 text-xs text-brand-800">
          ✅ <strong>{stats.folder}</strong> 분석 완료 — 파일 {stats.files}개 · 에이전트{' '}
          {stats.agents}개 · 스킬 {stats.skills}개. 아래 폼에서 검토 후 게시하세요.
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs text-[color:var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
