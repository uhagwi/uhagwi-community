'use client';
import { useState } from 'react';
import { TYPES, TypeKey } from '../types';
import type { NewCreatureOpts } from '../logic';
import { pixelBtn, inputStyle } from '../styles';

interface Props {
  onCreate: (opts: NewCreatureOpts & { isExisting: boolean }) => void;
  onCancel: () => void;
  hasCreatures: boolean;
}

export function CreateView({ onCreate, onCancel, hasCreatures }: Props) {
  const [step, setStep] = useState<'path' | 'form'>('path');
  const [path, setPath] = useState<'new' | 'existing' | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<TypeKey>('coder');
  const [purpose, setPurpose] = useState('');
  const [data, setData] = useState('');

  if (step === 'path') {
    return (
      <div style={{ background: 'linear-gradient(180deg, #111827, #0b1221)', border: '2px solid #374151', borderRadius: 8, padding: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>하네스 추가</div>
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 16, lineHeight: 1.6 }}>
          새로 만들 거야, 아니면 이미 쓰고 있는 거야?
        </div>
        <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
          <button onClick={() => { setPath('new'); setStep('form'); }} style={{
            ...pixelBtn, padding: 16, textAlign: 'left',
            background: 'linear-gradient(135deg, #1e40af33, #1e293b)',
            borderColor: '#3b82f6',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>🥚</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>새 하네스 부화</span>
            </div>
            <div style={{ fontSize: 10, color: '#cbd5e1', lineHeight: 1.5 }}>
              앞으로 만들 Claude Code 셋업.<br />
              목적부터 정하고, 키워가면서 채워.
            </div>
          </button>
          <button onClick={() => { setPath('existing'); setStep('form'); }} style={{
            ...pixelBtn, padding: 16, textAlign: 'left',
            background: 'linear-gradient(135deg, #14532d33, #1e293b)',
            borderColor: '#22c55e',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>🔗</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>기존 하네스 등록</span>
            </div>
            <div style={{ fontSize: 10, color: '#cbd5e1', lineHeight: 1.5 }}>
              이미 쓰고 있는 셋업. 설정/컨텍스트 붙여넣고<br />
              <span style={{ color: '#86efac' }}>Lv 3 베이비 단계</span>로 시작.
            </div>
          </button>
        </div>
        {hasCreatures && <button onClick={onCancel} style={{ ...pixelBtn, width: '100%', padding: 10, background: '#1f2937' }}>취소</button>}
      </div>
    );
  }

  const isExisting = path === 'existing';
  const canSubmit = name.trim() && purpose.trim() && (!isExisting || data.trim());

  return (
    <div style={{ background: 'linear-gradient(180deg, #111827, #0b1221)', border: '2px solid #374151', borderRadius: 8, padding: 18 }}>
      <button onClick={() => setStep('path')} style={{
        ...pixelBtn, padding: '4px 10px', fontSize: 10, background: '#1f2937', marginBottom: 12,
      }}>← 뒤로</button>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
        {isExisting ? '🔗 기존 하네스 등록' : '🥚 새 하네스 부화'}
      </div>
      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 16 }}>
        {isExisting ? '이미 쓰고 있는 셋업의 정보를 알려줘' : '뭘 만들 건지 정해보자'}
      </div>

      <label style={{ fontSize: 10, color: '#9ca3af' }}>이름 *</label>
      <input value={name} onChange={(e) => setName(e.target.value)}
        placeholder={isExisting ? '예: 메인 셋업, frontend-bot' : '예: 코디, 알파'} maxLength={20}
        style={inputStyle} />

      <label style={{ fontSize: 10, color: '#9ca3af' }}>타입 *</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4, marginBottom: 12 }}>
        {(Object.entries(TYPES) as [TypeKey, typeof TYPES[TypeKey]][]).map(([key, t]) => (
          <button key={key} onClick={() => setType(key)} style={{
            ...pixelBtn,
            background: type === key ? `linear-gradient(135deg, ${t.auraFrom}55, ${t.auraTo}33)` : '#0b1221',
            borderColor: type === key ? t.auraTo : '#374151',
            padding: '8px 6px', textAlign: 'left',
          }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{t.sprites[1]}</div>
            <div style={{ fontWeight: 700, fontSize: 11 }}>{t.label}</div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <label style={{ fontSize: 10, color: '#9ca3af' }}>📌 목적 *</label>
      <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2, marginBottom: 4 }}>
        {isExisting ? '이 하네스로 주로 뭐 해?' : '이 하네스로 뭘 할 거야?'}
      </div>
      <input value={purpose} onChange={(e) => setPurpose(e.target.value)}
        placeholder={isExisting ? '예: 회사 모놀리스 백엔드 작업' : '예: Next.js 풀스택 사이드 프로젝트'} maxLength={120}
        style={inputStyle} />

      <label style={{ fontSize: 10, color: '#9ca3af' }}>
        📦 데이터 {isExisting ? '*' : '(선택)'}
      </label>
      <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2, marginBottom: 4, lineHeight: 1.5 }}>
        {isExisting ? 'claude.md, 시스템 프롬프트, MCP 설정, 자주 쓰는 패턴 등' : '초기 자료, 계획, 참고할 것들 (없어도 OK)'}
      </div>
      <textarea value={data} onChange={(e) => setData(e.target.value)} rows={6}
        placeholder={isExisting
          ? '예:\n- 메인 언어: Python, TypeScript\n- 자주 쓰는 MCP: filesystem, git\n- 코드 스타일: 함수형, 짧은 함수\n- (claude.md 그대로 붙여넣어도 OK)'
          : '예: Next.js + tRPC, 인증/결제 포함, 프로토 단계'}
        style={{ ...inputStyle, fontSize: 11, lineHeight: 1.5, resize: 'vertical' }} />

      <button onClick={() => canSubmit && onCreate({ name, type, purpose, data, isExisting })} disabled={!canSubmit} style={{
        ...pixelBtn, width: '100%', padding: 12,
        background: canSubmit ? '#f59e0b' : '#374151',
        color: canSubmit ? '#0f172a' : '#6b7280',
        borderColor: canSubmit ? '#fbbf24' : '#4b5563',
        cursor: canSubmit ? 'pointer' : 'not-allowed',
      }}>{isExisting ? '등록' : '부화 시작'}</button>
    </div>
  );
}
