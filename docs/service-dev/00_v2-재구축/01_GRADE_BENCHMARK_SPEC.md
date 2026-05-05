# 하네스 등급화·벤치마크·뽑기 시스템 SPEC v0.1

> 출처: [[우하귀-사업화]] §11 (2026-05-05 결정)
> 위치: 본 문서는 #33 우하귀 코드 작업 가이드 (의사결정·로드맵은 #34 위키)

---

## 1. 시스템 3축

| 축 | 코드 위치 |
|---|---|
| 등급화 (Grading) | `apps/web/src/lib/grades.ts` ✅ 박힘 |
| 벤치마크 (Benchmark) | `apps/web/src/lib/benchmark/` (신규, Phase B-2) |
| 뽑기 UX (Gacha) | `apps/web/src/components/HarnessGradeCard.tsx` ✅ 박힘 / `apps/web/src/app/gacha/` (신규, Phase B-4) |

---

## 2. 등급 5단계 (이미 박힘)

| Grade | 점수 | 색·시각 | 비율 (가챠) |
|---|---|---|---|
| S | 95~100 | 무지개·금테·반짝 | 5% |
| A | 85~94 | 보라 + 빛 | 15% |
| B | 75~84 | 파랑 | 30% |
| C | 65~74 | 회색 | 35% |
| D | < 65 | 흙갈색 | 15% |

`computeGrade(total: number): Grade` 함수가 점수→등급 변환.

---

## 3. 벤치마크 (Phase B-2 박을 것)

### 3.1 표준 작업셋 — 도메인별

`apps/web/src/lib/benchmark/task-sets/{domain}.ts` 형태로 박음:

```ts
// task-sets/education.ts
export const EDUCATION_TASKS: BenchmarkTask[] = [
  {
    id: 'edu_quiz_01',
    title: '고1 영어 객관식 5문항',
    input: { topic: '...', difficulty: 'medium', count: 5 },
    expected_axes: ['accuracy', 'completeness', 'domain_fit'],
  },
  // ...
];
```

도메인 7종(education·admin·cafe_business·research·design·engineering·general) 각 5~13개씩 = 약 60개.

### 3.2 자동 평가 모델

```
Anthropic Opus 4.7 또는 GPT-5-thinking
```

평가 프롬프트는 `lib/benchmark/judge-prompts.ts`:
- 입력: 표준 작업 + 하네스 출력
- 출력: 5축 점수 (0~100) + 코멘트

### 3.3 사용자 평가

UI: 하네스 사용 후 4축 별점 (5점 척도)
- 정확도 / 완성도 / 시간 절약 / 도메인 적합성
- 사용자 만족도는 4축 평균
- 100 환산: `score = (sum / 4) × 20`

### 3.4 종합 점수

```
total = round(auto * 0.7 + user * 0.3)
```

`combineScore(auto, user)` 함수가 처리. 사용자 평가 없으면 자동 100% 반영.

### 3.5 측정 주기

| 시점 | 동작 |
|---|---|
| 신규 등록 | 1회 자동 측정 → 초기 등급 |
| 월 1회 | 자동 재측정 + 사용자 평가 누적 합산 |
| 등급 변동 | 사용자 알림 (창작자에게) |

---

## 4. DB 스키마 (Supabase 마이그레이션, Phase B-2)

```sql
-- 0104_harness_grading.sql
alter table harnesses add column grade text;
alter table harnesses add column benchmark_total numeric(5,2);
alter table harnesses add column benchmark_axes jsonb; -- {accuracy, completeness, ...}
alter table harnesses add column benchmark_set_id text;
alter table harnesses add column auto_score numeric(5,2);
alter table harnesses add column user_score numeric(5,2);
alter table harnesses add column user_review_count integer not null default 0;
alter table harnesses add column measured_at timestamptz;

create table benchmark_history (
  id uuid primary key default gen_random_uuid(),
  harness_id uuid not null references harnesses(id) on delete cascade,
  measured_at timestamptz not null default now(),
  total numeric(5,2) not null,
  grade text not null,
  axes jsonb not null
);

create table user_reviews (
  id uuid primary key default gen_random_uuid(),
  harness_id uuid not null references harnesses(id) on delete cascade,
  user_id uuid not null references users(id),
  axes jsonb not null, -- {accuracy: 4, completeness: 5, time_save: 3, domain_fit: 5}
  comment text,
  created_at timestamptz not null default now(),
  unique(harness_id, user_id)
);
```

