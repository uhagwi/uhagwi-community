/**
 * Tailwind 설정 — 공유 프리셋(@uhagwi/config/tailwind/preset.js) 확장
 * 근거: docs/service-dev/02_design/ui.md §3 디자인 시스템 토큰
 */
import type { Config } from 'tailwindcss';
import preset from '@uhagwi/config/tailwind/preset.js';

const config: Config = {
  presets: [preset as Config],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    // 공유 UI 패키지도 Tailwind 클래스 스캔
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // app 전용 확장이 생기면 여기에. 지금은 preset 단독 사용.
    },
  },
  plugins: [],
};

export default config;
