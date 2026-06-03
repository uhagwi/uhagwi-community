'use client';

// 하네스 에디터 발행 래퍼 (Phase 4)
// - 드래프트 → 갤러리 발행 페이로드 변환
// - bridge.ts publishToUhagwi와 동일한 친밀 맥락 사전 점검 + ack 재시도 패턴

import type { HarnessDraft } from './draft';
import { countBlocks } from './draft';
import { draftToMermaid } from './draft-mermaid';
import { scanIntimateContext, summarizeHits } from '@/lib/intimate-context';

// 드래프트 → POST /api/lab/publish 페이로드 변환
export function draftToPublishPayload(draft: HarnessDraft) {
  const title = (draft.persona.name.trim() || '내 하네스').slice(0, 120);

  // one_liner: 페르소나 톤 우선, 없으면 스킬·에이전트 수 요약
  const oneLiners = draft.persona.tone.trim()
    || [
        draft.skills.length ? `스킬 ${draft.skills.length}개` : '',
        draft.agents.length ? `에이전트 ${draft.agents.length}개` : '',
      ]
        .filter(Boolean)
        .join(' · ')
    || '하네스 에디터 발행';
  const one_liner = oneLiners.slice(0, 200) || '하네스 에디터 발행';

  // purpose: 페르소나 + 슬롯별 블록 라벨 묶음
  const slotLines: string[] = [];
  if (draft.persona.job) slotLines.push(`직무: ${draft.persona.job}`);
  if (draft.skills.length)
    slotLines.push(`스킬: ${draft.skills.map((b) => b.label).join(', ')}`);
  if (draft.agents.length)
    slotLines.push(`에이전트: ${draft.agents.map((b) => b.label).join(', ')}`);
  if (draft.memory.length)
    slotLines.push(`메모리: ${draft.memory.map((b) => b.label).join(', ')}`);
  if (draft.tools.length)
    slotLines.push(`도구: ${draft.tools.map((b) => b.label).join(', ')}`);
  if (draft.gates.length)
    slotLines.push(`가드레일: ${draft.gates.map((b) => b.label).join(', ')}`);
  const purpose = slotLines.join('\n') || '(작성 중)';

  // components: 비어있지 않은 슬롯 kind 한국어 라벨
  const components: string[] = [];
  if (draft.memory.length) components.push('메모리');
  if (draft.skills.length) components.push('스킬');
  if (draft.agents.length) components.push('에이전트');
  if (draft.tools.length) components.push('도구');
  if (draft.gates.length) components.push('가드레일');

  // prompt_snippet: 첫 스킬 블록 body
  const firstSkill = draft.skills[0];
  const prompt_snippet = firstSkill?.body.trim() || null;

  return {
    title,
    one_liner,
    purpose,
    components,
    prompt_snippet,
    persona_name: draft.persona.name.trim() || null,
    persona_job: draft.persona.job.trim() || null,
    structure_mermaid: draftToMermaid(draft),
    media_urls: [] as string[],
    source: 'build' as const,
    build_meta: {
      draftId: draft.id,
      version: draft.version,
      blockCount: countBlocks(draft),
    },
  };
}

// 발행 게이트 검사 — true면 발행 가능
export function canPublish(draft: HarnessDraft): { ok: boolean; reason?: string } {
  if (!draft.persona.name.trim()) {
    return { ok: false, reason: '페르소나 이름을 입력해야 해요.' };
  }
  if (draft.skills.length + draft.agents.length === 0) {
    return { ok: false, reason: '스킬 또는 에이전트를 1개 이상 추가해야 해요.' };
  }
  return { ok: true };
}

// POST /api/lab/publish 클라이언트 래퍼 (bridge.ts 패턴 동일)
// 1차 클라이언트 친밀 맥락 사전 점검 → 서버 409 ack 재시도
export async function publishDraft(
  draft: HarnessDraft,
): Promise<{ slug: string } | { error: string }> {
  const payload = draftToPublishPayload(draft);

  // 1차 클라이언트 사전 점검
  const preHits = scanIntimateContext({
    title: payload.title,
    one_liner: payload.one_liner,
    purpose: payload.purpose,
    prompt_snippet: payload.prompt_snippet ?? undefined,
    persona_name: payload.persona_name ?? undefined,
    persona_job: payload.persona_job ?? undefined,
  });
  let ack = false;
  if (preHits.length > 0) {
    const ok =
      typeof window !== 'undefined'
        ? window.confirm(`${summarizeHits(preHits)}\n\n그래도 그대로 게시할까요?`)
        : false;
    if (!ok) return { error: 'cancelled-by-user' };
    ack = true;
  }

  try {
    const endpoint = ack
      ? '/api/lab/publish?ack_intimate=1'
      : '/api/lab/publish';
    let res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // 서버가 추가 패턴을 잡았을 때 → 한 번 더 confirm 후 재시도
    if (res.status === 409 && !ack) {
      const data = (await res.json().catch(() => ({}))) as {
        warning?: string;
        message?: string;
        hits?: ReturnType<typeof scanIntimateContext>;
      };
      if (data?.warning === 'intimate-context') {
        const ok =
          typeof window !== 'undefined'
            ? window.confirm(
                `${summarizeHits(data.hits ?? [])}\n\n그래도 그대로 게시할까요?`,
              )
            : false;
        if (!ok) return { error: 'cancelled-by-user' };
        res = await fetch('/api/lab/publish?ack_intimate=1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    }

    if (res.status === 401) return { error: 'unauthorized' };
    if (!res.ok) {
      const text = await res.text();
      return { error: text || `HTTP ${res.status}` };
    }
    return (await res.json()) as { slug: string };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'network error';
    return { error: msg };
  }
}
