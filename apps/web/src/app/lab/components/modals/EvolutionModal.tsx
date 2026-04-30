'use client';
import { useEffect, useState } from 'react';
import { Creature, EVO_NAMES, TYPES } from '../../types';
import { pixelBtn } from '../../styles';

export function EvolutionModal({ creature, stage, onClose }: {
  creature: Creature | null;
  stage: number;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (!creature) return null;
  const t = TYPES[creature.type];
  const newSprite = t.sprites[stage];
  const oldSprite = t.sprites[Math.max(0, stage - 1)];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
      display: 'grid', placeItems: 'center', zIndex: 50, animation: 'hl-fadeIn 0.4s',
    }}>
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 11, color: '#fbbf24', letterSpacing: 4, marginBottom: 14 }}>EVOLUTION</div>
        <div style={{ width: 200, height: 200, margin: '0 auto', position: 'relative', display: 'grid', placeItems: 'center' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle, ${t.auraFrom}, transparent 70%)`,
            animation: phase >= 1 ? 'hl-evoGlow 1.8s ease-in-out infinite' : 'none',
            borderRadius: '50%',
          }} />
          <div style={{
            fontSize: 100, position: 'relative',
            animation: phase === 1 ? 'hl-evoSpin 1.8s ease-in-out' : 'none',
            opacity: phase === 2 ? 1 : phase === 1 ? 0.5 : 1,
            transition: 'opacity 0.4s',
            filter: 'drop-shadow(0 0 30px rgba(251,191,36,0.7))',
          }}>{phase < 2 ? oldSprite : newSprite}</div>
        </div>
        {phase === 2 && (
          <div style={{ marginTop: 18, animation: 'hl-fadeIn 0.4s' }}>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{creature.name}이(가) 진화했다!</div>
            <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>→ {EVO_NAMES[stage]}</div>
            <button onClick={onClose} style={{ ...pixelBtn, marginTop: 18, padding: '10px 24px', background: '#f59e0b', color: '#0f172a', borderColor: '#fbbf24' }}>계속</button>
          </div>
        )}
      </div>
    </div>
  );
}
