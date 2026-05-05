/**
 * 우하귀 벤치마크 표준 작업셋 v0.2 시드.
 *
 * 도메인 7종 × 3~5개 = 약 21~35개 시드. 다음 세션에 60개로 확장.
 * 각 작업: 입력 + 평가 가중 축 + 합격 기준
 */

import type { BenchmarkAxis, BenchmarkDomain } from '@/lib/grades';

export type BenchmarkTask = {
  id: string;
  domain: BenchmarkDomain;
  title: string;
  /** 하네스에 던질 입력 */
  input: string;
  /** 이 작업에서 가중 평가할 축 (5축 중 강조할 것) */
  emphasis_axes: BenchmarkAxis[];
  /** 출력 합격 기준 (평가 모델이 참고) */
  pass_criteria: string;
};

export const BENCHMARK_TASKS: BenchmarkTask[] = [
  // ─── education (3) ──────────────────────────────
  {
    id: 'edu_quiz_01',
    domain: 'education',
    title: '고1 영어 객관식 5문항',
    input:
      '고등학교 1학년 학생용 영어 단어·문법 객관식 5문항을 만들어주세요. 5지선다, 정답 + 간단한 해설 포함. 난이도는 중급(고1 기준).',
    emphasis_axes: ['accuracy', 'completeness', 'domain_fit'],
    pass_criteria:
      '5문항 모두 명확한 정답 1개·오답 4개·해설 포함. 영어 문법·어휘가 정확하고 고1 수준에 적합.',
  },
  {
    id: 'edu_lesson_plan_01',
    domain: 'education',
    title: '50분 수업 차시 교안',
    input:
      '중학교 2학년 사회 — "기후 변화와 우리의 책임" 주제로 50분 수업 교안을 작성해주세요. 도입(5분)·전개(35분)·정리(10분) 시간 배분, 학습 목표 3개, 활동 2가지 포함.',
    emphasis_axes: ['completeness', 'domain_fit', 'time_save'],
    pass_criteria:
      '시간 배분 50분 정확, 학습 목표·활동·평가 모두 포함, 중2 수준 적합한 활동 제안.',
  },
  {
    id: 'edu_feedback_01',
    domain: 'education',
    title: '학생 작문 피드백',
    input:
      '아래는 중학생이 쓴 영어 자기소개 글입니다. 5문장 정도의 따뜻한 피드백을 작성해주세요 — 잘한 점 2개·개선점 2개·격려 1개.\n\n"Hi, my name is Minsu. I am 14 years old. I like soccer and game. I have one brother. He is older than me. I want to be a doctor."',
    emphasis_axes: ['accuracy', 'domain_fit', 'completeness'],
    pass_criteria:
      '구체적 잘한 점 2개·구체적 개선점 2개(문법 또는 표현)·격려 1개. 따뜻한 톤 + 학생 수준 고려.',
  },

  // ─── admin (3) ──────────────────────────────────
  {
    id: 'admin_official_01',
    domain: 'admin',
    title: '협회 공문 — 정기총회 안내',
    input:
      '벤처기업협회 회원사에 발송할 정기총회 안내 공문 작성. 일시: 2026년 6월 15일 14시, 장소: 협회 대강당, 안건: 결산 보고·임원 선출. 한국 행정 공문 격식 준수.',
    emphasis_axes: ['accuracy', 'domain_fit', 'completeness'],
    pass_criteria:
      '문서번호·시행일·수신·제목·본문(인사+안건+요청)·붙임·끝 격식 모두 포함. 한국 행정 공문 톤.',
  },
  {
    id: 'admin_report_01',
    domain: 'admin',
    title: '주간 업무보고서',
    input:
      '이번 주(2026.05.05~05.09) 주요 업무: 회원사 50개 명부 정리·정기총회 준비·예산 점검. 다음 주 계획: 총회 리허설·회의록 정리. 1페이지 분량 주간 보고서로 정리해주세요.',
    emphasis_axes: ['completeness', 'domain_fit', 'time_save'],
    pass_criteria:
      '이번주 실적·다음주 계획·이슈 사항 3섹션 명확. 행정 격식 + 1페이지 적정 분량.',
  },
  {
    id: 'admin_email_01',
    domain: 'admin',
    title: '거절 메일 (정중)',
    input:
      '다른 협회에서 후원 요청 이메일을 받았습니다. 정중하게 거절하는 답장을 작성해주세요 — 사유: 협회 예산 한정. 톤은 기존 관계 유지 가능하도록 따뜻하게.',
    emphasis_axes: ['domain_fit', 'accuracy', 'completeness'],
    pass_criteria:
      '거절 사유 명시 + 향후 관계 가능성 + 격식체 + 따뜻한 톤. 이메일 주제·인사·본문·맺음 격식.',
  },

  // ─── cafe_business (3) ──────────────────────────
  {
    id: 'cafe_daily_01',
    domain: 'cafe_business',
    title: '일일 매출 정산',
    input:
      '카페 일일 매출 데이터:\n- 카드 결제 87건 합계 412,300원\n- 현금 결제 12건 합계 38,500원\n- 환불 1건 -4,500원\n- 직원 식대 1건 -8,000원 (지출)\n\n일일 정산 보고서를 작성해주세요. 입금·지출·실 매출·다음 영업일 시재 항목 포함.',
    emphasis_axes: ['accuracy', 'completeness', 'time_save'],
    pass_criteria:
      '카드+현금-환불 = 실 매출 정확 산출. 지출 분리. 다음 시재 자연스럽게 정리.',
  },
  {
    id: 'cafe_order_01',
    domain: 'cafe_business',
    title: '발주 리스트 작성',
    input:
      '카페 재고 현황:\n- 원두 (다크) 200g 남음 (1주 평균 사용 1kg)\n- 우유 4팩 남음 (1주 평균 12팩)\n- 시럽 (바닐라) 거의 없음\n- 일회용컵 200개 남음 (1주 평균 500개)\n\n다음 주를 위한 발주 리스트를 정리해주세요. 우선순위 표시.',
    emphasis_axes: ['accuracy', 'time_save', 'domain_fit'],
    pass_criteria:
      '소진율 기반 적정 발주량 산출. 긴급도 표시. 발주 누락 없이 4 항목 모두 포함.',
  },
  {
    id: 'cafe_notice_01',
    domain: 'cafe_business',
    title: '카페 휴무 공지',
    input:
      '카페 5월 어버이날(5/8)에 부분 영업 — 오전 영업, 오후 1시 마감. 손님에게 보일 SNS 공지글을 만들어주세요. 따뜻하고 가벼운 톤.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '날짜·시간 정확. 따뜻한 톤. SNS 친화 길이(2~3 문단). 이모지 적절 활용.',
  },

  // ─── research (3) ────────────────────────────────
  {
    id: 'research_summary_01',
    domain: 'research',
    title: '논문 초록 요약',
    input:
      '아래 영어 논문 초록을 한국어로 3문단으로 요약해주세요.\n\n"Absorptive capacity (AC) is defined as the firm\'s ability to recognize the value of new external information, assimilate it, and apply it to commercial ends. This study examines the role of R&D investment in enhancing AC across 230 Korean SMEs from 2015 to 2023. Using a two-stage DEA model, we find that prior knowledge stocks moderate the relationship between R&D intensity and innovation performance. Implications for technology policy are discussed."',
    emphasis_axes: ['accuracy', 'domain_fit', 'completeness'],
    pass_criteria:
      '용어 정확(흡수역량·DEA·SME 등). 3문단 구조(개념·방법·결과·시사점). 학술 한국어 격식.',
  },
  {
    id: 'research_citation_01',
    domain: 'research',
    title: '인용 정리 — APA 7판',
    input:
      '아래 자료를 APA 7판 형식으로 정리해주세요.\n\n저자: Cohen, W. M.; Levinthal, D. A.\n연도: 1990\n제목: Absorptive Capacity: A New Perspective on Learning and Innovation\n저널: Administrative Science Quarterly, Volume 35, Issue 1, pages 128-152',
    emphasis_axes: ['accuracy', 'domain_fit'],
    pass_criteria:
      'APA 7판 형식 정확 (저자·연도·제목·저널·권·페이지 위치·구두점).',
  },
  {
    id: 'research_outline_01',
    domain: 'research',
    title: '발표 슬라이드 개요',
    input:
      '"R&D 투자가 GRDP에 미치는 영향" 주제로 학회 15분 발표 슬라이드 개요를 작성해주세요. 슬라이드 8장 분량 — 표지·연구질문·이론배경·방법·결과·시사점·한계·Q&A.',
    emphasis_axes: ['completeness', 'domain_fit', 'time_save'],
    pass_criteria:
      '8장 분량 정확. 학술 발표 흐름. 각 슬라이드 핵심 메시지 1줄 + bullet 2~3개.',
  },

  // ─── design (2 시드) ─────────────────────────────
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
    title: '로고 브리프',
    input:
      '"우하귀" 로고 디자이너에게 줄 디자인 브리프 1페이지. 핵심 가치·컬러·금기·레퍼런스 분위기·납품 형식 포함.',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria:
      '핵심 가치 3개·컬러·금기·납품 형식·레퍼런스 분위기 모두 포함. 디자이너가 즉시 작업 가능.',
  },

  // ─── engineering (2 시드) ────────────────────────
  {
    id: 'eng_function_01',
    domain: 'engineering',
    title: 'TypeScript 함수 작성',
    input:
      '주어진 배열에서 *연속된 N개 합계의 최댓값* 을 찾는 TypeScript 함수를 작성해주세요. 시간 복잡도 O(n). 타입 + 간단한 테스트 케이스 1개 포함.',
    emphasis_axes: ['accuracy', 'completeness', 'domain_fit'],
    pass_criteria:
      'sliding window 알고리즘 정확. 타입 명확. 테스트 케이스 동작. O(n) 보장.',
  },
  {
    id: 'eng_bug_fix_01',
    domain: 'engineering',
    title: '버그 진단·수정',
    input:
      '아래 React 코드의 무한 렌더링 버그를 진단하고 수정해주세요.\n\n```tsx\nfunction List({items}) {\n  const [filtered, setFiltered] = useState([]);\n  useEffect(() => {\n    setFiltered(items.filter(i => i.active));\n  });\n  return <ul>{filtered.map(i => <li key={i.id}>{i.name}</li>)}</ul>;\n}\n```',
    emphasis_axes: ['accuracy', 'domain_fit'],
    pass_criteria:
      'useEffect 의존성 배열 누락 진단 + [items] 의존성 추가 또는 useMemo로 대체. 원인 설명 명확.',
  },

  // ─── general (3 시드) ────────────────────────────
  {
    id: 'general_summary_01',
    domain: 'general',
    title: '회의 요약',
    input:
      '아래 회의록을 3 액션 아이템으로 정리해주세요.\n\n"5/3 마케팅 회의. 김팀장: 5월 캠페인 반응 약함. 이대리: 인스타 전환율 0.8% — 평균 이하. 박과장: 다음 주까지 새 카피 A/B 테스트 시작 가능. 김팀장: 예산 추가 50만원 검토 필요. 이대리: 광고 소재 3종 제작 예정."',
    emphasis_axes: ['accuracy', 'completeness'],
    pass_criteria:
      '액션 아이템 3개 정확 추출 — 담당자 + 마감 + 내용. 모호 표현 X.',
  },
  {
    id: 'general_email_01',
    domain: 'general',
    title: '협업 제안 메일',
    input:
      '같은 분야 다른 회사에 *디자인 콜라보 제안* 메일 초안을 작성해주세요. 격식체. 핵심: 양사 강점·콜라보 아이디어·일정 제안·답장 요청.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '격식 인사·소개·제안·요청·맺음 5단 구조. 4 핵심 모두 포함. 자연스러운 한국어.',
  },
  {
    id: 'general_translate_01',
    domain: 'general',
    title: '한→영 번역',
    input:
      '다음 문장을 자연스러운 영어로 번역해주세요. (LinkedIn 게시글 톤)\n\n"AI 자동화의 진짜 가치는 시간 절약이 아니라, 사람이 정말 잘하는 일에 집중할 수 있게 해주는 것입니다."',
    emphasis_axes: ['accuracy', 'domain_fit'],
    pass_criteria:
      '문법 정확. LinkedIn 톤(전문적·간결). 의미 보존. 한국어 직역 X 자연 영어.',
  },
];

export function getTasksByDomain(domain: BenchmarkDomain): BenchmarkTask[] {
  return BENCHMARK_TASKS.filter((t) => t.domain === domain);
}

export function getTaskById(id: string): BenchmarkTask | undefined {
  return BENCHMARK_TASKS.find((t) => t.id === id);
}

export const BENCHMARK_TASK_TOTAL = BENCHMARK_TASKS.length;
