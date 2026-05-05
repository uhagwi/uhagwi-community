/**
 * admin 도메인 — 10개 작업.
 * 협회·기관·사무직 행정 영역.
 */

import type { BenchmarkTask } from './types';

export const ADMIN_TASKS: BenchmarkTask[] = [
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
    pass_criteria: '이번주 실적·다음주 계획·이슈 사항 3섹션 명확. 행정 격식 + 1페이지 적정 분량.',
  },
  {
    id: 'admin_email_01',
    domain: 'admin',
    title: '거절 메일 (정중)',
    input:
      '다른 협회에서 후원 요청 이메일을 받았습니다. 정중하게 거절하는 답장을 작성해주세요 — 사유: 협회 예산 한정. 톤은 기존 관계 유지 가능하도록 따뜻하게.',
    emphasis_axes: ['domain_fit', 'accuracy', 'completeness'],
    pass_criteria: '거절 사유 명시 + 향후 관계 가능성 + 격식체 + 따뜻한 톤. 5단 격식.',
  },
  {
    id: 'admin_meeting_minutes_01',
    domain: 'admin',
    title: '회의록 작성',
    input:
      '아래 회의 발언을 회의록 형식으로 정리해주세요.\n\n"5/5 14시. 김회장: 정기총회 일정 확정 필요. 박이사: 6월 15일이 좋겠다. 이부장: 예산 보고서 5월 말까지 마무리. 김회장: 임원 선출 명단 5월 20일까지 취합. 박이사: 회원 안내문 5월 12일 발송 예정."',
    emphasis_axes: ['accuracy', 'completeness', 'domain_fit'],
    pass_criteria:
      '일시·참석자·안건·결정사항·후속조치 5섹션. 발언 정확 정리. 결정·일정 명확.',
  },
  {
    id: 'admin_announcement_01',
    domain: 'admin',
    title: '사내 공지 — 시스템 점검',
    input:
      '5월 10일(토) 오전 2~6시 사내 시스템 정기 점검. 이메일·메신저·내부 ERP 모두 사용 불가. 사전 작업 저장 권고. 사내 공지문 작성.',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria: '제목·일시·영향 시스템·사전 권고·문의처 포함. 사내 격식.',
  },
  {
    id: 'admin_proposal_01',
    domain: 'admin',
    title: '행사 제안서 1페이지',
    input:
      '협회 창립 10주년 기념 행사 1페이지 제안서. 일시·장소·예상 참여자·핵심 프로그램 4개·예산 추정·기대 효과 포함.',
    emphasis_axes: ['completeness', 'domain_fit', 'time_save'],
    pass_criteria: '6 항목 모두 구체. 1페이지 분량 적정. 임원진이 즉시 검토 가능 수준.',
  },
  {
    id: 'admin_thank_you_01',
    domain: 'admin',
    title: '후원 감사 메일',
    input:
      'A기업이 협회 행사에 500만원 후원. 후원 감사 메일을 작성해주세요. 격식 + 진정성 + 향후 관계 강화 의지.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria: '구체적 후원 내용 언급 + 감사 표현 + 향후 협력 + 격식 5단 구조.',
  },
  {
    id: 'admin_member_data_01',
    domain: 'admin',
    title: '회원 명부 정리 표',
    input:
      '아래 텍스트 명단을 표(Markdown)로 정리해주세요. 컬럼: 이름·소속·연락처·기수·가입일.\n\n"홍길동(A벤처/010-1234-5678/3기/2024.03.15), 김철수(B스타트업/010-9876-5432/3기/2024.03.20), 이영희(C솔루션/010-5555-7777/4기/2025.04.10)"',
    emphasis_axes: ['accuracy', 'completeness'],
    pass_criteria: '5 컬럼 정확 추출. 데이터 누락·오류 0. Markdown 표 형식.',
  },
  {
    id: 'admin_budget_01',
    domain: 'admin',
    title: '분기별 예산 집행률 표',
    input:
      '협회 예산 집행 현황을 표로 정리해주세요. 1Q 행사비 예산 1000만 집행 850만, 인건비 예산 1500만 집행 1500만, 운영비 예산 500만 집행 320만, 홍보비 예산 300만 집행 290만. 집행률 % + 잔액 + 평가 1줄.',
    emphasis_axes: ['accuracy', 'completeness'],
    pass_criteria: '집행률 % 정확 (예: 850/1000 = 85%). 잔액 정확. 4 항목 모두.',
  },
  {
    id: 'admin_membership_form_01',
    domain: 'admin',
    title: '회원 가입 신청서 양식',
    input:
      '신규 회원 가입 신청서 양식을 만들어주세요. 필수 입력 7항목·선택 입력 3항목·동의 항목 2개. 서명·날짜 마지막에.',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria: '필수 7 + 선택 3 + 동의 2 + 서명/날짜. 양식으로 즉시 사용 가능 (괄호·밑줄).',
  },
];
