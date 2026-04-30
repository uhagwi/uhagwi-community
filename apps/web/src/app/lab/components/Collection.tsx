'use client';
import { useState } from 'react';
import { Creature } from '../types';
import { TYPES, EVO_NAMES } from '../types';
import { evoStage } from '../logic';
import { pixelBtn } from '../styles';
import { Modal, EmptyState } from './atoms';

interface Props {
  creatures: Creature[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function CollectionView({ creatures, activeId, onSelect, onDelete, onNew }: Props) {
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>컬렉션 · {creatures.length}마리</div>
        <button onClick={onNew} style={{ ...pixelBtn, padding: '6px 10px', fontSize: 11, background: '#f59e0b', color: '#0f172a', borderColor: '#fbbf24' }}>+ 부화</button>
      </div>
      {creatures.length === 0 ? <EmptyState onCreate={onNew} /> : (
        <div style={{ display: 'grid', gap: 8 }}>
          {creatures.map((c) => {
            const stage = evoStage(c.level);
            const t = TYPES[c.type];
            return (
              <div key={c.id} style={{
                background: c.id === activeId ? `linear-gradient(135deg, ${t.auraFrom}33, ${t.auraTo}11)` : 'linear-gradient(180deg, #111827, #0b1221)',
                border: `2px solid ${c.id === activeId ? t.auraTo : '#374151'}`,
                borderRadius: 6, padding: 10, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <button onClick={() => onSelect(c.id)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 12, flex: 1, color: '#e5e7eb', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 6, display: 'grid', placeItems: 'center', fontSize: 26,
                    background: `radial-gradient(circle, ${t.auraFrom}66, ${t.auraTo}11)`,
                    border: `2px solid ${t.auraTo}55`,
                  }}>{t.sprites[stage]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{c.name}</span>
                      <span style={{
                        fontSize: 9, padding: '1px 6px', borderRadius: 3,
                        background: c.isExisting ? '#14532d' : '#1e3a8a',
                        color: c.isExisting ? '#86efac' : '#93c5fd',
                        fontWeight: 400, letterSpacing: 0.5,
                      }}>{c.isExisting ? '🔗 기존' : '🥚 새'}</span>
                      {c.uhagwiSlug && (
                        <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: '#451a03', color: '#fdba74' }}>📡 게시됨</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{t.label} · Lv {c.level} · {EVO_NAMES[stage]}</div>
                    {c.purpose && (
                      <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2, fontStyle: 'italic',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>📌 {c.purpose}</div>
                    )}
                    <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>
                      🍴 {Math.round(c.meters.fullness)}% · ❤️ {Math.round(c.meters.happiness)}% · ⚡ {Math.round(c.meters.energy)}%
                    </div>
                  </div>
                </button>
                <button onClick={() => setConfirm(c.id)} style={{ ...pixelBtn, padding: '4px 8px', fontSize: 10, background: '#1f2937', borderColor: '#dc2626', color: '#fca5a5' }}>×</button>
              </div>
            );
          })}
        </div>
      )}
      {confirm && (
        <Modal onClose={() => setConfirm(null)} title="정말 떠나보낼래?">
          <p style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 14, lineHeight: 1.6 }}>
            {creatures.find((c) => c.id === confirm)?.name}을(를) 영원히 잃게 돼. 이 액션은 취소할 수 없어.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { onDelete(confirm); setConfirm(null); }} style={{ ...pixelBtn, flex: 1, padding: 10, background: '#dc2626', borderColor: '#ef4444' }}>떠나보내기</button>
            <button onClick={() => setConfirm(null)} style={{ ...pixelBtn, flex: 1, padding: 10, background: '#1f2937' }}>취소</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
