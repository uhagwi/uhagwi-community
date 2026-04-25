/**
 * 우하귀 MVP Phase 1 하드코딩 샘플 데이터
 * 근거: docs/service-dev/02_design/erd.md §2-2 harnesses · §2-3 comments · §2-4 reactions
 *
 * 실제 운영 중인 4종 "범용" 하네스를 기반으로 한 시연용 데이터.
 * Phase 2에서 Supabase 연결 시 타입은 그대로 유지하고 fetch 레이어만 교체.
 */

export type ReactionCounts = {
  heart: number;
  fire: number;
  bow: number;
  pinch: number;
};

export type SampleComment = {
  id: string;
  harness_id: string;
  author: {
    handle: string;
    display_name: string;
    avatar_emoji: string;
  };
  body: string;
  juzzep_score: number; // 0~100
  created_at: string; // ISO8601
};

export type SampleHarness = {
  id: string;
  post_id: string;
  slug: string;
  author_id: string;
  title: string;
  tagline: string; // UI용 보조 필드 (상세 헤더 tagline)
  persona_name: string | null;
  one_liner: string; // ERD harnesses.one_liner
  purpose: string; // ERD harnesses.purpose
  body_md: string; // 상세 본문 Markdown
  components: string[]; // ERD harnesses.components text[]
  persona_job: string | null;
  status: 'draft' | 'published' | 'featured' | 'reported' | 'deleted';
  visibility: 'public' | 'link' | 'private';
  published_at: string; // ISO8601
  reaction_counts: ReactionCounts;
  comments: SampleComment[];
  tags: string[];
  view_count: number;
  thumbnail_emoji: string; // 캐릭터 이미지 미생성 시 fallback
  thumbnail_url: string | null; // /characters/{slug}.png — 없으면 emoji fallback
  category: 'verify' | 'improve' | 'proposal' | 'develop';
};

export const SAMPLE_AUTHOR = {
  id: '00000000-0000-0000-0000-000000000001',
  handle: 'jinmyeung',
  display_name: '이진명',
  avatar_url: '/avatars/jinmyeung.png',
  avatar_emoji: '🌊',
  bio: '하네스 23종 운영 중인 AX 빌더 · 우하귀 창립자',
} as const;

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (n: number) => new Date(now - n * 60 * 60 * 1000).toISOString();

