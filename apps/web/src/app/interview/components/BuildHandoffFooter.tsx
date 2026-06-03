'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Phase4Result } from '../phases';
import { countBlocks, interviewToHarnessDraft, saveBuildDraft } from '@/lib/build/draft';
import { saveRecommended } from '@/lib/build/recommended';

interface Props {
  result: Phase4Result;
}

// Phase 4 진단 완료 후 핸드오프 — 진단 결과를 에디터 드래프트로 변환해 /build 로 넘긴다.
// (구 "홈으로 돌아가기" 데드엔드 대체)
export function BuildHandoffFooter({ result }: Props) {
  const router = useRouter();

  const handoff = (intent: 'build' | 'publish') => {
    const draft = interviewToHarnessDraft(result);
    // 추천 블록 원본 세트를 별도 저장 — 캔버스 삭제 후에도 '추천' 탭에서 재담을 수 있도록
    const allRecommended = [
      ...draft.memory,
      ...draft.skills,
      ...draft.agents,
      ...draft.tools,
      ...draft.gates,
    ];
    saveRecommended(allRecommended);
    saveBuildDraft(draft);
    const qs = intent === 'publish' ? '?from=interview&intent=publish' : '?from=interview';
    router.push(`/build${qs}`);
  };

  const blockCount =
    result.auto_candidates.length +
    result.automation_priorities.off_limits.length +
    (result.quality_bar?.trim() ? 1 : 0);

  return (
    <footer className="border-t border-brand-100 bg-cream-50 px-4 py-4 md:px-6">
      <div className="mx-auto max-w-[760px] space-y-2">
        <button
          type="button"
          onClick={() => handoff('build')}
          className="btn-cta block w-full text-center"
        >
          🧩 이 진단으로 내 하네스 만들기 · 블록 {blockCount}개 자동 채움
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handoff('publish')}
            className="btn-ghost flex-1 !py-2.5 text-sm"
          >
            🚀 바로 자랑 카드 만들기
          </button>
          <Link
            href="/"
            className="btn-ghost flex-1 !py-2.5 text-sm"
          >
            홈으로
          </Link>
        </div>
      </div>
    </footer>
  );
}
