/**
 * 인터뷰 v0.6 상태 머신 — 타입·상수·storage·헬퍼.
 */
import type { Phase2Result, Phase4Result } from '../phases';

export const STORAGE_KEY = 'uhagwi.interview.v0_6';

export const PHASE1_FIRST_MSG =
  '안녕하세요! 🌊 30분 정도 편하게 대화하면서 당신이 어떤 일을 하시는 분인지 알아볼게요.\n\n먼저 — 요즘 어떤 일 하시면서 지내세요?';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type V6Phase = 0 | 1 | 2 | 3 | 4;

export type V6State = {
  phase: V6Phase;
  startedAt: string | null;
  finishedAt: string | null;

  phase1Messages: ChatMessage[];
  phase1Done: boolean;

  phase2Result: Phase2Result | null;
  phase2Error: string | null;
  phase2Loading: boolean;

  phase3Messages: ChatMessage[];
  phase3Done: boolean;

  phase4Result: Phase4Result | null;
  phase4Error: string | null;
  phase4Loading: boolean;
};

export const INITIAL_STATE: V6State = {
  phase: 0,
  startedAt: null,
  finishedAt: null,
  phase1Messages: [],
  phase1Done: false,
  phase2Result: null,
  phase2Error: null,
  phase2Loading: false,
  phase3Messages: [],
  phase3Done: false,
  phase4Result: null,
  phase4Error: null,
  phase4Loading: false,
};

export function genId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function makeFirstMsg(content: string): ChatMessage {
  return { id: genId(), role: 'assistant', content, createdAt: new Date().toISOString() };
}

export function loadState(): V6State {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    [
      'uhagwi.interview.chat.v0_2',
      'uhagwi.interview.chat.v0_3',
      'uhagwi.interview.chat.v0_4',
      'uhagwi.interview.v0_1',
    ].forEach((k) => window.localStorage.removeItem(k));

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return { ...INITIAL_STATE, ...JSON.parse(raw) };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: V6State) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 무시 */
  }
}

/** API 에러 응답 → 메시지 추출 */
export async function extractErrorDetail(res: Response): Promise<string> {
  let detail = `HTTP ${res.status}`;
  try {
    const errJson = await res.json();
    detail = errJson.detail ?? detail;
  } catch {
    const txt = await res.text();
    detail = txt.slice(0, 300) || detail;
  }
  return detail;
}
