/**
 * 우하귀 벤치마크 표준 작업 타입 정의.
 */

import type { BenchmarkAxis, BenchmarkDomain } from '@/lib/grades';

export type BenchmarkTask = {
  id: string;
  domain: BenchmarkDomain;
  title: string;
  /** 하네스에 던질 입력 */
  input: string;
  /** 가중 평가할 축 (5축 중 강조할 것) */
  emphasis_axes: BenchmarkAxis[];
  /** 출력 합격 기준 (평가 모델이 참고) */
  pass_criteria: string;
};
