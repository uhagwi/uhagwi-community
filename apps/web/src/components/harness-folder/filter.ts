/**
 * 하네스 폴더 파싱 — 필터·판별 헬퍼.
 * boilerplate 제거, 태그 유효성, 카테고리 추론.
 */

import type { ParsedHarness } from './parse';

/** "CRITICAL RULE: ... 한국어로 ..." 같은 운영 보일러플레이트 라인 식별 */
export function isBoilerplate(line: string): boolean {
  const t = line.replace(/[*_>`]/g, '').trim();
  if (!t) return true;
  if (/CRITICAL\s+RULE/i.test(t)) return true;
  if (/모든\s+응답.*한국어/.test(t)) return true;
  if (/IMPORTANT[:：]/i.test(t) && t.length < 80) return true;
  return false;
}

/** boilerplate 라인 제거하고 본문만 반환 */
export function stripBoilerplate(md: string): string {
  return md
    .split('\n')
    .filter((line) => !isBoilerplate(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

export function isValidTag(t: string): boolean {
  if (!t || t.length < 2 || t.length > 20) return false;
  if (/^[0-9]+$/.test(t)) return false;
  if (/^[A-Fa-f0-9]{6}$/.test(t)) return false;
  if (/^[A-Fa-f0-9]{3}$/.test(t) && /[A-Fa-f]/.test(t)) return false;
  return true;
}

export function inferCategory(text: string): ParsedHarness['category'] {
  const t = text.toLowerCase();
  if (/제안서|proposal|기획서|공모|입찰|rfp/.test(t)) return 'proposal';
  if (/검증|verify|validator|fact[- ]?check|보안 ?감사/.test(t)) return 'verify';
  if (/개선|refine|polish|문서 ?다듬|퇴고/.test(t)) return 'improve';
  if (/개발|scaffold|풀스택|fullstack|배포|deploy|api 만|앱 만|service-dev/.test(t))
    return 'develop';
  return 'other';
}
