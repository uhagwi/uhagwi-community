/**
 * general 도메인 — 8개 작업.
 * 도메인 무관 일반 사용자 작업.
 */

import type { BenchmarkTask } from './types';

export const GENERAL_TASKS: BenchmarkTask[] = [
  {
    id: 'general_summary_01',
    domain: 'general',
    title: '회의 요약 — 액션 아이템',
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
    title: '한→영 번역 (LinkedIn)',
    input:
      '다음 문장을 자연스러운 영어로 번역해주세요. (LinkedIn 게시글 톤)\n\n"AI 자동화의 진짜 가치는 시간 절약이 아니라, 사람이 정말 잘하는 일에 집중할 수 있게 해주는 것입니다."',
    emphasis_axes: ['accuracy', 'domain_fit'],
    pass_criteria:
      '문법 정확. LinkedIn 톤(전문적·간결). 의미 보존. 한국어 직역 X 자연 영어.',
  },
  {
    id: 'general_intro_01',
    domain: 'general',
    title: 'LinkedIn 자기소개 200자',
    input:
      'LinkedIn 프로필 About 섹션 200자 내외 한국어 자기소개. 직업: 융합기술경영 박사과정생, 동시에 AI 자동화 SaaS 창업 중. 어조: 전문적 + 약간의 인간미.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '180~220자. 직업 명확 + 차별화 + 가치 제안 + 인간미. LinkedIn 톤.',
  },
  {
    id: 'general_pitch_01',
    domain: 'general',
    title: '30초 엘리베이터 피치',
    input:
      '"AI가 사용자 일을 진단하고 자동화해주는 SaaS — 우하귀(Uhagwi)" 30초 엘리베이터 피치를 작성해주세요. 문제·해결·차별화·임팩트 4단 구조. 한국어.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria: '30초 분량(약 100자). 문제→해결→차별화→임팩트 4단. 청자 즉시 이해.',
  },
  {
    id: 'general_sms_01',
    domain: 'general',
    title: '일정 변경 알림 문자 3 버전',
    input:
      '내일 오후 2시 미팅을 4시로 변경. 같은 내용을 격식 / 중간 / 친근 톤 3버전 문자로 작성. 각 80자 이내.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '3버전 모두 80자 이내. 톤 차이 명확. 새 시간·사과·확인 요청 모두 포함.',
  },
  {
    id: 'general_apology_01',
    domain: 'general',
    title: '사과 메시지 (작은 실수)',
    input:
      '회의에서 다른 동료 의견을 잘못 이해해 반박했음. 회의 후 그 동료에게 보낼 사과 메시지를 작성해주세요. 격식 + 진정성. 변명 X. 100자 내외.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria: '사실 인정 + 사과 + 향후 의지. 변명 X. 100자 내외. 따뜻한 톤.',
  },
  {
    id: 'general_birthday_msg_01',
    domain: 'general',
    title: '친구 생일 축하 메시지',
    input:
      '오래된 친구(10년+) 생일 축하 메시지. 따뜻 + 추억 1가지 + 미래 응원. 50자 이내, 카톡 톤.',
    emphasis_axes: ['domain_fit'],
    pass_criteria:
      '50자 이내. 친근 카톡 톤. 추억 + 응원 자연스럽게. 이모지 1~2개.',
  },
];
