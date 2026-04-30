// Harness Lab — 영속화 어댑터
// 1차: localStorage 단독 (오프라인·즉시동작)
// 2차: 우하귀 Supabase 동기화 진입점은 bridge.ts 에 분리
'use client';

import type { Creature } from './types';
import { STORAGE_ACTIVE, STORAGE_CREATURES } from './types';

export interface LoadResult {
  creatures: Creature[];
  activeId: string | null;
}

export async function loadAll(): Promise<LoadResult> {
  if (typeof window === 'undefined') return { creatures: [], activeId: null };
  let creatures: Creature[] = [];
  let activeId: string | null = null;
  try {
    const raw = window.localStorage.getItem(STORAGE_CREATURES);
    if (raw) creatures = JSON.parse(raw);
  } catch (_) { /* corrupt — drop silently */ }
  try {
    activeId = window.localStorage.getItem(STORAGE_ACTIVE);
  } catch (_) { /* ignore */ }
  return { creatures, activeId };
}

export async function saveCreatures(list: Creature[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_CREATURES, JSON.stringify(list));
  } catch (e) {
    console.error('[lab] saveCreatures failed', e);
  }
}

export async function saveActive(id: string | null): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if (id) window.localStorage.setItem(STORAGE_ACTIVE, id);
    else window.localStorage.removeItem(STORAGE_ACTIVE);
  } catch (_) { /* ignore */ }
}

export function exportJson(list: Creature[]): string {
  return JSON.stringify({ version: 2, creatures: list, exportedAt: Date.now() }, null, 2);
}

export function importJson(raw: string): Creature[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Creature[];
    if (parsed && Array.isArray(parsed.creatures)) return parsed.creatures as Creature[];
    return null;
  } catch (_) {
    return null;
  }
}
