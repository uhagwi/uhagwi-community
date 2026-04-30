'use client';
import { useState } from 'react';
import { Creature, FoodKey, FOODS, TYPES } from '../../types';
import { pixelBtn, inputStyle } from '../../styles';
import { Modal } from '../atoms';

export function TemplatesModal({ creature, onClose, onUse, onAdd, onRemove }: {
  creature: Creature;
  onClose: () => void;
  onUse: (t: Creature['templates'][0]) => Promise<void> | void;
  onAdd: (label: string, body: string, foodType: FoodKey) => void;
  onRemove: (id: string) => void;
}) {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [label, setLabel] = useState('');
  const [body, setBody] = useState('');
  const [foodType, setFoodType] = useState<FoodKey>('prompt');
  const t = TYPES[creature.type];
  const canAdd = label.trim() && body.trim();

  return (
    <Modal onClose={onClose} title="🎯 프롬프트 라이브러리">
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <button onClick={() => setTab('list')} style={{
          ...pixelBtn, flex: 1, padding: '6px 10px', fontSize: 11,
          background: tab === 'list' ? t.auraTo : '#1f2937',
          color: tab === 'list' ? '#0f172a' : '#e5e7eb',
        }}>리스트 ({creature.templates.length})</button>
        <button onClick={() => setTab('add')} style={{
          ...pixelBtn, flex: 1, padding: '6px 10px', fontSize: 11,
          background: tab === 'add' ? t.auraTo : '#1f2937',
          color: tab === 'add' ? '#0f172a' : '#e5e7eb',
        }}>+ 새 템플릿</button>
      </div>

      {tab === 'list' && (
        <>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 10, lineHeight: 1.6 }}>
            탭하면 프롬프트가 클립보드에 복사되고 자동으로 기록돼. Claude Code에 붙여넣기만 하면 됨.
          </div>
          {creature.templates.length === 0 ? (
            <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', padding: 20 }}>
              템플릿이 없어. + 탭에서 만들어봐.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {creature.templates.map((tmpl) => {
                const f = FOODS[tmpl.foodType];
                return (
                  <div key={tmpl.id} style={{
                    background: `linear-gradient(135deg, ${f.color}11, transparent)`,
                    border: `2px solid ${f.color}33`, borderRadius: 4, overflow: 'hidden',
                  }}>
                    <button onClick={() => onUse(tmpl)} style={{
                      width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
                      color: '#e5e7eb', cursor: 'pointer', fontFamily: 'inherit', padding: '10px 12px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 12 }}>{f.emoji} {tmpl.label}</span>
                        <span style={{ fontSize: 9, color: '#94a3b8' }}>
                          {tmpl.useCount > 0 ? `${tmpl.useCount}회 사용` : '미사용'} · 탭해서 복사
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5,
                        whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>{tmpl.body}</div>
                    </button>
                    <button onClick={() => onRemove(tmpl.id)} style={{
                      width: '100%', padding: '4px 0', fontSize: 9,
                      background: '#0a0f1c', border: 'none', borderTop: `1px solid ${f.color}22`,
                      color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit',
                    }}>삭제</button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'add' && (
        <div>
          <label style={{ fontSize: 10, color: '#9ca3af' }}>라벨 (짧게)</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="예: 코드 리뷰" maxLength={30} style={inputStyle} />
          <label style={{ fontSize: 10, color: '#9ca3af' }}>프롬프트 본문</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6}
            placeholder="여기에 자주 쓰는 프롬프트를…&#10;[코드] 같은 플레이스홀더도 OK"
            style={{ ...inputStyle, fontSize: 11, lineHeight: 1.5, resize: 'vertical' }} />
          <label style={{ fontSize: 10, color: '#9ca3af' }}>분류 (능력치 매핑)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginTop: 4, marginBottom: 12 }}>
            {(Object.entries(FOODS) as [FoodKey, typeof FOODS[FoodKey]][]).map(([key, f]) => (
              <button key={key} onClick={() => setFoodType(key)} style={{
                ...pixelBtn, padding: '8px 4px', fontSize: 9,
                background: foodType === key ? f.color : '#1f2937',
                borderColor: foodType === key ? f.color : '#374151',
                color: foodType === key ? '#fff' : '#cbd5e1',
              }}>
                <div style={{ fontSize: 14 }}>{f.emoji}</div>
                <div>{f.label}</div>
              </button>
            ))}
          </div>
          <button onClick={() => {
            if (!canAdd) return;
            onAdd(label.trim(), body, foodType);
            setLabel(''); setBody(''); setFoodType('prompt'); setTab('list');
          }} disabled={!canAdd} style={{
            ...pixelBtn, width: '100%', padding: 12,
            background: canAdd ? '#f59e0b' : '#374151',
            color: canAdd ? '#0f172a' : '#6b7280',
            borderColor: canAdd ? '#fbbf24' : '#4b5563',
            cursor: canAdd ? 'pointer' : 'not-allowed',
          }}>저장</button>
        </div>
      )}
    </Modal>
  );
}
