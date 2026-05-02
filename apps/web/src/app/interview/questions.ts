/**
 * 우하귀 인터뷰 v0.1 — 빈 종이 인터뷰 30문항.
 * 출처: Phase A 자가검증 자산 (JIN/06. Personal AI OS/projects/우하귀-사업화/phase-a/04_inferred-interview-template.md)
 *
 * Stage 1 진단의 1차 입력 — 사용자 코퍼스가 없는 신규 사용자용.
 * 응답 → 페르소나 진단 (다음 세션에서 LLM 호출 추가 예정).
 */

export type InterviewSection = {
  id: string;
  title: string;
  questions: { id: string; text: string; placeholder?: string }[];
};

export const INTERVIEW_SECTIONS: InterviewSection[] = [
  {
    id: 's1-identity',
    title: '섹션 1. 정체성',
    questions: [
      {
        id: 'q1',
        text: '본인을 5초 안에 소개한다면? (직업·역할·취미·성향 키워드 3~5개)',
        placeholder: '예: 박사과정생 · 협회 운영 · 자동화 시스템 설계자',
      },
      {
        id: 'q2',
        text: '본인을 24시간 따라다닌다면 가장 자주 보일 행동 3가지는?',
      },
      {
        id: 'q3',
        text: '본인이 자신 있게 잘하는 것 / 남보다 빠른 것 3가지는?',
      },
      {
        id: 'q4',
        text: '본인이 가장 약한 / 회피하고 싶은 일 3가지는?',
      },
      {
        id: 'q5',
        text: '5년 후 본인의 명함에 어떤 직책 한 줄을 새기고 싶나요?',
      },
    ],
  },
  {
    id: 's2-domain',
    title: '섹션 2. 도메인 + 일과',
    questions: [
      {
        id: 'q6',
        text: '본인이 동시에 발 담그고 있는 도메인 3~5개를 나열하라',
        placeholder: '예: 박사연구·협회운영·카페·창업·강연',
      },
      { id: 'q7', text: '각 도메인에서 매주 반복되는 핵심 작업 3개씩 나열하라' },
      {
        id: 'q8',
        text: '"이건 사람이 하면 안 되는 일이다" 라고 느낀 작업이 있나요? 어느 도메인의 어느 작업?',
      },
      {
        id: 'q9',
        text: '어느 시간대에 가장 집중력이 좋은가요? 어느 작업을 그 시간에 배정하나요?',
      },
      {
        id: 'q10',
        text: '일주일 중 가장 망하는 시간대 / 작업이 있나요? 왜 망하나요?',
      },
      {
        id: 'q11',
        text: '"이 작업만 자동화되면 인생이 편해진다" 는 작업 톱3는?',
      },
      { id: 'q12', text: '반대로 "절대 자동화하면 안 된다" 는 작업이 있다면?' },
    ],
  },
  {
    id: 's3-tools',
    title: '섹션 3. 도구 + 워크플로우',
    questions: [
      {
        id: 'q13',
        text: '본인이 매일 쓰는 도구 5개는?',
        placeholder: '예: Claude Code · 옵시디언 · 구글 시트 · 카톡 · 노션',
      },
      {
        id: 'q14',
        text: '그 도구들 중 "내가 만든 패턴" 이 박혀 있는 도구는? 어떤 패턴인가?',
      },
      {
        id: 'q15',
        text: '이미 만들어 운영 중인 자동화·하네스·스크립트가 있나요? 가장 자랑스러운 거 1개와 그 이유는?',
      },
      {
        id: 'q16',
        text: '같은 작업을 두 번 했을 때 자동화 시도 임계점은? (3회 / 5회 / 그 이상)',
      },
      {
        id: 'q17',
        text: '협업 시 본인이 항상 떠맡는 역할은? (총무 / 기획 / 디자인 / 코드 / 발표 / 회계)',
      },
      {
        id: 'q18',
        text: '어떤 형태의 산출물을 가장 자주 만들어내나요?',
        placeholder: '보고서·코드·슬라이드·메일·다이어그램·데이터·영상',
      },
    ],
  },
  {
    id: 's4-pain',
    title: '섹션 4. 고통 + 욕망',
    questions: [
      { id: 'q19', text: '지난 30일간 가장 짜증났던 작업 3개는? (구체적으로)' },
      {
        id: 'q20',
        text: '그 짜증이 본질적으로 어디서 왔나요?',
        placeholder: '단순 반복 / 정보 흩어짐 / 사람 마찰 / 시간 부족 / 도구 한계',
      },
      { id: 'q21', text: '매번 "기억해야지" 하지만 까먹는 일이 있나요? 무엇인가요?' },
      {
        id: 'q22',
        text: '본인이 가장 빨리 인정받고 싶은 영역은?',
        placeholder: '학계 / 사업 / 기술 / 정책 / 글쓰기 / 발표',
      },
      {
        id: 'q23',
        text: '만약 한 달간 본인 분신(똑같이 일하는 AI)이 있다면 어떤 일을 시키고 싶나요? 톱5 우선순위로',
      },
      {
        id: 'q24',
        text: '그 분신이 절대 못 했으면 하는 일은?',
        placeholder: '대인관계 / 윤리 판단 / 창의적 결정 / 가족·연애 등',
      },
    ],
  },
  {
    id: 's5-evolution',
    title: '섹션 5. 학습 + 정체성 진화',
    questions: [
      { id: 'q25', text: '최근 1년간 가장 크게 학습한 새 분야 3개는?' },
      { id: 'q26', text: '본인이 가르치고 싶은 / 강연하고 싶은 주제 톱3는?' },
      { id: 'q27', text: '본인이 박사논문·연구에서 답하고 싶은 한 줄 질문은?' },
      {
        id: 'q28',
        text: '본인의 자동화 철학을 한 줄로 표현하면?',
        placeholder: '예: "사람은 결정만, 실행은 AI가"',
      },
      {
        id: 'q29',
        text: '본인의 자동화 시스템을 다른 사람이 본다면 어떤 단어로 평가받고 싶나요? 3개',
      },
      {
        id: 'q30',
        text: '만약 우하귀가 1년 후 한 줄로 평가받는다면 어떤 평가가 가장 자랑스럽겠나요?',
      },
    ],
  },
];

export const TOTAL_QUESTIONS = INTERVIEW_SECTIONS.reduce(
  (sum, s) => sum + s.questions.length,
  0,
);

export type FlatQuestion = {
  id: string;
  text: string;
  placeholder?: string;
  sectionTitle: string;
  index: number;
  total: number;
};

export const FLAT_QUESTIONS: FlatQuestion[] = (() => {
  const flat: FlatQuestion[] = [];
  let index = 0;
  for (const section of INTERVIEW_SECTIONS) {
    for (const q of section.questions) {
      index += 1;
      flat.push({
        id: q.id,
        text: q.text,
        placeholder: q.placeholder,
        sectionTitle: section.title,
        index,
        total: TOTAL_QUESTIONS,
      });
    }
  }
  return flat;
})();