// ---------------------------------------------------------------------------
// 1. 범용 검증 하네스
// ---------------------------------------------------------------------------
const verifyHarness: SampleHarness = {
  id: '11111111-1111-1111-1111-111111111111',
  post_id: '21111111-1111-1111-1111-111111111111',
  slug: 'verify-harness',
  author_id: SAMPLE_AUTHOR.id,
  title: '범용 검증 하네스',
  tagline: '모든 산출물을 TRUST 기준으로 전수 검증',
  persona_name: '검증이',
  one_liner:
    "코드·문서·데이터 뭐든 들이대면 PASS/WARN/FAIL 리포트 찍어주는 독립 감사관.",
  purpose:
    'AI가 뱉은 산출물을 그대로 쓰기 불안한 사람을 위한 자동 검증 레이어. 자가검증 금지 원칙으로 원 작업 에이전트와 완전히 분리된 독립 계층.',
  body_md: `## 구조

**validator-router**(opus) 가 산출물 유형을 판별해 6개의 전문 감사관에게 팬아웃한다.

- \`doc-validator\` — 문서 형식·톤·한국어 규범
- \`code-validator\` — 문법·테스트·복잡도
- \`fact-checker\` — 사실·인용·레퍼런스
- \`security-auditor\` — OWASP 기반 취약점
- \`consistency-auditor\` — 다중 문서 일관성
- \`spec-compliance\` — 요구사항·SPEC 준수

각 감사관은 독립 프로세스로 실행돼 PASS / WARN / FAIL 등급을 리턴한다.

## 사용법

\`\`\`bash
# 기본 진입점 — 산출물 유형 자동 판별
/verify

# 타입별 진입점
/verify-code   # code + security 병렬
/verify-doc    # doc + fact + consistency 병렬
/verify-deep   # 6개 전원 팬아웃 (최종 점검용)
\`\`\`

프로젝트별 커스텀 규칙은 \`.claude/validators/*.yaml\` 에 DSL 로 정의하면 자동 로드된다.

## 실제 사례

- 하네스 #1 벤처기업협회 전북지회 공문 발송 전 \`/verify-doc\` 통과율 92% → 오타·라벨 누락 0건
- 하네스 #4 프로젝트 두타 배포 전 \`/verify-code\` 로 보안 이슈 4건 사전 차단
- 하네스 #20 범용제안서 최종본 \`/verify-deep\` 로 사실관계 오류 발견 후 수정

## 주의사항

**자가검증 금지**. 원 작업 에이전트가 자기 산출물을 검증하는 것은 커밋 전 스스로 리뷰하는 것과 같아 의미가 없다. 이 하네스는 반드시 외부 레이어로 호출해야 한다.`,
  components: [
    'validator-router',
    'doc-validator',
    'code-validator',
    'fact-checker',
    'security-auditor',
    'consistency-auditor',
    'spec-compliance',
  ],
  persona_job: '누구나 (AX 입문자 대상)',
  status: 'published',
  visibility: 'public',
  published_at: daysAgo(3),
  reaction_counts: { heart: 32, fire: 18, bow: 27, pinch: 14 },
  tags: ['검증', '품질관리', '감사'],
  view_count: 1247,
  thumbnail_emoji: '🔍',
  thumbnail_url: '/characters/verify-harness.png',
  category: 'verify',
  comments: [
    {
      id: 'c-verify-1',
      harness_id: '11111111-1111-1111-1111-111111111111',
      author: { handle: 'soyoung', display_name: '소영', avatar_emoji: '🌸' },
      body: '검증이 형 진심 일 잘하시네… 저희 팀 공문 발송 전 이 하네스 꼭 돌립니다 🔥',
      juzzep_score: 82,
      created_at: daysAgo(2),
    },
    {
      id: 'c-verify-2',
      harness_id: '11111111-1111-1111-1111-111111111111',
      author: { handle: 'minho', display_name: '민호', avatar_emoji: '🧑‍💻' },
      body: '자가검증 금지 원칙 하나로도 이 하네스는 조각이다… 🤌',
      juzzep_score: 88,
      created_at: daysAgo(2),
    },
    {
      id: 'c-verify-3',
      harness_id: '11111111-1111-1111-1111-111111111111',
      author: { handle: 'jihye', display_name: '지혜', avatar_emoji: '📚' },
      body: '6개 감사관이 팬아웃되는 구조 보자마자 이식 허락 받고 싶어짐 🙇',
      juzzep_score: 75,
      created_at: daysAgo(1),
    },
    {
      id: 'c-verify-4',
      harness_id: '11111111-1111-1111-1111-111111111111',
      author: { handle: 'taehyung', display_name: '태형', avatar_emoji: '🛡️' },
      body: '보안감사관 OWASP 기반이라는 거 보고 바로 도입 결정. 감사합니다 진명님 🙇',
      juzzep_score: 69,
      created_at: hoursAgo(18),
    },
  ],
};

