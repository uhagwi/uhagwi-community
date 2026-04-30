'use client';
// Harness Lab — 메인 컨테이너 (state·뷰 라우팅, 액션은 useCreatureActions 위임)
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Creature } from './types';
import { applyDecay, clamp, newCreature, nowTs } from './logic';
import { loadAll, saveActive, saveCreatures } from './storage';
import { publishToUhagwi } from './bridge';
import { cssBlock } from './styles';
import { useCreatureActions } from './useCreatureActions';
import { NavBtn, EmptyState } from './components/atoms';
import { CreateView } from './components/Create';
import { CollectionView } from './components/Collection';
import { DeviceView } from './components/Device';
import { InsightsView } from './components/Insights';
import { FeedModal, TemplatesModal, InfoModal, EvolutionModal } from './components/Modals';

type View = 'main' | 'insights' | 'collection' | 'create';
type ModalKind =
  | { kind: 'feed' }
  | { kind: 'templates' }
  | { kind: 'info' }
  | { kind: 'evo'; payload: { id: string; stage: number } }
  | null;

export default function HarnessLab() {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('main');
  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState<{ msg: string; tone: 'info' | 'success' | 'warn' } | null>(null);
  const [screenFx, setScreenFx] = useState<string | null>(null);
  const initialMount = useRef(true);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('hl-fonts')) return;
    const link = document.createElement('link');
    link.id = 'hl-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DotGothic16&family=Silkscreen:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    (async () => {
      const { creatures: list, activeId: aid } = await loadAll();
      const decayed = list.map(applyDecay);
      setCreatures(decayed);
      setActiveId(aid && decayed.find((c) => c.id === aid) ? aid : (decayed[0]?.id || null));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (initialMount.current) { initialMount.current = false; return; }
    saveCreatures(creatures);
  }, [creatures]);
  useEffect(() => { if (!loading) saveActive(activeId); }, [activeId, loading]);

  useEffect(() => {
    const id = setInterval(() => {
      setCreatures((prev) => prev.map((c) => ({
        ...c,
        meters: {
          fullness:  clamp(c.meters.fullness  - 0.07),
          happiness: clamp(c.meters.happiness - 0.05),
          energy:    clamp(c.meters.energy    + 0.04),
        },
      })));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const active = creatures.find((c) => c.id === activeId) || null;
  const updateOne = useCallback(
    (id: string, fn: (c: Creature) => Creature) =>
      setCreatures((prev) => prev.map((c) => (c.id === id ? fn(c) : c))),
    []
  );
  const flash = (kind: string) => { setScreenFx(kind); setTimeout(() => setScreenFx(null), 700); };
  const fireToast = useCallback((msg: string, tone: 'info' | 'success' | 'warn' = 'info') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2200);
  }, []);
  const openEvoModal = useCallback((id: string, stage: number) => {
    setModal({ kind: 'evo', payload: { id, stage } });
  }, []);

  const actions = useCreatureActions({ active, updateOne, flash, fireToast, openEvoModal });

  const doDelete = (id: string) => {
    setCreatures((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remain = creatures.filter((c) => c.id !== id);
      setActiveId(remain[0]?.id || null);
    }
  };

  const doPublish = async () => {
    if (!active) return;
    fireToast('우하귀 갤러리에 송신 중…');
    const r = await publishToUhagwi(active);
    if ('slug' in r) {
      updateOne(active.id, (c) => ({ ...c, uhagwiSlug: r.slug }));
      fireToast('🌊 갤러리에 자랑됨!', 'success');
    } else {
      fireToast(`게시 실패: ${r.error}`, 'warn');
    }
  };

  if (loading) {
    return (
      <div className="hl-root" style={{
        minHeight: '100vh', background: 'radial-gradient(ellipse at top, #1f2937 0%, #030712 100%)',
        color: '#86efac', display: 'grid', placeItems: 'center',
        fontFamily: `'DotGothic16', monospace`, letterSpacing: 1,
      }}>
        <div style={{ animation: 'hl-blink 1s infinite' }}>BOOTING…</div>
        <style>{cssBlock}</style>
      </div>
    );
  }

  return (
    <div className="hl-root" style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% -20%, #1f2937 0%, #030712 65%)',
      fontFamily: `'DotGothic16', 'Silkscreen', 'JetBrains Mono', monospace`,
      color: '#e5e7eb', padding: '14px 14px 32px', letterSpacing: 0.4,
    }}>
      <style>{cssBlock}</style>

      <header style={{ maxWidth: 460, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'linear-gradient(135deg, #fde68a, #f97316)',
            boxShadow: '0 0 18px rgba(249,115,22,0.5)',
            display: 'grid', placeItems: 'center', fontSize: 16,
          }}>🧬</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>HARNESS LAB</div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>우하귀 × AI 사용 트래커</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <NavBtn active={view === 'main'}        onClick={() => setView('main')}>홈</NavBtn>
          <NavBtn active={view === 'insights'}    onClick={() => setView('insights')}>인사이트</NavBtn>
          <NavBtn active={view === 'collection'}  onClick={() => setView('collection')}>컬렉션</NavBtn>
          <NavBtn active={view === 'create'}      onClick={() => setView('create')}>+</NavBtn>
        </div>
      </header>

      <main style={{ maxWidth: 460, margin: '0 auto' }}>
        {view === 'create' && (
          <CreateView onCreate={(opts) => {
            const c = newCreature(opts);
            setCreatures((prev) => [...prev, c]);
            setActiveId(c.id);
            setView('main');
            setTimeout(() => fireToast(
              opts.isExisting ? `${c.name} 등록 완료! 🔗` : `${c.name} 부화! 🎉`,
              'success'
            ), 100);
          }} onCancel={() => setView('main')} hasCreatures={creatures.length > 0} />
        )}

        {view === 'collection' && (
          <CollectionView
            creatures={creatures} activeId={activeId}
            onSelect={(id) => { setActiveId(id); setView('main'); }}
            onDelete={doDelete} onNew={() => setView('create')}
          />
        )}

        {view === 'insights' && (active ? <InsightsView creature={active} /> : <EmptyState onCreate={() => setView('create')} />)}

        {view === 'main' && !active && <EmptyState onCreate={() => setView('create')} />}

        {view === 'main' && active && (
          <DeviceView
            creature={active} screenFx={screenFx}
            onFeedOpen={() => setModal({ kind: 'feed' })}
            onTemplatesOpen={() => setModal({ kind: 'templates' })}
            onInfoOpen={() => setModal({ kind: 'info' })}
            onTrain={actions.doTrain} onPlay={actions.doPlay} onRest={actions.doRest}
            onRename={actions.doRename}
            onPublish={doPublish}
          />
        )}
      </main>

      {modal?.kind === 'feed' && (
        <FeedModal
          onClose={() => setModal(null)}
          onSubmit={(foodKey, note) => { actions.doFeed(foodKey, note); setModal(null); }}
          recentNotes={(active?.history || []).filter((h) => h.kind === 'feed' && h.note).slice(0, 3).map((h) => h.note as string)}
        />
      )}

      {modal?.kind === 'templates' && active && (
        <TemplatesModal
          creature={active}
          onClose={() => setModal(null)}
          onUse={async (t) => { await actions.useTemplate(t); setModal(null); }}
          onAdd={actions.addTemplate}
          onRemove={actions.removeTemplate}
        />
      )}

      {modal?.kind === 'info' && active && (
        <InfoModal
          creature={active}
          onClose={() => setModal(null)}
          onSave={(updates) => {
            updateOne(active.id, (c) => ({ ...c, ...updates }));
            fireToast('저장됨', 'success');
          }}
        />
      )}

      {modal?.kind === 'evo' && (
        <EvolutionModal
          creature={creatures.find((c) => c.id === modal.payload.id) || null}
          stage={modal.payload.stage}
          onClose={() => setModal(null)}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)',
          background: toast.tone === 'warn' ? '#7c2d12' : toast.tone === 'success' ? '#166534' : '#1f2937',
          border: `2px solid ${toast.tone === 'warn' ? '#fb923c' : toast.tone === 'success' ? '#4ade80' : '#4b5563'}`,
          color: '#fff', padding: '10px 16px', borderRadius: 4, fontSize: 12,
          zIndex: 50, boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          animation: 'hl-toastIn 0.25s', maxWidth: 'calc(100vw - 32px)',
        }}>{toast.msg}</div>
      )}
    </div>
  );
}
