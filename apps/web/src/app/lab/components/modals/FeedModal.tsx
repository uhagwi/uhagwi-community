'use client';
import { useState } from 'react';
import { FoodKey, FOODS, STAT_META } from '../../types';
import { pixelBtn, inputStyle } from '../../styles';
import { Modal } from '../atoms';

export function FeedModal({ onClose, onSubmit, recentNotes }: {
  onClose: () => void;
  onSubmit: (food: FoodKey, note: string) => void;
  recentNotes: string[];
}) {
  const [picked, setPicked] = useState<FoodKey | null>(null);
  const [note, setNote] = useState('');

  return (
    <Modal onClose={onClose} title="AI 사용 기록">
      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 12, lineHeight: 1.6 }}>
        Claude를 어떤 종류로 썼어? 노트는 선택사항이지만, 남기면 나중에 패턴 보일 때 도움 됨.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {(Object.entries(FOODS) as [FoodKey, typeof FOODS[FoodKey]][]).map(([key, f]) => (
          <button key={key} onClick={() => setPicked(key)} style={{
            ...pixelBtn,
            background: picked === key ? `linear-gradient(135deg, ${f.color}66, ${f.color}22)` : `linear-gradient(135deg, ${f.color}22, ${f.color}08)`,
            borderColor: picked === key ? f.color : `${f.color}55`,
            padding: '12px 8px', textAlign: 'left',
          }}>
            <div style={{ fontSize: 22 }}>{f.emoji}</div>
            <div style={{ fontWeight: 700, marginTop: 4, fontSize: 12 }}>{f.label}</div>
            <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 2 }}>{STAT_META[f.stat].label} +</div>
          </button>
        ))}
      </div>

      <label style={{ fontSize: 10, color: '#9ca3af' }}>노트 (선택)</label>
      <input value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="무슨 일에 썼어? 예: API 에러 디버깅"
        style={{ ...inputStyle, marginBottom: 8 }} />

      {recentNotes.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 4 }}>최근 노트:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {recentNotes.map((n, i) => (
              <button key={i} onClick={() => setNote(n)} style={{
                ...pixelBtn, padding: '4px 8px', fontSize: 10,
                background: '#0b1221', borderColor: '#374151', color: '#94a3b8',
              }}>{n.slice(0, 24)}{n.length > 24 ? '…' : ''}</button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => picked && onSubmit(picked, note)} disabled={!picked} style={{
        ...pixelBtn, width: '100%', padding: 12,
        background: picked ? '#f59e0b' : '#374151',
        color: picked ? '#0f172a' : '#6b7280',
        borderColor: picked ? '#fbbf24' : '#4b5563',
        cursor: picked ? 'pointer' : 'not-allowed',
      }}>기록하기</button>
    </Modal>
  );
}
