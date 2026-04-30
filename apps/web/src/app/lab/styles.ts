// Harness Lab — 인라인 픽셀 스타일·CSS 키프레임 (외부 의존성 없이 단일 라우트 격리)
import type { CSSProperties } from 'react';

export const pixelBtn: CSSProperties = {
  border: '2px solid #4b5563',
  background: '#1f2937',
  color: '#e5e7eb',
  fontFamily: `'DotGothic16', 'Silkscreen', monospace`,
  fontSize: 12,
  cursor: 'pointer',
  borderRadius: 4,
  letterSpacing: 0.5,
  transition: 'transform 0.08s, filter 0.15s',
  outline: 'none',
};

export const inputStyle: CSSProperties = {
  width: '100%', background: '#0b1221', border: '2px solid #374151', color: '#e5e7eb',
  padding: '8px 10px', fontSize: 12, marginTop: 4, marginBottom: 12, borderRadius: 4,
  fontFamily: 'inherit', outline: 'none',
};

export const cssBlock = `
  @keyframes hl-bob       { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }
  @keyframes hl-pulse     { 0%,100%{transform:scale(1);opacity:.55}50%{transform:scale(1.1);opacity:.85} }
  @keyframes hl-blink     { 0%,100%{opacity:1}50%{opacity:.3} }
  @keyframes hl-flash     { 0%{opacity:0}20%{opacity:1}100%{opacity:0} }
  @keyframes hl-fadeIn    { from{opacity:0}to{opacity:1} }
  @keyframes hl-modalIn   { from{transform:translateY(20px) scale(.96);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
  @keyframes hl-toastIn   { from{transform:translate(-50%,20px);opacity:0} to{transform:translate(-50%,0);opacity:1} }
  @keyframes hl-evoSpin   { 0%{transform:rotate(0) scale(1)}25%{transform:rotate(180deg) scale(1.2);filter:brightness(1.5)}50%{transform:rotate(360deg) scale(.8);filter:brightness(2)}75%{transform:rotate(540deg) scale(1.3);filter:brightness(1.5)}100%{transform:rotate(720deg) scale(1);filter:brightness(1)} }
  @keyframes hl-evoGlow   { 0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.4);opacity:.95} }
  .hl-root button:active:not(:disabled){transform:translateY(1px)}
  .hl-root button:hover:not(:disabled){filter:brightness(1.15)}
  .hl-root input:focus,.hl-root textarea:focus{border-color:#f59e0b !important}
`;
