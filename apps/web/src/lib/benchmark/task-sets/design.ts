/**
 * design 도메인 — 7개 작업.
 * 디자이너·브랜딩·UI/UX 영역.
 */

import type { BenchmarkTask } from './types';

export const DESIGN_TASKS: BenchmarkTask[] = [
  {
    id: 'design_color_01',
    domain: 'design',
    title: '브랜드 컬러 팔레트',
    input:
      '"우하귀" 브랜드 — 따뜻하고 친근한 AI 도반 정체성. 메인 컬러 1개 + 보조 2개 + 강조 1개 = 4 컬러 팔레트 제안. HEX 코드 + 사용 맥락 + 의도.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '4 HEX 모두 유효 + 컬러 조화 + 브랜드 정체성 정렬 + 사용 가이드.',
  },
  {
    id: 'design_logo_brief_01',
    domain: 'design',
    title: '로고 디자인 브리프',
    input:
      '"우하귀" 로고 디자이너에게 줄 디자인 브리프 1페이지. 핵심 가치·컬러·금기·레퍼런스 분위기·납품 형식 포함.',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria:
      '핵심 가치 3개·컬러·금기·납품 형식·레퍼런스 모두 포함. 디자이너 즉시 작업 가능.',
  },
  {
    id: 'design_typography_01',
    domain: 'design',
    title: '본문·헤드라인 폰트 페어링',
    input:
      'B2B SaaS 랜딩페이지용 폰트 페어링 제안. 헤드라인 1종 + 본문 1종. 한국어 + 영어 모두 지원. 무료 라이선스 우선. 사용처별 권장 크기 포함.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '실제 무료·상업 가능 폰트 (예: Pretendard·Inter). 한·영 모두 커버. 헤드라인 vs 본문 대비 명확.',
  },
  {
    id: 'design_moodboard_brief_01',
    domain: 'design',
    title: '무드보드 브리프',
    input:
      '"건강한 도시락 배달 서비스" 브랜드 무드보드 브리프. 분위기 키워드 5개·컬러 톤 3개·시각 레퍼런스 키워드 10개·금기 키워드 3개.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '5 분위기 키워드 (예: 신선·자연·현대) + 3 컬러 + 10 시각 레퍼런스 + 3 금기 모두 구체.',
  },
  {
    id: 'design_cta_button_01',
    domain: 'design',
    title: 'CTA 버튼 카피 5개',
    input:
      'AI 자동화 SaaS 랜딩 — 회원가입 유도 CTA 버튼 카피 5개 제안. 각 카피에 사용 맥락·시각 가이드 1줄.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '5 카피 모두 행동 유도 동사. 5~15자. 시각 가이드(색·크기·아이콘) 포함.',
  },
  {
    id: 'design_naming_01',
    domain: 'design',
    title: '브랜드 네이밍 후보',
    input:
      '신규 AI 학습 보조 앱 — 한국어·영어 모두 자연스러운 브랜드명 5개 제안. 각 이름에 의미·발음·도메인 가용성(예상) 1줄.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '5 이름 모두 한·영 발음 자연. 의미 있음. 짧음(2~3음절). 도메인 검색 가능성 언급.',
  },
  {
    id: 'design_landing_section_01',
    domain: 'design',
    title: '랜딩 섹션 와이어프레임',
    input:
      'B2B SaaS 랜딩 페이지 와이어프레임을 텍스트로 작성. Hero·Feature·Social Proof·CTA 4 섹션. 각 섹션 — 레이아웃·핵심 카피·시각 요소 명시.',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria:
      '4 섹션 모두 레이아웃 + 카피 + 시각 요소. 디자이너가 즉시 그릴 수 있는 수준.',
  },
];
