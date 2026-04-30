// Harness Lab — 순수 도메인 로직 (UI 비의존)
import {
  Creature, FoodKey, HistoryEntry, StarterTemplate, StatKey, Template, TypeKey,
  EVO_LEVELS, FOODS, TYPES,
} from './types';

export const clamp = (v: number, mn = 0, mx = 100) => Math.max(mn, Math.min(mx, v));
export const nowTs = () => Date.now();
export const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const todayKey = () => dayKey(nowTs());

export const evoStage = (lv: number) => {
  for (let i = EVO_LEVELS.length - 1; i >= 0; i--) {
    const threshold = EVO_LEVELS[i] ?? 0;
    if (lv >= threshold) return i;
  }
  return 0;
};
export const xpForNext = (lv: number) => Math.floor(18 + lv * lv * 3.5);

export function applyDecay(c: Creature): Creature {
  const last = c.lastTickAt || c.lastInteractionAt || c.createdAt;
  const hours = Math.max(0, (nowTs() - last) / 3_600_000);
  if (hours < 0.01) return c;
  return {
    ...c,
    meters: {
      fullness:  clamp(c.meters.fullness  - hours * 4),
      happiness: clamp(c.meters.happiness - hours * 3),
      energy:    clamp(c.meters.energy    + hours * 2.5),
    },
    lastTickAt: nowTs(),
  };
}

export interface NewCreatureOpts {
  name: string;
  type: TypeKey;
  purpose?: string;
  data?: string;
  isExisting?: boolean;
}

export function newCreature(opts: NewCreatureOpts): Creature {
  const { name, type, purpose = '', data = '', isExisting = false } = opts;
  const t = TYPES[type];
  const baseLevel = isExisting ? 3 : 1;
  const baseStats: Record<StatKey, number> = isExisting
    ? { sophistication: 8, intel: 8, creativity: 8, speed: 8, hp: 18 }
    : { sophistication: 5, intel: 5, creativity: 5, speed: 5, hp: 12 };

  const initialHistory: HistoryEntry[] = [];
  if (isExisting && data.trim()) {
    const preview = data.trim().slice(0, 80);
    initialHistory.push({
      t: nowTs(), kind: 'feed', foodType: 'context',
      label: '📚 컨텍스트',
      note: '기존 셋업 등록 · ' + preview + (data.length > 80 ? '…' : ''),
      source: 'register',
    });
  } else if (!isExisting && purpose.trim()) {
    initialHistory.push({
      t: nowTs(), kind: 'feed', foodType: 'prompt',
      label: '🥚 부화',
      note: purpose.trim(),
      source: 'birth',
    });
  }

  return {
    id: 'c_' + nowTs().toString(36) + Math.random().toString(36).slice(2, 6),
    name: (name || '').trim() || '이름없음',
    type,
    purpose: purpose.trim(),
    data: data.trim(),
    isExisting: !!isExisting,
    level: baseLevel, xp: 0,
    stats: baseStats,
    meters: { fullness: 80, happiness: 85, energy: 100 },
    createdAt: nowTs(), lastInteractionAt: nowTs(), lastTickAt: nowTs(),
    feedCount: initialHistory.length, trainCount: 0, playCount: 0,
    history: initialHistory,
    templates: t.starterTemplates.map((tmpl: StarterTemplate, i: number) => ({
      id: 't_' + i + '_' + nowTs().toString(36),
      ...tmpl, useCount: 0,
    })),
    uhagwiSlug: null,
  };
}

export interface XpResult {
  level: number;
  xp: number;
  leveled: boolean;
  evolved: boolean;
  postStage: number;
}

export function grantXp(creature: Creature, amount: number): XpResult {
  let { level, xp } = creature;
  let leveled = false;
  const preStage = evoStage(level);
  xp += amount;
  while (xp >= xpForNext(level)) {
    xp -= xpForNext(level);
    level += 1;
    leveled = true;
    const bias = TYPES[creature.type].bias;
    (Object.keys(creature.stats) as StatKey[]).forEach((k) => {
      creature.stats[k] = Math.round((creature.stats[k] + 0.6 + (bias[k] || 0) * 1.5) * 10) / 10;
    });
  }
  return { level, xp, leveled, evolved: evoStage(level) > preStage, postStage: evoStage(level) };
}

export interface Insights {
  todayFeeds: number;
  streak: number;
  weekFeeds: number;
  totalFeeds: number;
  last7Days: { key: string; label: string; count: number }[];
  foodDistribution: Partial<Record<FoodKey, number>>;
  topTemplates: Template[];
  hourBuckets: number[];
  peakHour: number | null;
  recentNotes: HistoryEntry[];
}

export function computeInsights(c: Creature): Insights {
  const feeds = c.history.filter((h) => h.kind === 'feed');
  const today = todayKey();
  const todayFeeds = feeds.filter((h) => dayKey(h.t) === today).length;

  const dayCounts: Record<string, number> = {};
  feeds.forEach((h) => {
    const k = dayKey(h.t);
    dayCounts[k] = (dayCounts[k] || 0) + 1;
  });

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!dayCounts[today]) cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const k = dayKey(cursor.getTime());
    if (dayCounts[k]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }

  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const last7Days: Insights['last7Days'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const k = dayKey(d.getTime());
    last7Days.push({
      key: k,
      label: DOW[d.getDay()] ?? '?',
      count: dayCounts[k] || 0,
    });
  }
  const weekFeeds = last7Days.reduce((s, d) => s + d.count, 0);

  const foodDistribution: Partial<Record<FoodKey, number>> = {};
  feeds.forEach((h) => {
    if (h.foodType) {
      foodDistribution[h.foodType] = (foodDistribution[h.foodType] || 0) + 1;
    }
  });

  const topTemplates = [...c.templates]
    .filter((t) => t.useCount > 0)
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, 5);

  const hourBuckets = Array(24).fill(0);
  feeds.forEach((h) => {
    const hr = new Date(h.t).getHours();
    hourBuckets[hr]++;
  });
  const peakHour = hourBuckets.some((x) => x > 0)
    ? hourBuckets.indexOf(Math.max(...hourBuckets))
    : null;

  const recentNotes = feeds.filter((h) => h.note).slice(0, 5);

  return {
    todayFeeds, streak, weekFeeds, totalFeeds: feeds.length,
    last7Days, foodDistribution, topTemplates, hourBuckets, peakHour, recentNotes,
  };
}

export function relTime(t: number): string {
  const m = Math.floor((nowTs() - t) / 60000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export function topNote(creature: Creature | null): string | null {
  if (!creature) return null;
  const f = creature.history.find((h) => h.kind === 'feed' && h.note);
  return f?.note || null;
}

// FoodKey + foodLabel 추출 헬퍼 (FOODS 사용을 위한 wrapper)
export function foodOf(key?: FoodKey) {
  if (!key) return null;
  return FOODS[key];
}
