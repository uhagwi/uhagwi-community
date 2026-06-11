/**
 * 인터뷰 analyze 라우트 zod 스키마 모음.
 * Phase 2 (업무 추천) · Phase 4 (자동화 후보) · 테마 단일 분석 · 종합 분석.
 */
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
});

export const ThemeIdEnum = z.enum([
  'energy_map',
  'weekly_routine',
  'tools_outputs',
  'pain_points',
  'automation_desire',
  'direction_philosophy',
]);

export const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(2).max(80),
  theme_id: ThemeIdEnum.optional(),
  phase: z.union([z.literal(2), z.literal(4)]).optional(),
  phase2_result: z.string().max(16000).optional(),
  phase3_messages: z.array(MessageSchema).max(80).optional(),
});
export type RequestBody = z.infer<typeof RequestSchema>;

export const Phase2ResultSchema = z.object({
  user_profile_summary: z.string().min(20).max(1500),
  primary_domains: z.array(z.string()).min(1).max(8),
  tasks: z
    .array(
      z.object({
        rank: z.number().int().min(1).max(15),
        category: z.enum(['daily', 'weekly', 'monthly', 'one_time', 'social']),
        title: z.string().min(2).max(80),
        domain: z.string().min(2).max(40),
        frequency: z.string().min(1).max(40),
        current_pain_level: z.enum(['low', 'medium', 'high']),
        why_relevant: z.string().min(10).max(400),
        discovery_type: z.enum(['explicit', 'inferred']),
      }),
    )
    .min(3) // 짧은 인터뷰면 적게 나올 수 있음 (구 min(6)은 정상 출력을 거부할 위험)
    .max(15),
});

export const Phase4ResultSchema = z.object({
  persona_code: z.string().min(2).max(40),
  persona_name_kr: z.string().min(2).max(80),
  summary: z.string().min(20).max(1500),
  // 누락에 관대하게 — 모델이 일부 배열/키를 빠뜨려도 []로 통과 (구버전은 누락 시 500)
  automation_priorities: z
    .object({
      must_have: z.array(z.string()).max(5).default([]),
      want: z.array(z.string()).max(5).default([]),
      off_limits: z.array(z.string()).max(5).default([]),
    })
    .default({ must_have: [], want: [], off_limits: [] }),
  quality_bar: z.string().max(400).default(''),
  auto_candidates: z
    .array(
      z.object({
        rank: z.number().int().min(1).max(10),
        // Phase 2 tasks의 monthly가 후보로 넘어오므로 enum 정합 필수 (누락 시 500)
        category: z.enum(['daily', 'weekly', 'monthly', 'one_time', 'social']),
        title: z.string().min(2).max(80),
        domain: z.string().min(2).max(40),
        why_user_chose: z.string().min(10).max(400),
        automation_approach: z.string().min(10).max(400),
        estimated_save_min_per_week: z.number().int().min(0).max(2000),
        first_demo_priority: z.enum(['high', 'medium', 'low']),
      }),
    )
    .min(1) // 사용자가 동의한 것만 담으므로 1~10. (구 min(4)는 정상 출력을 거부해 500 유발)
    .max(10),
  total_save_min_per_week: z.number().int().min(0).max(10000),
  recommended_first_demo_rank: z.number().int().min(1).max(10),
  creature_type: z.enum(['coder', 'writer', 'analyst', 'designer', 'researcher']),
  creature_personality: z.string().min(2).max(120),
  pro_required_features: z.array(z.string()).max(8).default([]),
});

export const ThemeAnalyzeResultSchema = z.object({
  theme_id: ThemeIdEnum,
  theme_summary: z.string().min(10).max(800),
  key_findings: z.array(z.string()).min(2).max(5),
  auto_candidates: z
    .array(
      z.object({
        rank: z.number().int().min(1).max(10),
        category: z.enum(['daily', 'weekly', 'monthly', 'one_time', 'social']),
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

export const AnalyzeResultSchema = z.object({
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
        category: z.enum(['daily', 'weekly', 'monthly', 'one_time', 'social']),
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
