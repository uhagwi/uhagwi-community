'use client';

import { useEffect, useState } from 'react';
import {
  GACHA_CATALOG,
  addToCollection,
  drawCards,
  filterCatalog,
  loadCollection,
  type BuilderFilter,
  type GachaHarness,
} from '@/lib/gacha/catalog-seed';
import type { Grade } from '@/lib/grades';

const STORAGE_KEY = 'uhagwi.gacha.v0_1';
const COLLECTION_KEY = 'uhagwi.collection.v0_1';
export const FREE_DAILY_LIMIT = 1;
export const PRO_DRAW_COUNT = 5;

type GachaState = {
  last_free_draw_date: string | null;
  total_drawn: number;
};

const INITIAL: GachaState = { last_free_draw_date: null, total_drawn: 0 };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useGachaState(isAdmin: boolean) {
  const [state, setState] = useState<GachaState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<BuilderFilter>('all');
  const [gradeFilter, setGradeFilter] = useState<Grade | 'all'>('all');
  const [drawn, setDrawn] = useState<GachaHarness[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [collected, setCollected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...INITIAL, ...(JSON.parse(raw) as Partial<GachaState>) });
    } catch {
      /* ignore */
    }
    setCollected(new Set(loadCollection()));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const today = todayISO();
  const usedFreeToday = state.last_free_draw_date === today;
  const remainingFree = usedFreeToday ? 0 : FREE_DAILY_LIMIT;

  function getPool(): GachaHarness[] {
    let pool = filterCatalog(filter);
    if (gradeFilter !== 'all') pool = pool.filter((h) => h.grade === gradeFilter);
    return pool;
  }

  function commitDraw(cards: GachaHarness[]) {
    setDrawn(cards);
    setFlipped(new Set());
    setState((s) => ({ last_free_draw_date: today, total_drawn: s.total_drawn + cards.length }));
  }

  function drawFree() {
    if (!isAdmin && usedFreeToday) return;
    const pool = getPool();
    if (pool.length === 0) return;
    commitDraw(drawCards(pool, 1));
  }

  function drawN(n: number) {
    const pool = getPool();
    if (pool.length === 0) return;
    commitDraw(drawCards(pool, Math.min(n, pool.length)));
  }

  function drawPro() {
    if (isAdmin) {
      drawN(PRO_DRAW_COUNT);
      return;
    }
    alert(
      'Pro 구독 시 매번 ' +
        PRO_DRAW_COUNT +
        '장 뽑기 + 무제한 호출량 + Premium S 풀 ($9/월)\n\n다음 세션 결제 연동 예정.',
    );
  }

  function flip(id: string) {
    setFlipped((s) => new Set(s).add(id));
  }

  function reset() {
    setDrawn([]);
    setFlipped(new Set());
  }

  function collectOne(id: string) {
    if (collected.has(id)) return;
    addToCollection([id]);
    setCollected((s) => new Set(s).add(id));
  }

  function collectAll() {
    const ids = drawn.map((c) => c.id);
    addToCollection(ids);
    setCollected((s) => {
      const next = new Set(s);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function adminResetCollection() {
    if (typeof window === 'undefined') return;
    if (!confirm('내 컬렉션을 모두 초기화하시겠어요?')) return;
    window.localStorage.removeItem(COLLECTION_KEY);
    window.localStorage.removeItem(STORAGE_KEY);
    setDrawn([]);
    setFlipped(new Set());
    setCollected(new Set());
    setState({ last_free_draw_date: null, total_drawn: 0 });
    alert('초기화 완료. 페이지가 새로고침됩니다.');
    window.location.reload();
  }

  function adminFillAll() {
    const ids = GACHA_CATALOG.map((h) => h.id);
    addToCollection(ids);
    setCollected(new Set(ids));
    alert('전체 18장 컬렉션에 채움. /gallery 가서 확인하세요.');
  }

  function adminShowAll() {
    setDrawn([...GACHA_CATALOG]);
    setFlipped(new Set(GACHA_CATALOG.map((h) => h.id)));
  }

  return {
    state,
    hydrated,
    filter,
    setFilter,
    gradeFilter,
    setGradeFilter,
    drawn,
    flipped,
    collected,
    remainingFree,
    poolSize: getPool().length,
    drawFree,
    drawN,
    drawPro,
    flip,
    reset,
    collectOne,
    collectAll,
    adminResetCollection,
    adminFillAll,
    adminShowAll,
  };
}
