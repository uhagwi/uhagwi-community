'use client';

// 발행 바 — 버전 저장 + 갤러리 발행 (Phase 4)
// 발행 게이트: 페르소나 이름 없음 / 스킬+에이전트 0 → 버튼 disabled

import { useState } from 'react';
import Link from 'next/link';
import type { HarnessDraft } from '@/lib/build/draft';
import { canPublish, publishDraft } from '@/lib/build/publish';
import { pushSnapshot } from '@/lib/build/history';
import { countBlocks } from '@/lib/build/draft';

interface PublishBarProps {
  draft: HarnessDraft;
  onVersionSaved?: () => void; // 버전 저장 후 부모에게 알림 (VersionTimeline 갱신용)
}

type PublishStatus = 'idle' | 'loading' | 'done' | 'error';

export function PublishBar({ draft, onVersionSaved }: PublishBarProps) {
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [versionSavedMsg, setVersionSavedMsg] = useState('');

  const gate = canPublish(draft);

  // 버전 저장 버튼
  function handleSaveVersion() {
    pushSnapshot(draft.id, {
      version: draft.version,
      at: new Date().toISOString(),
      blockCount: countBlocks(draft),
    });
    setVersionSavedMsg(`v${draft.version} 저장됨`);
    setTimeout(() => setVersionSavedMsg(''), 2000);
    onVersionSaved?.();
  }

  // 갤러리 발행 버튼
  async function handlePublish() {
    if (!gate.ok) return;
    setPublishStatus('loading');
    setErrorMsg('');
    const result = await publishDraft(draft);
    if ('slug' in result) {
      setPublishedSlug(result.slug);
      setPublishStatus('done');
      // 발행 성공 시 자동 버전 스냅샷 기록
      pushSnapshot(draft.id, {
        version: draft.version,
        at: new Date().toISOString(),
        blockCount: countBlocks(draft),
        label: '갤러리 발행',
      });
      onVersionSaved?.();
    } else {
      setPublishStatus('error');
      if (result.error === 'cancelled-by-user') {
        setErrorMsg('발행이 취소됐어요.');
      } else if (result.error === 'unauthorized') {
        setErrorMsg('로그인이 필요해요. 상단에서 로그인 후 다시 시도하세요.');
      } else {
        setErrorMsg(result.error || '발행 중 오류가 발생했어요.');
      }
    }
  }

  return (
    <div className="card md:p-4 flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">발행</p>

      {/* 게이트 미충족 안내 */}
      {!gate.ok && (
        <p className="rounded-[8px] bg-brand-50 border border-brand-200 px-3 py-2 text-xs text-brand-700">
          {gate.reason}
        </p>
      )}

      {/* 버전 저장 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSaveVersion}
          className="btn-ghost !py-2 !px-3 text-sm flex-1"
        >
          📌 버전 저장
        </button>
        {versionSavedMsg && (
          <span className="text-xs text-brand-600 font-semibold">{versionSavedMsg}</span>
        )}
      </div>

      {/* 갤러리 발행 */}
      {publishStatus === 'done' && publishedSlug ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-brand-700 font-semibold">🎉 갤러리에 자랑 완료!</p>
          <Link
            href={`/harnesses/${publishedSlug}`}
            className="btn-primary !py-2 text-sm text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            게시된 하네스 보기 →
          </Link>
          <button
            type="button"
            onClick={() => { setPublishStatus('idle'); setPublishedSlug(null); }}
            className="text-xs text-brand-500 underline text-center"
          >
            다시 발행하기
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePublish}
          disabled={!gate.ok || publishStatus === 'loading'}
          title={!gate.ok ? gate.reason : undefined}
          className="btn-primary !py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {publishStatus === 'loading' ? '발행 중…' : '🚀 갤러리에 자랑'}
        </button>
      )}

      {/* 에러 메시지 */}
      {publishStatus === 'error' && errorMsg && (
        <p className="rounded-[8px] bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
