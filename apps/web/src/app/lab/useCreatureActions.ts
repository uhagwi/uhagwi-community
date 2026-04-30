'use client';
// Lab — creature 변경 액션 훅 (HarnessLab.tsx 분할)
import { useCallback } from 'react';
import type { Creature, FoodKey, Template } from './types';
import { FOODS } from './types';
import { clamp, grantXp, nowTs } from './logic';

export interface ActionDeps {
  active: Creature | null;
  updateOne: (id: string, fn: (c: Creature) => Creature) => void;
  flash: (kind: string) => void;
  fireToast: (msg: string, tone?: 'info' | 'success' | 'warn') => void;
  openEvoModal: (id: string, stage: number) => void;
}

export function useCreatureActions(deps: ActionDeps) {
  const { active, updateOne, flash, fireToast, openEvoModal } = deps;

  const doFeed = useCallback((foodKey: FoodKey, note = '', source = 'manual', templateId: string | null = null) => {
    if (!active) return;
    const f = FOODS[foodKey];
    flash('feed');
    updateOne(active.id, (c) => {
      const next: Creature = { ...c, stats: { ...c.stats }, meters: { ...c.meters }, history: [...c.history], templates: c.templates };
      next.meters.fullness = clamp(next.meters.fullness + f.fillBase + Math.random() * 4);
      next.meters.happiness = clamp(next.meters.happiness + 2);
      next.stats[f.stat] = Math.round((next.stats[f.stat] + 0.5 + Math.random() * 0.6) * 10) / 10;
      const xpGain = Math.round(f.xpBase + Math.random() * 3);
      const r = grantXp(next, xpGain);
      next.level = r.level; next.xp = r.xp;
      next.feedCount += 1;
      next.lastInteractionAt = nowTs();
      next.history.unshift({
        t: nowTs(), kind: 'feed', foodType: foodKey,
        label: `${f.emoji} ${f.label}`,
        note: note?.trim() || null,
        source,
      });
      next.history = next.history.slice(0, 100);
      if (templateId) {
        next.templates = next.templates.map((t) => t.id === templateId ? { ...t, useCount: (t.useCount || 0) + 1 } : t);
      }
      if (r.evolved) setTimeout(() => openEvoModal(next.id, r.postStage), 300);
      else if (r.leveled) setTimeout(() => fireToast(`Lv ${next.level} 달성!`, 'success'), 200);
      return next;
    });
    fireToast(source === 'template' ? '복사 + 기록 ✓' : `${f.emoji} 기록됨`);
  }, [active, updateOne, flash, fireToast, openEvoModal]);

  const doTrain = useCallback(() => {
    if (!active) return;
    if (active.meters.energy < 20) return fireToast('에너지 부족… 쉬게 해줘 💤', 'warn');
    flash('train');
    updateOne(active.id, (c) => {
      const next: Creature = { ...c, stats: { ...c.stats }, meters: { ...c.meters }, history: [...c.history] };
      const keys = Object.keys(next.stats) as (keyof Creature['stats'])[];
      const focused = keys[Math.floor(Math.random() * keys.length)] as keyof Creature['stats'];
      next.stats[focused] = Math.round((next.stats[focused] + 1.2 + Math.random()) * 10) / 10;
      next.meters.energy = clamp(next.meters.energy - 18);
      next.meters.happiness = clamp(next.meters.happiness - 4);
      next.meters.fullness = clamp(next.meters.fullness - 6);
      const r = grantXp(next, 14 + Math.floor(Math.random() * 8));
      next.level = r.level; next.xp = r.xp; next.trainCount += 1;
      next.lastInteractionAt = nowTs();
      next.history.unshift({ t: nowTs(), kind: 'train', label: `🏋️ 훈련 → ${String(focused)} ↑` });
      next.history = next.history.slice(0, 100);
      if (r.evolved) setTimeout(() => openEvoModal(next.id, r.postStage), 300);
      else if (r.leveled) setTimeout(() => fireToast(`Lv ${next.level} 달성!`, 'success'), 200);
      return next;
    });
    fireToast('🏋️ 훈련 완료');
  }, [active, updateOne, flash, fireToast, openEvoModal]);

  const doPlay = useCallback(() => {
    if (!active) return;
    if (active.meters.energy < 10) return fireToast('너무 지쳐서 못 놀아 💤', 'warn');
    flash('play');
    updateOne(active.id, (c) => {
      const next: Creature = { ...c, meters: { ...c.meters }, stats: { ...c.stats }, history: [...c.history] };
      next.meters.happiness = clamp(next.meters.happiness + 18 + Math.random() * 6);
      next.meters.energy = clamp(next.meters.energy - 10);
      next.meters.fullness = clamp(next.meters.fullness - 4);
      next.stats.creativity = Math.round((next.stats.creativity + 0.3) * 10) / 10;
      const r = grantXp(next, 4);
      next.level = r.level; next.xp = r.xp; next.playCount += 1;
      next.lastInteractionAt = nowTs();
      next.history.unshift({ t: nowTs(), kind: 'play', label: '🎮 놀았다! 행복 ↑' });
      next.history = next.history.slice(0, 100);
      return next;
    });
    fireToast('🎮 신나게 놀았다');
  }, [active, updateOne, flash, fireToast]);

  const doRest = useCallback(() => {
    if (!active) return;
    flash('rest');
    updateOne(active.id, (c) => {
      const next: Creature = { ...c, meters: { ...c.meters }, history: [...c.history] };
      next.meters.energy = clamp(next.meters.energy + 35);
      next.meters.fullness = clamp(next.meters.fullness - 8);
      next.lastInteractionAt = nowTs();
      next.history.unshift({ t: nowTs(), kind: 'rest', label: '💤 휴식' });
      next.history = next.history.slice(0, 100);
      return next;
    });
    fireToast('💤 푹 쉬었다');
  }, [active, updateOne, flash, fireToast]);

  const doRename = useCallback((newName: string) => {
    if (active) updateOne(active.id, (c) => ({ ...c, name: newName.trim() || c.name }));
  }, [active, updateOne]);

  const addTemplate = useCallback((label: string, body: string, foodType: FoodKey) => {
    if (!active) return;
    updateOne(active.id, (c) => ({
      ...c,
      templates: [...c.templates, { id: 't_' + nowTs().toString(36), label, body, foodType, useCount: 0 }],
    }));
    fireToast('템플릿 추가됨', 'success');
  }, [active, updateOne, fireToast]);

  const removeTemplate = useCallback((tid: string) => {
    if (!active) return;
    updateOne(active.id, (c) => ({ ...c, templates: c.templates.filter((t) => t.id !== tid) }));
  }, [active, updateOne]);

  const useTemplate = useCallback(async (tmpl: Template) => {
    try { await navigator.clipboard.writeText(tmpl.body); } catch (_) { /* ignore */ }
    doFeed(tmpl.foodType, tmpl.label, 'template', tmpl.id);
  }, [doFeed]);

  return { doFeed, doTrain, doPlay, doRest, doRename, addTemplate, removeTemplate, useTemplate };
}
