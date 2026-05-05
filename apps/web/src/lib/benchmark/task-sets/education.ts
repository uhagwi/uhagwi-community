/**
 * education 도메인 — 10개 작업.
 * 교사·학원·과외·학습지 등 교육 영역.
 */

import type { BenchmarkTask } from './types';

export const EDUCATION_TASKS: BenchmarkTask[] = [
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
    pass_criteria: '시간 배분 50분 정확, 학습 목표·활동·평가 모두 포함, 중2 수준 적합.',
  },
  {
    id: 'edu_feedback_01',
    domain: 'education',
    title: '학생 작문 피드백',
    input:
      '아래는 중학생이 쓴 영어 자기소개 글입니다. 5문장 정도의 따뜻한 피드백을 작성해주세요 — 잘한 점 2개·개선점 2개·격려 1개.\n\n"Hi, my name is Minsu. I am 14 years old. I like soccer and game. I have one brother. He is older than me. I want to be a doctor."',
    emphasis_axes: ['accuracy', 'domain_fit', 'completeness'],
    pass_criteria: '구체적 잘한 점 2개·구체적 개선점 2개(문법 또는 표현)·격려 1개. 따뜻한 톤.',
  },
  {
    id: 'edu_rubric_01',
    domain: 'education',
    title: '수행평가 채점 루브릭',
    input:
      '고1 국어 — "내가 좋아하는 책 1권 소개" 수행평가 채점 루브릭을 5단계(매우 우수·우수·보통·미흡·매우 미흡)로 만들어주세요. 평가 항목 3개(내용·표현·구성)별로 5단계 기술.',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria: '3 항목 × 5 단계 = 15셀 모두 구체적 기술. 단계 간 차이 명확.',
  },
  {
    id: 'edu_parent_email_01',
    domain: 'education',
    title: '학부모 면담 안내 메일',
    input:
      '담임교사로서 학부모께 1학기 정기 면담 안내 메일을 작성해주세요. 일정: 5월 셋째 주, 학생 1인당 20분 배정, 학교 또는 화상 선택 가능. 격식 + 따뜻한 톤.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria: '인사·면담 목적·일정 안내·신청 방법·문의 5단 구조. 격식 + 따뜻함.',
  },
  {
    id: 'edu_curriculum_01',
    domain: 'education',
    title: '한 학기 16주 진도 계획',
    input:
      '중2 영어 한 학기(16주) 진도 계획을 표로 작성해주세요. 주별 단원·핵심 학습 목표·주요 활동 포함. 5월 첫째 주가 1주차.',
    emphasis_axes: ['completeness', 'domain_fit', 'time_save'],
    pass_criteria: '16주 모두 채움. 단원 흐름 자연. 학습 목표·활동 구체.',
  },
  {
    id: 'edu_worksheet_01',
    domain: 'education',
    title: '학습지 1장',
    input:
      '초6 수학 — "분수의 나눗셈" 학습지 1장(A4)을 만들어주세요. 개념 정리 1단·예제 2개·연습문제 5개·도전문제 1개 구성.',
    emphasis_axes: ['accuracy', 'completeness', 'domain_fit'],
    pass_criteria:
      '개념·예제 풀이·연습 5문항 모두 정답 검증 가능. 초6 난이도 적합. 도전문제 한 단계 상위.',
  },
  {
    id: 'edu_class_rules_01',
    domain: 'education',
    title: '학급 규칙 5조항',
    input:
      '중학교 1학년 첫 주 학급 규칙을 5조항 만들어주세요. 학생 자율성 존중 + 명확함 + 처벌보다 약속 톤.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria: '5조항 명확. 처벌 X 약속 톤. 학생 동의 가능 수준 + 실행 가능.',
  },
  {
    id: 'edu_supply_list_01',
    domain: 'education',
    title: '신학기 준비물 안내',
    input:
      '초3 신학기 준비물 안내문을 학부모에게 보낼 형태로 작성해주세요. 필수 준비물 8개·권장 준비물 3개·구입 시 주의사항 1개. 인사·끝맺음 포함.',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria: '필수 8 + 권장 3 + 주의사항 1 모두 포함. 학부모 친화 톤. 인사·끝맺음 격식.',
  },
  {
    id: 'edu_recommendation_01',
    domain: 'education',
    title: '생활기록부 종합의견',
    input:
      '중3 학생의 생활기록부 종합의견을 200자 내외로 작성해주세요. 학생 특징: 수학·과학 우수, 발표 적극, 협업 긍정적, 글쓰기 보완 필요.\n\n공식 격식 + 학생 강점 강조 + 보완 영역 부드럽게.',
    emphasis_axes: ['accuracy', 'domain_fit', 'completeness'],
    pass_criteria:
      '200자 내외 (180~220). 강점 구체 + 보완 부드럽게 + 공식 격식 (생활기록부 양식).',
  },
];
