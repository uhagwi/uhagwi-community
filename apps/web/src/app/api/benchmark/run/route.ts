/**
 * POST /api/benchmark/run — 하네스 1개 자동 벤치마크 실행.
 *
 * 입력: { harness_output: string, task_id: string }
 *   - harness_output: 평가할 하네스가 task에 대해 만든 출력 텍스트
 *   - task_id: 표준 작업 ID
 * 출력: 5축 점수 + auto_score + strengths + issues + comment
 *
 * 사용:
 *   1. 하네스 사용자가 표준 작업 입력으로 출력 만듦
 *   2. 출력을 본 API에 POST → Opus 4.7이 5축 평가
 *   3. 응답으로 점수 받음 (DB 저장은 별도 endpoint, Phase B-3)
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { problem } from '@/lib/problem';
import { checkRateLimit } from '@/lib/rate-limit';
import { getTaskById } from '@/lib/benchmark/task-sets';
import {
  BENCHMARK_JUDGE_PROMPT,
  buildJudgePrompt,
  weightedAvg,
  type JudgeResult,
} from '@/lib/benchmark/judge';
import { combineScore, computeGrade } from '@/lib/grades';

export const runtime = 'nodejs';
export const maxDuration = 90;

const RequestSchema = z.object({
  task_id: z.string().min(1).max(80),
  harness_output: z.string().min(1).max(20000),
});

const JudgeAxesSchema = z.object({
  accuracy: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  time_save: z.number().min(0).max(100),
  domain_fit: z.number().min(0).max(100),
  user_satisfaction: z.number().min(0).max(100),
});

const JudgeResultSchema = z.object({
  axes: JudgeAxesSchema,
  auto_score: z.number().min(0).max(100),
  strengths: z.array(z.string()).min(0).max(5),
  issues: z.array(z.string()).min(0).max(5),
  comment: z.string().min(0).max(400),
});

type AnthropicResponse = {
  content: Array<{ type: 'text'; text: string } | { type: string; [k: string]: unknown }>;
  usage: { input_tokens: number; output_tokens: number };
};

async function callAnthropic(apiKey: string, body: object): Promise<AnthropicResponse> {
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
    const errText = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 300)}`);
  }
  return (await res.json()) as AnthropicResponse;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return problem('internal', {
      detail: 'ANTHROPIC_API_KEY 환경변수가 없습니다. Vercel Settings에서 등록 후 Redeploy.',
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

  const task = getTaskById(parsed.data.task_id);
  if (!task) {
    return problem('not-found', {
      detail: `표준 작업 task_id=${parsed.data.task_id}를 찾을 수 없습니다.`,
    });
  }

  try {
    const userPrompt = buildJudgePrompt(task, parsed.data.harness_output);
    const result = await callAnthropic(apiKey, {
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      system: BENCHMARK_JUDGE_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = result.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    // 코드 펜스 방어 제거
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      return problem('internal', {
        detail: `Judge JSON 파싱 실패: ${cleaned.slice(0, 200)}`,
      });
    }

    const validated = JudgeResultSchema.safeParse(parsedJson);
    if (!validated.success) {
      return problem('internal', {
        detail: 'Judge 출력 스키마 검증 실패',
        errors: validated.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const judge: JudgeResult = validated.data;

    // 가중 평균 재계산 (emphasis_axes 반영) + 등급 산출
    const weighted = weightedAvg(judge.axes, task.emphasis_axes);
    // 사용자 평가는 이번 단계 없음 → null
    const total = combineScore(weighted, null);
    const grade = computeGrade(total);

    return Response.json({
      ok: true,
      task: {
        id: task.id,
        domain: task.domain,
        title: task.title,
      },
      judge,
      weighted_score: weighted,
      total,
      grade,
      usage: result.usage,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[benchmark/run] 호출 실패', msg);
    return problem('internal', { detail: `벤치마크 실행 실패: ${msg}` });
  }
}
