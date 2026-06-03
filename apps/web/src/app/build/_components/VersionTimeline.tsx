'use client';

// 버전 타임라인 — draftId별 VersionSnapshot 목록 표시 (Phase 4)
// 최신순 정렬. refreshKey가 바뀌면 목록 다시 로드.

import { useEffect, useState } from 'react';
import type { VersionSnapshot } from '@/lib/build/history';
import { loadHistory } from '@/lib/build/history';

// 상대 시간 포맷 (간단 버전)
function relTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

interface VersionTimelineProps {
  draftId: string;
  refreshKey?: number; // 이 값이 바뀌면 목록 다시 로드
}

export function VersionTimeline({ draftId, refreshKey }: VersionTimelineProps) {
  const [history, setHistory] = useState<VersionSnapshot[]>([]);

  useEffect(() => {
    setHistory(loadHistory(draftId));
  }, [draftId, refreshKey]);

  return (
    <div className="card md:p-4 flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">버전 히스토리</p>

      {history.length === 0 ? (
        <p className="text-xs text-[color:var(--color-ink-600)]">
          아직 저장된 버전 없음. 📌 버전 저장을 눌러보세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {history.map((snap, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-2 rounded-[8px] border border-brand-100 bg-brand-50 px-3 py-2"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-brand-800">
                  v{snap.version}
                  {snap.label ? ` · ${snap.label}` : ''}
                </span>
                <span className="text-[10px] text-[color:var(--color-ink-600)]">
                  블록 {snap.blockCount}개
                </span>
              </div>
              <span className="shrink-0 text-[10px] text-[color:var(--color-ink-600)]">
                {relTime(snap.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
