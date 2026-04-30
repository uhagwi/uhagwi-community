'use client';
import { ReactNode } from 'react';
import { pixelBtn } from '../styles';
import { nowTs } from '../logic';

export function Dot({ color }: { color: string }) {
  return <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />;
}

export function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{
      ...pixelBtn, padding: '6px 9px', fontSize: 10,
      background: active ? '#f59e0b' : '#1f2937',
      color: active ? '#0f172a' : '#e5e7eb',
      borderColor: active ? '#fbbf24' : '#374151',
    }}>{children}</button>
  );
}

export function PixelBar({ value, max, fillColor }: { value: number; max: number; fillColor: string }) {
  const cells = 16;
  const filled = Math.round((value / max) * cells);
  return (
    <div style={{ display: 'flex', gap: 2, height: 10, background: '#0a1f0a55', padding: 1, borderRadius: 2 }}>
      {Array.from({ length: cells }, (_, i) => (
        <div key={i} style={{
          flex: 1,
          background: i < filled ? fillColor : 'transparent',
          opacity: i < filled ? (0.55 + (i / cells) * 0.45) : 1,
          borderRadius: 1,
          boxShadow: i < filled ? `0 0 4px ${fillColor}88` : 'none',
        }} />
      ))}
    </div>
  );
}

export function Meter({ icon, label, value, warn }: { icon: string; label: string; value: number; warn?: boolean }) {
  const v = Math.round(value);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3, color: warn ? '#fca5a5' : '#86efac' }}>
        <span>{icon} {label}</span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{v}%</span>
      </div>
      <PixelBar value={v} max={100} fillColor={warn ? '#ef4444' : '#86efac'} />
    </div>
  );
}

export function ActionBtn({ icon, label, onClick, disabled }: { icon: string; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...pixelBtn, padding: '12px 6px',
      background: disabled ? '#1f2937' : 'linear-gradient(180deg, #374151, #1f2937)',
      borderColor: '#4b5563',
      color: disabled ? '#6b7280' : '#fff',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      opacity: disabled ? 0.6 : 1,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 700 }}>{label}</span>
    </button>
  );
}

export function Modal({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'grid', placeItems: 'center', zIndex: 40, padding: 16,
      animation: 'hl-fadeIn 0.2s',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'linear-gradient(180deg, #111827, #0b1221)',
        border: '2px solid #4b5563', borderRadius: 8, padding: 18,
        maxWidth: 420, width: '100%', maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        animation: 'hl-modalIn 0.25s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ ...pixelBtn, padding: '4px 8px', fontSize: 11, background: '#1f2937' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{
      marginBottom: 12, background: 'linear-gradient(180deg, #111827, #0b1221)',
      border: '2px solid #374151', borderRadius: 8, padding: 14,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, color: '#cbd5e1', letterSpacing: 1 }}>{title}</div>
      {children}
    </div>
  );
}

export function BigStat({ label, value, unit, accent }: { label: string; value: number; unit: string; accent: string }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
      border: `2px solid ${accent}55`, borderRadius: 6, padding: 12,
    }}>
      <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
        {value}<span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  );
}

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #111827, #0b1221)',
      border: '2px solid #374151', borderRadius: 8, padding: 28, textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, marginBottom: 12 }}>🥚</div>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>아직 키우는 하네스가 없어</div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16, lineHeight: 1.6 }}>
        하네스 알을 부화시켜서<br />
        AI 쓸 때마다 같이 자라게 해봐
      </div>
      <button onClick={onCreate} style={{ ...pixelBtn, padding: '10px 20px', background: '#f59e0b', color: '#0f172a', borderColor: '#fbbf24' }}>
        + 첫 하네스 부화시키기
      </button>
    </div>
  );
}

// timestamp 의존성 마커 — tree-shake 방지용 dummy ref
export const _atomBuiltAt = nowTs();
