/**
 * research 도메인 — 8개 작업.
 * 학술·연구·논문·정책 분석 영역.
 */

import type { BenchmarkTask } from './types';

export const RESEARCH_TASKS: BenchmarkTask[] = [
  {
    id: 'research_summary_01',
    domain: 'research',
    title: '논문 초록 요약',
    input:
      '아래 영어 논문 초록을 한국어로 3문단으로 요약해주세요.\n\n"Absorptive capacity (AC) is defined as the firm\'s ability to recognize the value of new external information, assimilate it, and apply it to commercial ends. This study examines the role of R&D investment in enhancing AC across 230 Korean SMEs from 2015 to 2023. Using a two-stage DEA model, we find that prior knowledge stocks moderate the relationship between R&D intensity and innovation performance. Implications for technology policy are discussed."',
    emphasis_axes: ['accuracy', 'domain_fit', 'completeness'],
    pass_criteria:
      '용어 정확(흡수역량·DEA·SME). 3문단 구조(개념·방법·결과·시사점). 학술 한국어.',
  },
  {
    id: 'research_citation_01',
    domain: 'research',
    title: '인용 정리 — APA 7판',
    input:
      '아래 자료를 APA 7판 형식으로 정리해주세요.\n\n저자: Cohen, W. M.; Levinthal, D. A.\n연도: 1990\n제목: Absorptive Capacity: A New Perspective on Learning and Innovation\n저널: Administrative Science Quarterly, Volume 35, Issue 1, pages 128-152',
    emphasis_axes: ['accuracy', 'domain_fit'],
    pass_criteria: 'APA 7판 형식 정확 (저자·연도·제목·저널·권·페이지·구두점).',
  },
  {
    id: 'research_outline_01',
    domain: 'research',
    title: '발표 슬라이드 개요',
    input:
      '"R&D 투자가 GRDP에 미치는 영향" 주제로 학회 15분 발표 슬라이드 개요를 작성해주세요. 슬라이드 8장 분량 — 표지·연구질문·이론배경·방법·결과·시사점·한계·Q&A.',
    emphasis_axes: ['completeness', 'domain_fit', 'time_save'],
    pass_criteria: '8장 정확. 학술 발표 흐름. 슬라이드별 핵심 1줄 + bullet 2~3개.',
  },
  {
    id: 'research_question_01',
    domain: 'research',
    title: '연구 질문 도출',
    input:
      '"한국 중소기업의 디지털 전환 성과 차이"를 주제로 연구 질문 3개를 도출해주세요. 각 질문에 측정 가능한 변수·예상 가설·이론적 배경 1줄씩.',
    emphasis_axes: ['domain_fit', 'completeness', 'accuracy'],
    pass_criteria:
      '3 질문 모두 검증 가능. 변수·가설·이론 명확. 학술 표현.',
  },
  {
    id: 'research_lit_review_01',
    domain: 'research',
    title: '문헌 5편 비교표',
    input:
      '"흡수역량(Absorptive Capacity)" 핵심 문헌 5편을 비교표로 정리해주세요. 컬럼: 저자·연도·핵심 주장·방법·기여·한계.\n\n(가상의 논문이라도 분야 표준 흐름에 맞게 채워주세요)',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria: '5 편 × 6 컬럼. Cohen&Levinthal 1990 같은 standard 논문 포함. 학술 표현.',
  },
  {
    id: 'research_method_01',
    domain: 'research',
    title: '연구 방법 1단락',
    input:
      '연구: "전북 R&D 투자와 GRDP 전환율 분석". 정성·정량 혼합 연구 방법 1단락 작성. 데이터 출처·분석 도구·기간 명시.',
    emphasis_axes: ['domain_fit', 'completeness', 'accuracy'],
    pass_criteria: '정성·정량 모두 명시. NTIS·통계청 같은 출처. 분석 기법 명확. 250자 내외.',
  },
  {
    id: 'research_intro_01',
    domain: 'research',
    title: '논문 서론 첫 단락',
    input:
      '"AI 자동화가 한국 사무직 일자리에 미치는 영향" 논문 서론 첫 단락을 작성해주세요. 사회적 배경·문제 제기·연구 필요성 흐름. 200~300자.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '배경→문제→필요성 흐름. 학술 격식. 200~300자. 인용 자리 표시(예: "(OECD, 2024)").',
  },
  {
    id: 'research_data_table_01',
    domain: 'research',
    title: '통계 결과 표 + 해석',
    input:
      '회귀분석 결과 — 변수 X1 계수 0.42 (p<0.01), X2 계수 -0.15 (p=0.08), X3 계수 0.28 (p<0.05). R² = 0.61, N = 230. Markdown 표 + 한 줄 해석.',
    emphasis_axes: ['accuracy', 'domain_fit'],
    pass_criteria:
      '표 정확. 유의수준(*p<0.01, **p<0.05) 표기. 해석 1줄 (X1 강한 양·X3 양·X2 미유의).',
  },
];
