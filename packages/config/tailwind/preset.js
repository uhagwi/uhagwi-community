/**
 * 우하귀 디자인 토큰 — Tailwind 프리셋
 * 근거: docs/service-dev/02_design/ui.md §디자인 시스템
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // primary: 딥퍼플 (브랜드 메인)
        brand: {
          50: '#f4f1fa',
          100: '#e8e1f5',
          200: '#d1c3ea',
          300: '#b7a2de',
          400: '#9880cf',
          500: '#7a5fbf',
          600: '#5d44a0',
          700: '#4a357e',
          800: '#38275d',
          900: '#26193c',
        },
        // accent: 파스텔 민트
        mint: {
          400: '#7de0c5',
          500: '#55ccad',
        },
        // 주접 핫핑크 (리액션 포인트)
        juzzep: {
          400: '#ff6fa3',
          500: '#ff3d85',
        },
        // 크림 배경
        cream: {
          50: '#fffdf7',
          100: '#fdf8e8',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
        display: ['"Cafe24Oneprettynight"', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'D2Coding', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(58, 39, 93, 0.08)',
        float: '0 8px 24px rgba(58, 39, 93, 0.12)',
      },
      spacing: {
        // 4·8·12·16·24·32·48·64 기반은 기본값 + 커스텀
        18: '4.5rem',
      },
    },
  },
  plugins: [],
};
