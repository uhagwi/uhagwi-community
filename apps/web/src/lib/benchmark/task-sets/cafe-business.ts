/**
 * cafe_business 도메인 — 10개 작업.
 * 카페·소상공인·자영업 운영 영역.
 */

import type { BenchmarkTask } from './types';

export const CAFE_BUSINESS_TASKS: BenchmarkTask[] = [
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
    pass_criteria: '소진율 기반 적정 발주량 산출. 긴급도 표시. 발주 누락 없이 4 항목 모두.',
  },
  {
    id: 'cafe_notice_01',
    domain: 'cafe_business',
    title: '카페 휴무 공지',
    input:
      '카페 5월 어버이날(5/8)에 부분 영업 — 오전 영업, 오후 1시 마감. 손님에게 보일 SNS 공지글을 만들어주세요. 따뜻하고 가벼운 톤.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria: '날짜·시간 정확. 따뜻한 톤. SNS 친화 길이(2~3 문단). 이모지 적절.',
  },
  {
    id: 'cafe_menu_desc_01',
    domain: 'cafe_business',
    title: '신메뉴 설명 카드 3개',
    input:
      '신메뉴 3종 설명 카드를 만들어주세요. 각 카드 50자 이내, 핵심 재료·맛 특징·추천 시간대 포함.\n\n메뉴: 1) 흑임자 라떼, 2) 시그니처 콜드브루, 3) 피스타치오 크림 케이크',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '각 카드 50자 이내. 재료 + 맛 + 시간대 모두 포함. 손님 식욕 자극 톤.',
  },
  {
    id: 'cafe_review_reply_01',
    domain: 'cafe_business',
    title: '별점 3 리뷰 답글',
    input:
      '아래 리뷰에 답글을 작성해주세요. 톤은 정중 + 진정성, 변명 X.\n\n"분위기는 좋은데 라떼가 제 취향엔 좀 진했어요. 다음에 다시 와볼게요. 별 3개."',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '리뷰 구체 내용 언급 + 감사 + 개선 의지 + 재방문 환영. 변명·반박 X.',
  },
  {
    id: 'cafe_event_post_01',
    domain: 'cafe_business',
    title: '시즌 이벤트 인스타 포스팅',
    input:
      '카페 봄 시즌 이벤트 — "벚꽃 라떼 출시 + 첫 100분 무료 시음" 인스타 포스팅 작성. 캡션 + 해시태그 5개. 2~3 문단 분량.',
    emphasis_axes: ['domain_fit', 'completeness'],
    pass_criteria:
      '이벤트 내용 명확 + 시급성 + 인스타 톤(이모지·줄바꿈) + 해시태그 5개 (관련성 높은).',
  },
  {
    id: 'cafe_supplier_01',
    domain: 'cafe_business',
    title: '공급사 단가 비교표',
    input:
      '원두 공급사 3곳 비교표. A사: 다크 1kg 28,000원, 미디엄 1kg 25,000원, 배송 무료(5kg+). B사: 다크 1kg 30,000원, 미디엄 1kg 26,000원, 배송 무료(3kg+). C사: 다크 1kg 26,000원, 미디엄 1kg 23,000원, 배송 3,000원.\n\n표 + 추천 1줄.',
    emphasis_axes: ['accuracy', 'completeness'],
    pass_criteria:
      'Markdown 표. 단가·배송 모두 정확 반영. 월간 사용량 가정 추천 명확.',
  },
  {
    id: 'cafe_training_01',
    domain: 'cafe_business',
    title: '신입 알바 1주 교육 체크리스트',
    input:
      '신입 알바생 1주차 교육 체크리스트를 만들어주세요. Day 1~7별로 학습 내용·실습·평가 항목.',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria:
      '7일 모두 채움. 자연스러운 난이도 상승 (기본→고급). 실습·평가 균형.',
  },
  {
    id: 'cafe_promotion_sms_01',
    domain: 'cafe_business',
    title: '단골 프로모션 문자',
    input:
      '단골 손님(가입 1년+) 100명에게 보낼 감사 프로모션 문자. 핵심: "5월 한 달간 모든 음료 20% 할인". 80자 이내, 친근 톤.',
    emphasis_axes: ['completeness', 'domain_fit'],
    pass_criteria: '80자 이내. 감사 + 혜택 + 기간 명시. 친근 톤. 발신자 이름 포함.',
  },
  {
    id: 'cafe_inventory_count_01',
    domain: 'cafe_business',
    title: '월말 재고 실사 보고',
    input:
      '4월 말 재고 실사 결과 — 원두 다크 7kg(전월 5kg)·미디엄 3kg(전월 4kg)·우유 25팩(전월 30팩)·시럽 8병(전월 6병)·일회용컵 1500개(전월 1200개). 입출고 차이 + 평가 + 5월 대비 권고 1단락.',
    emphasis_axes: ['accuracy', 'completeness'],
    pass_criteria: '증감 정확. 이상 항목 (재고 늘어난 것) 식별. 5월 권고 구체.',
  },
];