// ---------------------------------------------------------------------------
// 2. 범용 개선 하네스
// ---------------------------------------------------------------------------
const improveHarness: SampleHarness = {
  id: '11111111-1111-1111-1111-111111111112',
  post_id: '21111111-1111-1111-1111-111111111112',
  slug: 'improve-harness',
  author_id: SAMPLE_AUTHOR.id,
  title: '범용 개선 하네스',
  tagline: '초안을 몇 번 돌려 퇴고 완성',
  persona_name: '다듬이',
  one_liner:
    "'개선해줘' 한 마디에 문서·코드·구조까지 싹 다 다듬어 다시 돌려주는 리파이너.",
  purpose:
    '초안과 최종본 사이의 지루한 반복을 자동화. 수정 전 `.bak` 백업으로 되돌림 보장, 대규모 변경 시 diff 먼저 보여주고 승인받는 안전 원칙 내장.',
  body_md: `## 구조

**improver-router** 가 산출물 종류를 판별해 전문 개선가에게 위임한다.

- \`doc-improver\` — 가독성·구조·톤 다듬기
- \`code-improver\` — 리팩터링·네이밍·중복 제거
- \`structure-improver\` — 프로젝트 레벨 재배치

개선 전에는 항상 \`.bak\` 으로 원본을 보존하고, 3파일 이상 또는 200라인 이상 변경 시에는 diff 를 먼저 보여주고 사용자 승인을 요청한다.

## 사용법

\`\`\`bash
/improve         # 기본 진입점
/improve-doc     # 문서 전용
/improve-code    # 코드 전용
/improve-deep    # 3에이전트 팬아웃 (전체)
/improve-loop    # improve↔verify 반복 (완성도 맞을 때까지)
\`\`\`

## 실제 사례

- 하네스 #15 사업계획서 초안 → \`/improve-doc\` 3회 돌려 투자자 피드백 반영 완료
- 하네스 #4 두타 서비스 코드 \`/improve-code\` 로 중복 함수 12개 → 3개로 축약
- 하네스 #19 자기 자신을 \`/improve-loop\` 로 검증↔개선 5회 반복 후 정식 릴리즈

## 주의사항

**자가개선 금지**. 원 작업 에이전트가 자기 코드를 개선하면 편향이 생긴다. 반드시 독립 레이어로 호출할 것.`,
  components: [
    'improver-router',
    'doc-improver',
    'code-improver',
    'structure-improver',
  ],
  persona_job: '기획자 · 개발자 · 작가 누구나',
  status: 'published',
  visibility: 'public',
  published_at: daysAgo(5),
  reaction_counts: { heart: 28, fire: 22, bow: 19, pinch: 31 },
  tags: ['개선', '리팩터링', '퇴고'],
  view_count: 892,
  thumbnail_emoji: '✨',
  thumbnail_url: '/characters/improve-harness.png',
  category: 'improve',
  comments: [
    {
      id: 'c-improve-1',
      harness_id: '11111111-1111-1111-1111-111111111112',
      author: { handle: 'yeonjae', display_name: '연재', avatar_emoji: '✍️' },
      body: '이거 제 블로그 초안에 복붙해도 될까요? 🤌 진짜 필요해요…',
      juzzep_score: 73,
      created_at: daysAgo(4),
    },
    {
      id: 'c-improve-2',
      harness_id: '11111111-1111-1111-1111-111111111112',
      author: { handle: 'seohyun', display_name: '서현', avatar_emoji: '🌼' },
      body: '다듬이 얘 진짜 조각이다… `.bak` 백업 해주는 디테일까지 🔥',
      juzzep_score: 91,
      created_at: daysAgo(3),
    },
    {
      id: 'c-improve-3',
      harness_id: '11111111-1111-1111-1111-111111111112',
      author: { handle: 'dongwook', display_name: '동욱', avatar_emoji: '🧑‍🏫' },
      body: 'improve-loop 로 5회 돌린 문서 품질 체감 확 다르네요. 업무 도입했습니다 🙇',
      juzzep_score: 66,
      created_at: daysAgo(1),
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. 범용 제안서 하네스
// ---------------------------------------------------------------------------
const proposalHarness: SampleHarness = {
  id: '11111111-1111-1111-1111-111111111113',
  post_id: '21111111-1111-1111-1111-111111111113',
  slug: 'proposal-harness',
  author_id: SAMPLE_AUTHOR.id,
  title: '범용 제안서 하네스',
  tagline: 'project-info.md만 쓰면 50p 제안서가 튀어나온다',
  persona_name: '프로포잘',
  one_liner:
    '공고문·과업지시서 주면 기획·방법론·수행체계·성과관리 자동 작성.',
  purpose:
    '공공·민간 사업 제안서를 8시간에서 2시간으로 단축. 전북대 AI 제안서 하네스에서 AI 특화 내용을 제거하고 `project-info.md` 치환 구조로 범용화.',
  body_md: `## 구조

**제안서-오케스트레이터** 가 4개 전문가를 순차·병렬로 호출한다.

- \`strategist\` — 사업 기획·방법론·차별화 포인트 설계
- \`performance-manager\` — 성과관리·KPI·리스크 관리 섹션
- \`proposal-reviewer\` — 제안서 전체 검토·보완
- \`content-compressor\` — 페이지 제약 맞춰 축약

사용자는 \`project-info.md\` 에 공고 정보·과업 내용·팀 이력만 채우면 된다.

## 사용법

\`\`\`bash
/제안서-오케스트레이터

# 단위 스킬
/문서작성-규칙    # 포맷 규칙 설정
/수행체계-작성    # 조직·역할·일정
/성과관리-작성    # KPI·리스크
/제안서-검토      # 전체 리뷰
/제안서-축약      # 페이지 맞춤
\`\`\`

## 실제 사례

- 하네스 #3 전북대 AI 제안서 — 이 하네스의 원형. 최초 작성 8시간 → 2시간으로 단축
- 하네스 #15 글로벌트레이딩 사업계획서 — 투자자 피드백 반영 3회 iteration
- 하네스 #24 관광공사 공모전 5p PDF — 제안서 초안 작성 완료 (접수 마감 2026-05-06)

## 주의사항

공고문마다 요구 양식이 다르므로 \`.claude/proposals/{공고명}.yaml\` 에 페이지 제약·필수 섹션을 명시해둘 것.`,
  components: [
    'strategist',
    'performance-manager',
    'proposal-reviewer',
    'content-compressor',
  ],
  persona_job: '사업개발자 · 컨설턴트 · PM',
  status: 'published',
  visibility: 'public',
  published_at: daysAgo(7),
  reaction_counts: { heart: 24, fire: 35, bow: 21, pinch: 17 },
  tags: ['제안서', '공공사업', '자동화'],
  view_count: 1583,
  thumbnail_emoji: '📝',
  thumbnail_url: '/characters/proposal-harness.png',
  category: 'proposal',
  comments: [
    {
      id: 'c-proposal-1',
      harness_id: '11111111-1111-1111-1111-111111111113',
      author: { handle: 'hyunwoo', display_name: '현우', avatar_emoji: '📊' },
      body: '공공사업 제안서 8시간 → 2시간… 이거 저희 팀 도입해야 합니다 🔥🔥',
      juzzep_score: 85,
      created_at: daysAgo(6),
    },
    {
      id: 'c-proposal-2',
      harness_id: '11111111-1111-1111-1111-111111111113',
      author: { handle: 'eunji', display_name: '은지', avatar_emoji: '💼' },
      body: 'project-info.md 치환 구조 설계 보자마자 감탄함… 진심 조각이에요 🤌',
      juzzep_score: 79,
      created_at: daysAgo(5),
    },
    {
      id: 'c-proposal-3',
      harness_id: '11111111-1111-1111-1111-111111111113',
      author: { handle: 'changmin', display_name: '창민', avatar_emoji: '🧑‍💼' },
      body: '전북대 제안서 통과율 보고 왔습니다. 이식 허락해주세요 🙇🙇',
      juzzep_score: 72,
      created_at: daysAgo(3),
    },
    {
      id: 'c-proposal-4',
      harness_id: '11111111-1111-1111-1111-111111111113',
      author: { handle: 'bomi', display_name: '보미', avatar_emoji: '🌷' },
      body: '공고문 받으면 자동으로 양식 맞춰준다는 게 진짜 미쳤네 ❤️',
      juzzep_score: 68,
      created_at: hoursAgo(12),
    },
  ],
};

// ---------------------------------------------------------------------------
// 4. 범용 서비스 개발 백서 하네스
// ---------------------------------------------------------------------------
const serviceDevHarness: SampleHarness = {
  id: '11111111-1111-1111-1111-111111111114',
  post_id: '21111111-1111-1111-1111-111111111114',
  slug: 'service-dev-harness',
  author_id: SAMPLE_AUTHOR.id,
  title: '범용 서비스 개발 백서 하네스',
  tagline: '기획→설계→개발→배포→출시→유지보수→수익화 한 판',
  persona_name: '서비스쟁이',
  one_liner:
    '프로젝트에 주입하면 25개 전문 에이전트가 각 단계를 전담하는 서비스 백서.',
  purpose:
    '하네스가 하네스를 만든다. 우하귀 커뮤니티 자체도 이 하네스로 구축 중이며, 1인 개발자·창업자가 SaaS·커뮤니티·B2B 툴을 0에서 배포까지 갈 수 있게 설계된 통합 자동화 레이어.',
  body_md: `## 구조

**7단계 × 25 에이전트** 로 서비스 라이프사이클을 전담한다.

1. **기획** — \`planner-mvp\` · \`planner-research\` · \`planner-scenario\`
2. **설계** — \`designer-ui\` · \`designer-erd\` · \`designer-api\` · \`designer-arch\`
3. **개발** — \`dev-frontend-web\` · \`dev-backend-api\` · \`dev-db-migration\` · \`dev-integration\`
4. **배포** — \`deploy-edge\` · \`deploy-db\` · \`deploy-ops\`
5. **출시** — \`launch-checklist\` · \`launch-marketing\` · \`launch-support\`
6. **유지보수** — \`maintain-bug\` · \`maintain-feature\` · \`maintain-monitor\`
7. **수익화** — \`money-subscription\` · \`money-ad\` · \`money-b2b\` · \`money-analyst\`

각 에이전트는 단계별 산출물을 \`docs/service-dev/\` 아래 표준 경로에 저장해 다음 단계로 인계한다.

## 사용법

\`\`\`bash
# 프로젝트 루트에서 서비스 백서 주입
/service-dev init

# 단계별 진입
/service-dev plan       # 기획
/service-dev design     # 설계
/service-dev build      # 개발
/service-dev deploy     # 배포
/service-dev launch     # 출시
\`\`\`

## 실제 사례

- **우하귀 커뮤니티 (본 사이트)** — 이 하네스로 구축 중. 기획→ERD→UI→Web 구현까지 3일
- 하네스 #4 두타 SaaS — v10 배포 (~410KB) 완료, CS·결제·쿠폰 통합
- 하네스 #11 안녕가드너 창업 — IoT 제품·체험 예약·브랜딩 한 번에

## 주의사항

25 에이전트 전부 사용 안 해도 된다. \`service-dev.config.yaml\` 에서 필요한 단계만 활성화하고, 나머지는 skip 처리.`,
  components: [
    'planner-mvp',
    'planner-research',
    'planner-scenario',
    'designer-ui',
    'designer-erd',
    'designer-api',
    'designer-arch',
    'dev-frontend-web',
    'dev-backend-api',
    'dev-db-migration',
    'dev-integration',
    'deploy-edge',
    'deploy-db',
    'deploy-ops',
    'launch-checklist',
    'launch-marketing',
    'launch-support',
    'maintain-bug',
    'maintain-feature',
    'maintain-monitor',
    'money-subscription',
    'money-ad',
    'money-b2b',
    'money-analyst',
  ],
  persona_job: '1인 개발자 · 창업자',
  status: 'published',
  visibility: 'public',
  published_at: daysAgo(2),
  reaction_counts: { heart: 41, fire: 38, bow: 33, pinch: 26 },
  tags: ['서비스개발', 'SaaS', '창업'],
  view_count: 2104,
  thumbnail_emoji: '🏗️',
  thumbnail_url: '/characters/service-dev-harness.png',
  category: 'develop',
  comments: [
    {
      id: 'c-service-1',
      harness_id: '11111111-1111-1111-1111-111111111114',
      author: { handle: 'jaeyeon', display_name: '재연', avatar_emoji: '🧑‍🚀' },
      body: '하네스가 하네스를 만든다는 개념… 이 바닥의 zlib 같은 존재 🔥🔥🔥',
      juzzep_score: 94,
      created_at: daysAgo(1),
    },
    {
      id: 'c-service-2',
      harness_id: '11111111-1111-1111-1111-111111111114',
      author: { handle: 'narae', display_name: '나래', avatar_emoji: '🦋' },
      body: '25 에이전트 리스트 처음 봤을 때 손 떨렸어요… 이거 조각이다 🤌',
      juzzep_score: 89,
      created_at: daysAgo(1),
    },
    {
      id: 'c-service-3',
      harness_id: '11111111-1111-1111-1111-111111111114',
      author: { handle: 'minjae', display_name: '민재', avatar_emoji: '🚀' },
      body: '우하귀도 이걸로 만들었다는 거 보고 바로 도입 결정. 감사합니다 🙇',
      juzzep_score: 77,
      created_at: hoursAgo(20),
    },
    {
      id: 'c-service-4',
      harness_id: '11111111-1111-1111-1111-111111111114',
      author: { handle: 'suhyun', display_name: '수현', avatar_emoji: '🌟' },
      body: '1인 개발자한테 진짜 필요한 물건… 내 업무에 이식 허락해주세요 ❤️',
      juzzep_score: 71,
      created_at: hoursAgo(6),
    },
    {
      id: 'c-service-5',
      harness_id: '11111111-1111-1111-1111-111111111114',
      author: { handle: 'chaeeun', display_name: '채은', avatar_emoji: '🎀' },
      body: '서비스쟁이 이 친구 진짜 전천후네요 🔥 7단계 자동 전환 보고 감탄',
      juzzep_score: 64,
      created_at: hoursAgo(3),
    },
  ],
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const SAMPLE_HARNESSES: SampleHarness[] = [
  verifyHarness,
  improveHarness,
  proposalHarness,
  serviceDevHarness,
];

export function getHarnessBySlug(slug: string): SampleHarness | undefined {
  return SAMPLE_HARNESSES.find((h) => h.slug === slug);
}

export const CATEGORY_LABELS: Record<SampleHarness['category'] | 'all', string> = {
  all: '전체',
  verify: '검증',
  improve: '개선',
  proposal: '기획',
  develop: '개발',
};

export function totalReactions(counts: ReactionCounts): number {
  return counts.heart + counts.fire + counts.bow + counts.pinch;
}

export function averageJuzzep(comments: SampleComment[]): number {
  if (comments.length === 0) return 0;
  const sum = comments.reduce((acc, c) => acc + c.juzzep_score, 0);
  return Math.round(sum / comments.length);
}
