/**
 * 친밀 맥락 검출기 — 사용자 게시(publish) 시 노출되면 곤란한 패턴을 가볍게 탐지.
 *
 * 정책 (2026-05-05):
 *   "벤처기업협회·카페가일·리더스아카데미"처럼 특정 회사·기관·고유 인명·사업장 이름이
 *   공개 갤러리에 그대로 올라가면 본인의 친밀 맥락이 노출됨. publish 게이트에서
 *   가벼운 패턴 매칭으로 경고만 띄운다(차단 X — 사용자가 OK 하면 그대로 게시).
 *
 *   추가 보강은 하네스 #35(범용화기) 풀 8층 검사로 위임.
 */

export type IntimateHit = {
  field: string;
  value: string;
  patterns: string[];
};

const COMPANY_SUFFIX = [
  '협회',
  '재단',
  '주식회사',
  '(주)',
  '㈜',
  '법인',
  '아카데미',
  '스튜디오',
  '연구소',
  '센터',
  '지회',
  '지부',
  '조합',
  '조합법인',
];

const PROPER_HINT = [
  // 사용자 본인 친밀 맥락 (드러나면 안 되는 고유명)
  '벤처기업협회',
  '리더스 아카데미',
  '리더스아카데미',
  '카페 가일',
  '카페가일',
  '글로벌트레이딩',
  '안녕가드너',
  '안녕!가드너',
  '두타',
  '도반',
  '다름 힐링스테이',
  '테이스트트립',
  '우하귀',
  '이진명',
  '전북지회',
];

const LOCATION_HINT = [
  '전북',
  '전주',
  '익산',
  '군산',
  '완주',
  '정읍',
  '남원',
  '김제',
  '진안',
  '무주',
  '장수',
  '임실',
  '순창',
  '고창',
  '부안',
];

const SCAN_FIELDS = [
  'title',
  'one_liner',
  'purpose',
  'prompt_snippet',
  'persona_name',
  'persona_job',
] as const;

export type ScanInput = Partial<Record<(typeof SCAN_FIELDS)[number], string | null | undefined>>;

function findPatterns(text: string): string[] {
  const hits: string[] = [];
  for (const word of PROPER_HINT) if (text.includes(word)) hits.push(word);
  for (const suf of COMPANY_SUFFIX) {
    // "OOO협회" 같이 회사 접미사가 단독이 아니라 다른 글자와 붙어 등장하는지
    const re = new RegExp(`[가-힣A-Za-z0-9]{2,10}${suf.replace(/([().㈜])/g, '\\$1')}`, 'g');
    const m = text.match(re);
    if (m) hits.push(...m);
  }
  for (const loc of LOCATION_HINT) {
    if (text.includes(loc)) hits.push(loc);
  }
  return Array.from(new Set(hits));
}

export function scanIntimateContext(input: ScanInput): IntimateHit[] {
  const out: IntimateHit[] = [];
  for (const field of SCAN_FIELDS) {
    const v = input[field];
    if (!v) continue;
    const patterns = findPatterns(String(v));
    if (patterns.length > 0) out.push({ field, value: String(v), patterns });
  }
  return out;
}

export function summarizeHits(hits: IntimateHit[]): string {
  if (hits.length === 0) return '';
  const lines = hits.map(
    (h) => `• ${h.field}: ${h.patterns.join(', ')} (이 단어가 공개됩니다)`,
  );
  return [
    '⚠️ 친밀 맥락 패턴이 감지됐어요',
    '',
    ...lines,
    '',
    '권장: 회사·기관·지역명을 카테고리 표현(예: "협회·비영리", "지역 카페")으로 바꾸세요.',
    '그대로 게시해도 되지만, 공개 갤러리에 노출됩니다.',
  ].join('\n');
}
