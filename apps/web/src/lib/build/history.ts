// 하네스 에디터 버전 스냅샷 — localStorage 기반 (Phase 4)
// draftId별 VersionSnapshot 배열을 저장. 최근 20개만 유지.

export interface VersionSnapshot {
  version: number;
  at: string;       // ISO 8601 타임스탬프
  blockCount: number;
  label?: string;   // 사용자 메모 (현재 미사용, 확장 대비)
}

export const BUILD_HISTORY_KEY = 'uhagwi.build.history';

// draftId별 VersionSnapshot[] 저장 형태
type HistoryStore = Record<string, VersionSnapshot[]>;

const MAX_SNAPSHOTS = 20;

function loadStore(): HistoryStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(BUILD_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: HistoryStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BUILD_HISTORY_KEY, JSON.stringify(store));
  } catch {
    /* localStorage 비활성/용량 초과 — 무시 */
  }
}

// 스냅샷 추가 (최근 MAX_SNAPSHOTS개만 유지)
export function pushSnapshot(draftId: string, snap: VersionSnapshot): void {
  const store = loadStore();
  const list = store[draftId] ?? [];
  list.push(snap);
  // 오래된 것 제거 (앞에서 초과분 slice)
  store[draftId] = list.length > MAX_SNAPSHOTS ? list.slice(-MAX_SNAPSHOTS) : list;
  saveStore(store);
}

// draftId에 해당하는 스냅샷 목록 로드 (최신순)
export function loadHistory(draftId: string): VersionSnapshot[] {
  const store = loadStore();
  const list = store[draftId] ?? [];
  return [...list].reverse(); // 최신순 복사본 반환
}
