/**
 * RFC 9457 Problem Details 응답 헬퍼
 * 근거: docs/service-dev/02_design/api.md §1-5
 *
 * 표준 에러 타입 URI:
 *   /errors/validation (422), /errors/unauthorized (401), /errors/forbidden (403),
 *   /errors/not-found (404), /errors/conflict (409), /errors/rate-limit (429),
 *   /errors/internal (500), /errors/not-implemented (501)
 */

export type ProblemKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'rate-limit'
  | 'internal'
  | 'not-implemented';

type ProblemFieldError = { field: string; message: string };

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: ProblemFieldError[];
  request_id?: string;
};

const BASE_URI = 'https://uhagwi.com/errors';

const DEFAULTS: Record<ProblemKind, { status: number; title: string }> = {
  validation: { status: 422, title: '검증 실패' },
  unauthorized: { status: 401, title: '인증 필요' },
  forbidden: { status: 403, title: '권한 없음' },
  'not-found': { status: 404, title: '찾을 수 없어요' },
  conflict: { status: 409, title: '충돌' },
  'rate-limit': { status: 429, title: '요청이 너무 많아요' },
  internal: { status: 500, title: '서버 오류' },
  'not-implemented': { status: 501, title: '아직 구현되지 않았어요' },
};

export function problem(
  kind: ProblemKind,
  options: {
    detail?: string;
    instance?: string;
    errors?: ProblemFieldError[];
    requestId?: string;
    headers?: HeadersInit;
    overrideStatus?: number;
  } = {},
): Response {
  const preset = DEFAULTS[kind];
  const body: ProblemDetails = {
    type: `${BASE_URI}/${kind}`,
    title: preset.title,
    status: options.overrideStatus ?? preset.status,
    detail: options.detail,
    instance: options.instance,
    errors: options.errors,
    request_id: options.requestId,
  };

  return new Response(JSON.stringify(body), {
    status: body.status,
    headers: {
      'Content-Type': 'application/problem+json; charset=utf-8',
      ...options.headers,
    },
  });
}

/** 간편 헬퍼 */
export const notImplemented = (detail = '이 엔드포인트는 MVP 후속 구현 대기 중입니다.') =>
  problem('not-implemented', { detail });
