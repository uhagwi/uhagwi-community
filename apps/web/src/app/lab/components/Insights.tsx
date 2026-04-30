'use client';
import { useMemo } from 'react';
import { Creature } from '../types';
import { TYPES, EVO_NAMES, FOODS } from '../types';
import { evoStage, computeInsights, todayKey, nowTs, relTime } from '../logic';
import { Section, BigStat } from './atoms';

export function InsightsView({ creature }: { creature: Creature }) {
  const t = TYPES[creature.type];
  const insights = useMemo(() => computeInsights(creature), [creature]);

  return (
    <div>
      <div style={{
        background: `linear-gradient(135deg, ${t.auraFrom}22, ${t.auraTo}11)`,
        border: `2px solid ${t.auraTo}55`, borderRadius: 8, padding: 14, marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ fontSize: 32 }}>{t.sprites[evoStage(creature.level)]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{creature.name}</span>
            <span style={{
              fontSize: 9, padding: '1px 5px', borderRadius: 3,
              background: creature.isExisting ? '#14532d' : '#1e3a8a',
              color: creature.isExisting ? '#86efac' : '#93c5fd',
              fontWeight: 400,
            }}>{creature.isExisting ? '🔗 기존' : '🥚 새'}</span>
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>{t.label} · {EVO_NAMES[evoStage(creature.level)]} · 나이 {Math.floor((nowTs() - creature.createdAt) / 86_400_000)}일</div>
          {creature.purpose && (
            <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>📌 {creature.purpose}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <BigStat label="오늘 AI 사용"  value={insights.todayFeeds} unit="회" accent="#22c55e" />
        <BigStat label="연속 사용"    value={insights.streak}     unit="일" accent="#f59e0b" />
        <BigStat label="이번 주"      value={insights.weekFeeds}  unit="회" accent="#3b82f6" />
        <BigStat label="누적 기록"    value={insights.totalFeeds} unit="회" accent="#a855f7" />
      </div>

      <Section title="최근 7일">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, padding: '8px 4px' }}>
          {insights.last7Days.map((d, i) => {
            const max = Math.max(1, ...insights.last7Days.map((x) => x.count));
            const h = (d.count / max) * 100;
            const isToday = d.key === todayKey();
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{d.count}</div>
                <div style={{
                  width: '100%', height: `${Math.max(4, h)}%`,
                  background: isToday ? `linear-gradient(180deg, ${t.auraTo}, ${t.auraFrom})` : `linear-gradient(180deg, ${t.auraTo}88, ${t.auraTo}22)`,
                  borderRadius: 2,
                  boxShadow: d.count > 0 ? `0 0 6px ${t.auraTo}55` : 'none',
                  border: isToday ? `1px solid ${t.auraFrom}` : 'none',
                }} />
                <div style={{ fontSize: 9, color: isToday ? t.auraFrom : '#6b7280', fontWeight: isToday ? 700 : 400 }}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="어떤 종류로 많이 썼어?">
        {insights.totalFeeds === 0 ? (
          <div style={{ fontSize: 10, color: '#6b7280', textAlign: 'center', padding: 12 }}>
            아직 데이터가 없어. 프롬프트를 써보면 여기에 분포가 쌓여.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(insights.foodDistribution)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([k, count]) => {
                const f = FOODS[k as keyof typeof FOODS];
                const pct = Math.round(((count as number) / insights.totalFeeds) * 100);
                return (
                  <div key={k}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                      <span>{f.emoji} {f.label}</span>
                      <span style={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{count}회 · {pct}%</span>
                    </div>
                    <div style={{ height: 8, background: '#0a0f1c', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: f.color, boxShadow: `0 0 6px ${f.color}77` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Section>

      {insights.topTemplates.length > 0 && (
        <Section title="가장 많이 쓴 템플릿">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {insights.topTemplates.map((tmpl) => (
              <div key={tmpl.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 10, padding: '8px 10px', background: '#0b1221',
                borderLeft: `3px solid ${FOODS[tmpl.foodType]?.color || '#374151'}`, borderRadius: 2,
              }}>
                <span>{FOODS[tmpl.foodType]?.emoji} {tmpl.label}</span>
                <span style={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{tmpl.useCount}회</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="언제 주로 써?">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
          {insights.hourBuckets.map((b, i) => {
            const max = Math.max(1, ...insights.hourBuckets);
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{
                  width: '100%', height: `${(b / max) * 100}%`,
                  background: b > 0 ? t.auraTo : '#374151',
                  minHeight: 2, borderRadius: 1, opacity: b > 0 ? 0.85 : 0.3,
                }} />
                {i % 6 === 0 && <div style={{ fontSize: 8, color: '#6b7280' }}>{i}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 9, color: '#6b7280', textAlign: 'center', marginTop: 6 }}>
          시간대 (0-23시) · 가장 활발: {insights.peakHour !== null ? `${insights.peakHour}시` : '—'}
        </div>
      </Section>

      <Section title="최근에 뭘 했어?">
        {insights.recentNotes.length === 0 ? (
          <div style={{ fontSize: 10, color: '#6b7280', textAlign: 'center', padding: 12 }}>
            기록 시 메모를 남기면 여기에 보여.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {insights.recentNotes.map((n, i) => (
              <div key={i} style={{
                fontSize: 10, padding: '8px 10px', background: '#0b1221',
                borderLeft: `2px solid ${FOODS[n.foodType!]?.color || '#374151'}`, borderRadius: 2,
                color: '#cbd5e1',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span>{FOODS[n.foodType!]?.emoji} {FOODS[n.foodType!]?.label}</span>
                  <span style={{ color: '#4b5563', fontSize: 9 }}>{relTime(n.t)}</span>
                </div>
                <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>&ldquo;{n.note}&rdquo;</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