---

## 5. API 엔드포인트 (Phase B-2)

| 라우트 | 메서드 | 역할 |
|---|---|---|
| `/api/benchmark/run` | POST | 하네스 1개 자동 벤치마크 실행 (Opus 평가) |
| `/api/benchmark/review` | POST | 사용자 평가 등록 (4축 별점) |
| `/api/harnesses/[id]/grade` | GET | 하네스 등급·점수·이력 조회 |

---

## 6. 가챠 UX (Phase B-4)

### 6.1 매칭 알고리즘

```
사용자 Phase 4 자동화 후보 → 우하귀 카탈로그 풀
필터: 같은 카테고리(daily/weekly/...) + 도메인 매칭 가중
정렬: 사용자 페르소나 적합도 점수 × (등급 가중치 + 다양성 보너스)
출력: N장 카드 (S 1~2장, A 2~3장, B 3~5장 정도 분산)
```

### 6.2 가챠 화면

```
페이지: /gacha
컴포넌트: HarnessGradeCard (이미 박힘)
애니메이션:
  1. 모든 카드 뒷면 (🎴)
  2. 사용자 클릭 시 1장씩 뒤집힘 (CSS transform: rotateY)
  3. S 등급은 빛·반짝 효과 추가
  4. 등급 공개 후 "사용해보기" 버튼 → MCP 설치 가이드 (Pro 필요 시 결제 게이트)
```

### 6.3 무료/Pro 분리

| 항목 | 무료 | Pro |
|---|---|---|
| 진단 후 매칭 카드 1장 | ✅ | — |
| 매칭 카드 N장 전체 | ❌ | ✅ |
| MCP 가동 (실 자동화) | ❌ | ✅ |
| 매일 1장 무료 뽑기 (다른 도메인 탐색) | ✅ | ✅ |
| Premium S 풀 | ❌ | ✅ |

---

## 7. 이번 turn 박힌 것 (v0.1)

| 파일 | 상태 |
|---|---|
| `apps/web/src/lib/grades.ts` | ✅ 등급 5단계 + 벤치마크 5축 + 메타데이터 + computeGrade·combineScore 헬퍼 |
| `apps/web/src/components/HarnessGradeCard.tsx` | ✅ 가챠 카드 placeholder (등급별 시각) |
| `JIN/06. Personal AI OS/projects/우하귀-사업화.md` §11 | ✅ 사업 모델 11번째 결정 박힘 |
| 본 SPEC | ✅ 시스템 설계서 |

## 8. 다음 세션 박을 것 (v0.2~0.4)

### v0.2 (Phase B-2, 약 8~12시간)
- `lib/benchmark/task-sets/` 도메인 7종 표준 작업 약 60개
- `lib/benchmark/judge-prompts.ts` 자동 평가 프롬프트
- `/api/benchmark/run` API
- 0104 마이그레이션 작성·적용

### v0.3 (Phase B-3, 약 6~10시간)
- 사용자 4축 평가 UI
- `/api/benchmark/review` API
- 종합 점수 누적 산출 (자동 70% + 사용자 30%)
- 등급 변동 알림 (이메일·디스코드)

### v0.4 (Phase B-4, 약 10~15시간)
- `/gacha` 페이지 신설
- 매칭 알고리즘 구현
- 카드 뒤집힘 애니메이션 + S 반짝
- Pro 게이트 (Premium S 풀·매일 뽑기)

## 메타

| 항목 | 값 |
|---|---|
| 작성일 | 2026-05-05 |
| 출처 | 사용자 요청 "하네스 등급화·뽑기·벤치마크" |
| 작업 본부 | `33_우하귀_AI엔지니어링커뮤니티/uhagwi/` (코드) + `JIN/06. Personal AI OS/projects/우하귀-사업화.md` (사업 모델) |
| 다음 트리거 | "벤치마크 시스템 박아줘" / "가챠 페이지 만들어줘" |
