/**
 * NextAuth v5 라우트 핸들러
 * 근거: docs/service-dev/02_design/api.md §2-1
 *
 * GET/POST /api/auth/* 를 NextAuth 가 내부 라우팅.
 * (signin, callback, signout, session, csrf 등)
 */
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
