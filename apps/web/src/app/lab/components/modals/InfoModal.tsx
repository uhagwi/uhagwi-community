'use client';
import { useEffect, useState } from 'react';
import { Creature, EVO_NAMES, TYPES } from '../../types';
import { evoStage, nowTs } from '../../logic';
import { pixelBtn, inputStyle } from '../../styles';
import { Modal } from '../atoms';

export function InfoModal({ creature, onClose, onSave }: {
  creature: Creature;
  onClose: () => void;
  onSave: (updates: Partial<Pick<Creature, 'purpose' | 'data'>>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [purpose, setPurpose] = useState(creature.purpose || '');
  const [data, setData] = useState(creature.data || '');
  const t = TYPES[creature.type];
  const stage = evoStage(creature.level);

  useEffect(() => {
    setPurpose(creature.purpose || '');
    setData(creature.data || '');
  }, [creature.id, creature.purpose, creature.data]);

  const handleSave = () => {
    onSave({ purpose: purpose.trim(), data: data.trim() });
    setEditing(false);
  };
  const handleCancel = () => {
    setPurpose(creature.purpose || '');
    setData(creature.data || '');
    setEditing(false);
  };

  const ageDays = Math.floor((nowTs() - creature.createdAt) / 86_400_000);

  return (
    <Modal onClose={onClose} title="하네스 정보">
      <div style={{
        background: `linear-gradient(135deg, ${t.auraFrom}22, ${t.auraTo}11)`,
        border: `2px solid ${t.auraTo}55`, borderRadius: 6, padding: 12, marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 28 }}>{t.sprites[stage]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{creature.name}</div>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              {creature.isExisting ? '🔗 기존 하네스' : '🥚 새 하네스'} · {t.label} · Lv {creature.level} {EVO_NAMES[stage]}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
          <span>생성: {new Date(creature.createdAt).toLocaleDateString('ko-KR')}</span>
          <span>나이 {ageDays}일</span>
        </div>
        {creature.uhagwiSlug && (
          <div style={{ marginTop: 6, fontSize: 9, color: '#fdba74' }}>
            📡 우하귀 갤러리: <a href={`/harnesses/${creature.uhagwiSlug}`} style={{ color: '#fb923c' }}>{creature.uhagwiSlug}</a>
          </div>
        )}
      </div>

      {!editing ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>📌 목적</div>
            <div style={{
              fontSize: 12, color: purpose ? '#e5e7eb' : '#6b7280',
              lineHeight: 1.6, padding: '10px 12px', background: '#0b1221',
              border: '1px solid #374151', borderRadius: 4,
            }}>{purpose || '(없음)'}</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>📦 데이터</div>
            <div style={{
              fontSize: 11, color: data ? '#cbd5e1' : '#6b7280',
              lineHeight: 1.5, padding: '10px 12px', background: '#0b1221',
              border: '1px solid #374151', borderRadius: 4,
              whiteSpace: 'pre-wrap', maxHeight: 240, overflowY: 'auto',
              fontFamily: data ? 'JetBrains Mono, monospace' : 'inherit',
            }}>{data || '(없음)'}</div>
          </div>

          <button onClick={() => setEditing(true)} style={{ ...pixelBtn, width: '100%', padding: 10, background: '#1f2937' }}>편집</button>
        </>
      ) : (
        <>
          <label style={{ fontSize: 10, color: '#9ca3af' }}>📌 목적</label>
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={120}
            placeholder="이 하네스로 뭘 해?" style={inputStyle} />

          <label style={{ fontSize: 10, color: '#9ca3af' }}>📦 데이터</label>
          <textarea value={data} onChange={(e) => setData(e.target.value)} rows={8}
            placeholder="claude.md, 시스템 프롬프트, 셋업 노트…"
            style={{ ...inputStyle, fontSize: 11, lineHeight: 1.5, resize: 'vertical', fontFamily: 'JetBrains Mono, monospace' }} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{
              ...pixelBtn, flex: 1, padding: 10,
              background: '#f59e0b', color: '#0f172a', borderColor: '#fbbf24',
            }}>저장</button>
            <button onClick={handleCancel} style={{ ...pixelBtn, flex: 1, padding: 10, background: '#1f2937' }}>취소</button>
          </div>
        </>
      )}
    </Modal>
  );
}
