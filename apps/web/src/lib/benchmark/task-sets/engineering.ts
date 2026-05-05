/**
 * engineering 도메인 — 7개 작업.
 * 개발·코드·시스템 영역.
 */

import type { BenchmarkTask } from './types';

export const ENGINEERING_TASKS: BenchmarkTask[] = [
  {
    id: 'eng_function_01',
    domain: 'engineering',
    title: 'TypeScript 함수 작성',
    input:
      '주어진 배열에서 *연속된 N개 합계의 최댓값* 을 찾는 TypeScript 함수를 작성해주세요. 시간 복잡도 O(n). 타입 + 간단한 테스트 케이스 1개 포함.',
    emphasis_axes: ['accuracy', 'completeness', 'domain_fit'],
    pass_criteria:
      'sliding window 알고리즘 정확. 타입 명확. 테스트 케이스 동작. O(n) 보장.',
  },
  {
    id: 'eng_bug_fix_01',
    domain: 'engineering',
    title: 'React 버그 진단·수정',
    input:
      '아래 React 코드의 무한 렌더링 버그를 진단하고 수정해주세요.\n\n```tsx\nfunction List({items}) {\n  const [filtered, setFiltered] = useState([]);\n  useEffect(() => {\n    setFiltered(items.filter(i => i.active));\n  });\n  return <ul>{filtered.map(i => <li key={i.id}>{i.name}</li>)}</ul>;\n}\n```',
    emphasis_axes: ['accuracy', 'domain_fit'],
    pass_criteria:
      'useEffect 의존성 배열 누락 진단 + [items] 의존성 추가 또는 useMemo로 대체. 원인 설명 명확.',
  },
  {
    id: 'eng_api_design_01',
    domain: 'engineering',
    title: 'REST API 엔드포인트 설계',
    input:
      '회원 CRUD REST API 5개 엔드포인트 설계. method·path·request body·response·status 코드. 페이지네이션·필터링 포함.',
    emphasis_axes: ['accuracy', 'domain_fit', 'completeness'],
    pass_criteria:
      'GET(list)·GET(by id)·POST·PATCH·DELETE 5개. RESTful 컨벤션 정확. status 코드 적절(200/201/204/400/404).',
  },
  {
    id: 'eng_test_01',
    domain: 'engineering',
    title: 'Jest 테스트 5개',
    input:
      '아래 함수에 대한 Jest 테스트 5개 작성. happy path·edge case·에러 케이스 균형.\n\n```ts\nfunction chunk<T>(arr: T[], size: number): T[][] {\n  if (size <= 0) throw new Error("size must be > 0");\n  const result: T[][] = [];\n  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));\n  return result;\n}\n```',
    emphasis_axes: ['accuracy', 'completeness', 'domain_fit'],
    pass_criteria:
      'happy path·edge case(빈 배열·size=1·끝 부분)·에러 케이스(size<=0). describe·it 패턴.',
  },
  {
    id: 'eng_dockerfile_01',
    domain: 'engineering',
    title: 'Node.js Dockerfile (multi-stage)',
    input:
      'Next.js 14 앱 Dockerfile을 multi-stage 빌드로 작성. node:20-alpine 베이스. dependencies 캐시 최적화 + 최종 이미지 크기 최소화.',
    emphasis_axes: ['accuracy', 'domain_fit', 'completeness'],
    pass_criteria:
      'deps·builder·runner 3 stage. package*.json 먼저 복사. NODE_ENV=production. EXPOSE 3000. CMD 정확.',
  },
  {
    id: 'eng_sql_query_01',
    domain: 'engineering',
    title: '복잡한 SQL JOIN 쿼리',
    input:
      'orders·customers·products 3 테이블에서 "지난 30일간 매출 상위 10 고객 + 그 고객별 상위 3 상품" 쿼리 작성. PostgreSQL.',
    emphasis_axes: ['accuracy', 'domain_fit'],
    pass_criteria:
      'CTE 또는 window function 활용. RANK() PARTITION BY. 정확한 JOIN. 30일 필터.',
  },
  {
    id: 'eng_perf_review_01',
    domain: 'engineering',
    title: '느린 함수 진단·최적화',
    input:
      '아래 함수가 N=10000일 때 매우 느립니다. 진단·최적화 제안.\n\n```ts\nfunction findDuplicates(arr: number[]): number[] {\n  const dups: number[] = [];\n  for (const n of arr) {\n    if (arr.indexOf(n) !== arr.lastIndexOf(n) && !dups.includes(n)) dups.push(n);\n  }\n  return dups;\n}\n```',
    emphasis_axes: ['accuracy', 'domain_fit'],
    pass_criteria:
      'O(n²) 진단 + Map·Set으로 O(n) 변환 코드. 성능 차이 추정 (N=10000 기준).',
  },
];
