/**
 * POST /api/interview/analyze — 종합 분석 (Anthropic Opus 4.7 직접 fetch).
 *
 * SDK 사용 안 함 — Vercel serverless 호환성 + 의존성 0.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { INTERVIEW_ANALYZE_PROMPT } from '@/app/interview/system-prompt';
import { ANALYZE_THEME_PROMPT } from '@/app/interview/themes';
import { problem } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 90;

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
});

const ThemeIdEnum = z.enum([
  'energy_map',
  'weekly_routine',
  'tools_outputs',
  'pain_points',
  'automation_desire',
  'direction_philosophy',
]);

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(2).max(80),
  theme_id: ThemeIdEnum.optional(),
});

const ThemeAnalyzeResultSchema = z.object({
  theme_id: ThemeIdEnum,
  theme_summary: z.string().min(10).max(800),
  key_findings: z.array(z.string()).min(2).max(5),
  auto_candidates: z
    .array(
      z.object({
        rank: z.number().int().min(1).max(10),
        category: z.enum(['daily', 'weekly', 'one_time', 'social']),
        title: z.string().min(2).max(80),
        domain: z.string().min(2).max(40),
        why: z.string().min(10).max(400),
        estimated_save_min_per_week: z.number().int().min(0).max(2000),
      }),
    )
    .min(1)
    .max(6),
  creature_signal: z
    .enum(['coder', 'writer', 'analyst', 'designer', 'researcher', 'none'])
    .default('none'),
  next_theme_suggestion: ThemeIdEnum.optional(),
});

const DimensionSchema = z.object({
  score: z.number().int().min(0).max(100),
  evidence: z.array(z.string()).min(0).max(5),
  interpretation: z.string().min(0).max(300),
});

const AnalyzeResultSchema = z.object({
  persona_code: z.string().min(2).max(40),
  persona_name_kr: z.string().min(2).max(80),
  summary: z.string().min(20).max(1500),
  dimensions: z.object({
    domain_breadth: DimensionSchema,
    automation_drive: DimensionSchema,
    systems_thinking: DimensionSchema,
    exploration: DimensionSchema,
    externalization: DimensionSchema,
  }),
  strengths: z.array(z.string()).min(1).max(6),
  watch_outs: z.array(z.string()).min(0).max(6),
  auto_candidates: z
    .array(
      z.object({
        rank: z.number().int().min(1).max(15),
        category: z.enum(['daily', 'weekly', 'one_time', 'social']),
        title: z.string().min(2).max(80),
        domain: z.string().min(2).max(40),
        why: z.string().min(10).max(400),
        estimated_save_min_per_week: z.number().int().min(0).max(2000),
      }),
    )
    .min(6)
    .max(15),
  total_save_min_per_week: z.number().int().min(0).max(10000),
  recommended_first_demo: z.number().int().min(1).max(15),
  creature_type: z.enum(['coder', 'writer', 'analyst', 'designer', 'researcher']),
  creature_personality: z.string().min(2).max(120),
});

type AnthropicResponse = {
  content: Array<{ type: 'text'; text: string } | { type: string; [k: string]: unknown }>;
  usage: { input_tokens: number; output_tokens: number };
};

type AnthropicError = { type: 'error'; error: { type: string; message: string } };

async function callAnthropic(apiKey: string, body: object, retries = 1): Promise<AnthropicResponse> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
      if (!res.ok) {
        const errJson = (await res.json().catch(() => null)) as AnthropicError | null;
        const msg = errJson?.error?.message ?? `HTTP ${res.status}`;
        const e = new Error(`Anthropic API ${res.status}: ${msg}`);
        if (res.status >= 400 && res.status < 500) throw e;
        lastErr = e;
      } else {
        return (await res.json()) as AnthropicResponse;
      }
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt === retries) throw lastErr;
    }
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  throw lastErr ?? new Error('알 수 없는 오류');
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return problem('internal', {
      detail:
        'ANTHROPIC_API_KEY 환경변수가 없습니다. Vercel Settings → Environment Variables에서 등록 후 Redeploy 해주세요.',
    });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon';
  const rl = await checkRateLimit('publish', ip);
  if (!rl.ok) {
    return problem('rate-limit', {
      detail: '잠시 후 다시 시도해주세요.',
      headers: rl.retryAfter ? { 'retry-after': String(rl.retryAfter) } : undefined,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return problem('validation', { detail: 'JSON 파싱 실패' });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return problem('validation', {
      errors: parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // theme_id 있으면 테마별 부분 분석 (가벼움), 없으면 종합 분석 (무거움)
  const isThemeAnalysis = !!parsed.data.theme_id;
  const systemPrompt = isThemeAnalysis ? ANALYZE_THEME_PROMPT : INTERVIEW_ANALYZE_PROMPT;
  // 테마 분석은 Haiku로 충분, 종합 분석만 Opus
  const model = isThemeAnalysis ? 'claude-haiku-4-5-20251001' : 'claude-opus-4-7';

  try {
    const conversationText = parsed.data.messages
      .map((m) => `[${m.role === 'user' ? '사용자' : '도반'}] ${m.content}`)
      .join('\n\n');

    const userPrompt = isThemeAnalysis
      ? `테마: ${parsed.data.theme_id}\n\n다음 대화를 분석해 시스템 프롬프트의 JSON 형식으로만 응답해주세요.\n\n---\n\n${conversationText}\n\n---\n\nJSON만 반환. 마크다운 코드 펜스 금지.`
      : `다음은 사용자와 우하귀 진단 도반의 대화 전체입니다.\n시스템 프롬프트의 출력 형식(순수 JSON)에 따라 페르소나를 분석해주세요.\n\n---\n\n${conversationText}\n\n---\n\n위 대화를 바탕으로 JSON으로만 응답해주세요. 마크다운 코드 펜스 금지.`;

    const result = await callAnthropic(apiKey, {
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user' as const,
          content: userPrompt,
        },
      ],
    });

    const text = result.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    let parsedResult: unknown;
    try {
      parsedResult = JSON.parse(cleaned);
    } catch {
      return problem('internal', {
        detail: `JSON 파싱 실패: ${cleaned.slice(0, 200)}`,
      });
    }

    // Opus가 빈 placeholder 항목 끼워보내는 경우 필터 (방어적)
    if (
      parsedResult &&
      typeof parsedResult === 'object' &&
      'auto_candidates' in parsedResult &&
      Array.isArray((parsedResult as { auto_candidates: unknown[] }).auto_candidates)
    ) {
      const obj = parsedResult as { auto_candidates: Array<Record<string, unknown>> };
      obj.auto_candidates = obj.auto_candidates.filter((c) => {
        const title = typeof c.title === 'string' ? c.title.trim() : '';
        const domain = typeof c.domain === 'string' ? c.domain.trim() : '';
        const why = typeof c.why === 'string' ? c.why.trim() : '';
        return title.length >= 2 && domain.length >= 2 && why.length >= 10;
      });
      // rank 재정렬 (1부터 순차)
      obj.auto_candidates.forEach((c, i) => {
        c.rank = i + 1;
      });
    }

    // 테마 분석은 다른 스키마로 검증
    if (isThemeAnalysis) {
      const validated = ThemeAnalyzeResultSchema.safeParse(parsedResult);
      if (!validated.success) {
        return problem('internal', {
          detail: '테마 분석 출력 스키마 검증 실패',
          errors: validated.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return Response.json({
        ok: true,
        mode: 'theme',
        result: validated.data,
        usage: result.usage,
      });
    }

    const validated = AnalyzeResultSchema.safeParse(parsedResult);
    if (!validated.success) {
      return problem('internal', {
        detail: 'Opus 출력 스키마 검증 실패',
        errors: validated.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return Response.json({
      ok: true,
      mode: 'comprehensive',
      result: validated.data,
      usage: {
        input_tokens: result.usage.input_tokens,
        output_tokens: result.usage.output_tokens,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[interview/analyze] Anthropic 호출 실패', msg);
    return problem('internal', { detail: `Anthropic Opus 호출 실패: ${msg}` });
  }
}
