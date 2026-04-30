'use client';
import { useEffect, useState } from 'react';
import { Creature } from '../types';
import { TYPES, EVO_NAMES, STAT_META } from '../types';
import { evoStage, xpForNext, dayKey, todayKey, relTime } from '../logic';
import { pixelBtn } from '../styles';
import { Dot, PixelBar, Meter, ActionBtn } from './atoms';

interface Props {
  creature: Creature;
  screenFx: string | null;
  onFeedOpen: () => void;
  onTemplatesOpen: () => void;
  onInfoOpen: () => void;
  onTrain: () => void;
  onPlay: () => void;
  onRest: () => void;
  onRename: (n: string) => void;
  onPublish?: () => void;
}

export function DeviceView({
  creature, screenFx, onFeedOpen, onTemplatesOpen, onTrain, onPlay, onRest, onRename, onInfoOpen, onPublish,
}: Props) {
  const t = TYPES[creature.type];
  const stage = evoStage(creature.level);
  const sprite = t.sprites[stage];
  const xpNeed = xpForNext(creature.level);
  const moodIcon = creature.meters.happiness < 30 ? '😢'
    : creature.meters.fullness < 30 ? '🥺'
    : creature.meters.energy < 25 ? '😴' : '😊';
  const [editName, setEditName] = useState(false);
  const [tempName, setTempName] = useState(creature.name);
  useEffect(() => { setTempName(creature.name); }, [creature.id, creature.name]);

  const todayCount = creature.history.filter((h) => h.kind === 'feed' && dayKey(h.t) === todayKey()).length;

  return (
    <div>
      <div style={{
        background: 'linear-gradient(160deg, #1f2937 0%, #0b1221 100%)',
        border: '3px solid #374151', borderRadius: 22, padding: 14,
        boxShadow: '0 18px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <Dot color="#ef4444" /><Dot color="#f59e0b" /><Dot color="#22c55e" />
          </div>
          <div style={{ fontSize: 9, color: '#6b7280', letterSpacing: 1 }}>
            {creature.isExisting ? '🔗' : '🥚'} {creature.type.toUpperCase()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={onInfoOpen} title="하네스 정보" style={{
              background: 'transparent', border: '1px solid #4b5563', color: '#94a3b8',
              fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', padding: '1px 6px', borderRadius: 3,
            }}>ⓘ</button>
            <div style={{ fontSize: 9, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'hl-pulse 1.5s infinite', display: 'inline-block' }} />LIVE
            </div>
          </div>
        </div>

        <div style={{
          background: `radial-gradient(ellipse at 30% 20%, ${t.auraFrom}44 0%, #0b1f0b 60%, #051405 100%)`,
          border: '4px solid #0a0a0a', borderRadius: 14, padding: '16px 14px 14px',
          position: 'relative', overflow: 'hidden',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)',
          fontFamily: `'DotGothic16', monospace`, color: '#dcfce7',
        }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)', mixBlendMode: 'multiply' }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
          {screenFx && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: screenFx === 'feed' ? 'radial-gradient(circle, rgba(251,191,36,0.4), transparent 70%)'
                : screenFx === 'train' ? 'radial-gradient(circle, rgba(239,68,68,0.4), transparent 70%)'
                : screenFx === 'play' ? 'radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)'
                : 'radial-gradient(circle, rgba(96,165,250,0.4), transparent 70%)',
              animation: 'hl-flash 0.7s',
            }} />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {editName ? (
                <input autoFocus value={tempName} maxLength={14}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => { onRename(tempName); setEditName(false); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { onRename(tempName); setEditName(false); } }}
                  style={{ background: 'transparent', border: '1px solid #86efac88', color: '#dcfce7', padding: '2px 6px', fontSize: 11, fontFamily: 'inherit', borderRadius: 3, width: 110, outline: 'none' }} />
              ) : (
                <button onClick={() => setEditName(true)} style={{ background: 'transparent', border: 'none', color: '#dcfce7', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  {creature.name}
                </button>
              )}
              <span style={{ fontSize: 10, color: '#86efac' }}>{moodIcon}</span>
            </div>
            <div style={{ fontSize: 10, color: '#86efac' }}>Lv {creature.level} · {EVO_NAMES[stage]}</div>
          </div>

          {creature.purpose && (
            <div style={{
              fontSize: 9, color: '#86efac', opacity: 0.7, fontStyle: 'italic',
              marginTop: 4, lineHeight: 1.4, position: 'relative',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>📌 {creature.purpose}</div>
          )}

          <div style={{ display: 'grid', placeItems: 'center', padding: '20px 0 16px', position: 'relative', minHeight: 140 }}>
            <div style={{
              position: 'absolute', width: 140, height: 140,
              background: `radial-gradient(circle, ${t.auraFrom}55, transparent 70%)`,
              animation: 'hl-pulse 2.4s ease-in-out infinite', borderRadius: '50%',
            }} />
            <div style={{
              fontSize: stage === 0 ? 64 : stage === 1 ? 70 : stage === 2 ? 78 : stage === 3 ? 84 : 92,
              animation: 'hl-bob 2.6s ease-in-out infinite',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))', position: 'relative', transform: 'translateZ(0)',
            }}>{sprite}</div>
            <div style={{ position: 'absolute', bottom: 8, width: 100, height: 8, background: 'radial-gradient(ellipse, rgba(0,0,0,0.5), transparent 70%)', borderRadius: '50%' }} />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 8px', background: 'rgba(134,239,172,0.08)',
            border: '1px solid rgba(134,239,172,0.25)', borderRadius: 4,
            marginBottom: 10, fontSize: 10, color: '#86efac',
          }}>
            <span>오늘 AI 사용</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{todayCount}회</span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#86efac', marginBottom: 3 }}>
              <span>XP</span><span>{creature.xp} / {xpNeed}</span>
            </div>
            <PixelBar value={creature.xp} max={xpNeed} fillColor="#86efac" />
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <Meter icon="🍴" label="포만감" value={creature.meters.fullness}  warn={creature.meters.fullness < 30} />
            <Meter icon="❤️" label="행복도" value={creature.meters.happiness} warn={creature.meters.happiness < 30} />
            <Meter icon="⚡" label="에너지" value={creature.meters.energy}    warn={creature.meters.energy < 20} />
          </div>
        </div>

        <button onClick={onTemplatesOpen} style={{
          ...pixelBtn, width: '100%', marginTop: 12, padding: '12px 14px',
          background: 'linear-gradient(135deg, #f97316, #c2410c)',
          borderColor: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>🎯</span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>프롬프트 라이브러리</span>
          <span style={{ fontSize: 9, color: '#fef3c7', marginLeft: 'auto' }}>{creature.templates.length}개</span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 6 }}>
          <ActionBtn icon="🍴" label="기록" onClick={onFeedOpen} />
          <ActionBtn icon="🏋️" label="훈련" onClick={onTrain} disabled={creature.meters.energy < 20} />
          <ActionBtn icon="🎮" label="놀기" onClick={onPlay} disabled={creature.meters.energy < 10} />
          <ActionBtn icon="💤" label="휴식" onClick={onRest} />
        </div>

        {onPublish && (
          <button onClick={onPublish} style={{
            ...pixelBtn, width: '100%', marginTop: 8, padding: '10px 14px', fontSize: 11,
            background: 'linear-gradient(135deg, #1e40af, #1e3a8a)', borderColor: '#3b82f6',
          }}>
            🌊 우하귀 갤러리에 자랑하기 {creature.uhagwiSlug ? '(업데이트)' : ''}
          </button>
        )}
      </div>

      <div style={{ marginTop: 14, background: 'linear-gradient(180deg, #111827, #0b1221)', border: '2px solid #374151', borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, color: '#cbd5e1', letterSpacing: 1 }}>STATS</div>
        {Object.entries(creature.stats).map(([k, v]) => {
          const meta = STAT_META[k as keyof typeof STAT_META];
          return (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
                <span style={{ color: '#cbd5e1' }}>{meta.icon} {meta.label}</span>
                <span style={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
              </div>
              <PixelBar value={Math.min(v, 100)} max={100} fillColor={t.auraTo} />
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, background: 'linear-gradient(180deg, #111827, #0b1221)', border: '2px solid #374151', borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, color: '#cbd5e1', letterSpacing: 1 }}>JOURNAL · 최근</div>
        {creature.history.length === 0 ? (
          <div style={{ fontSize: 10, color: '#6b7280', textAlign: 'center', padding: 12 }}>
            아직 활동 기록이 없어. 프롬프트 라이브러리에서 시작해봐.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {creature.history.slice(0, 8).map((h, i) => (
              <div key={i} style={{
                fontSize: 10, color: '#cbd5e1',
                padding: '6px 8px', background: '#0b1221',
                borderLeft: `2px solid ${t.auraTo}77`, borderRadius: 2,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{h.label}</span>
                  <span style={{ color: '#4b5563' }}>{relTime(h.t)}</span>
                </div>
                {h.note && <div style={{ marginTop: 3, color: '#94a3b8', fontSize: 10, fontStyle: 'italic' }}>"{h.note}"</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
