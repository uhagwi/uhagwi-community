/**
 * 우하귀 벤치마크 표준 작업셋 v0.2 — 60개 풀세트.
 *
 * 도메인별 분포:
 *   education(10) + admin(10) + cafe_business(10) + research(8) +
 *   design(7) + engineering(7) + general(8) = 60
 *
 * 기존 import 경로(`@/lib/benchmark/task-sets`)는 자동으로 본 index 해석.
 */

import type { BenchmarkDomain } from '@/lib/grades';
import type { BenchmarkTask } from './types';
import { EDUCATION_TASKS } from './education';
import { ADMIN_TASKS } from './admin';
import { CAFE_BUSINESS_TASKS } from './cafe-business';
import { RESEARCH_TASKS } from './research';
import { DESIGN_TASKS } from './design';
import { ENGINEERING_TASKS } from './engineering';
import { GENERAL_TASKS } from './general';

export type { BenchmarkTask };

export const BENCHMARK_TASKS: BenchmarkTask[] = [
  ...EDUCATION_TASKS,
  ...ADMIN_TASKS,
  ...CAFE_BUSINESS_TASKS,
  ...RESEARCH_TASKS,
  ...DESIGN_TASKS,
  ...ENGINEERING_TASKS,
  ...GENERAL_TASKS,
];

export const BENCHMARK_TASK_TOTAL = BENCHMARK_TASKS.length;

export function getTasksByDomain(domain: BenchmarkDomain): BenchmarkTask[] {
  return BENCHMARK_TASKS.filter((t) => t.domain === domain);
}

export function getTaskById(id: string): BenchmarkTask | undefined {
  return BENCHMARK_TASKS.find((t) => t.id === id);
}

export const BENCHMARK_DOMAIN_DISTRIBUTION: Record<BenchmarkDomain, number> = {
  education: EDUCATION_TASKS.length,
  admin: ADMIN_TASKS.length,
  cafe_business: CAFE_BUSINESS_TASKS.length,
  research: RESEARCH_TASKS.length,
  design: DESIGN_TASKS.length,
  engineering: ENGINEERING_TASKS.length,
  general: GENERAL_TASKS.length,
};
