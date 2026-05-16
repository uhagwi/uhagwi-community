/**
 * Showcase 시드 — 범용 기능 데모 6장.
 * Supabase 미연결·0건 상태에서 갤러리/상세가 비어보이지 않도록 fallback.
 *
 * 정책: 특정 기관·인물·지역·제품명을 노출하지 않고 "무슨 기능인지"만 보여준다.
 * (intimate-context.ts 친밀 맥락 가드와 동일 방향 — 공개 갤러리에 고유명 금지)
 *
 * 클릭 시 /harnesses/<slug> 상세도 같은 데이터로 렌더 (findSeedBySlug).
 * DB row가 들어오면 자동으로 우선권을 가짐 (page.tsx에서 length 체크).
 */
import type { HarnessDetailRow, HarnessFeedRow } from '@/lib/db/harnesses';

const AUTHOR = {
  id: 'seed-demo',
  handle: 'demo',
  display_name: '우하귀 데모',
  avatar_url: null,
} as const;

type Seed = HarnessDetailRow;

const SHOWCASE: readonly Seed[] = [
  {
    id: 'seed-membership-ops',
    slug: 'membership-org-ops',
    title: '회원 단체 사무국 운영 자동화',
    one_liner:
      '회원 명부·정기 보고·회계 분개를 한 줄 명령으로. 매주 반복되는 정기 보고서를 사람이 안 쓴다.',
    purpose:
      '회원 기반 조직(협회·조합·학회 등)의 사무국이 명부 관리·행사·회계를 매번 수기로 정리하던 일을 단일 오케스트레이터로 묶어, "보고 작성"이라는 행위 자체를 사라지게 한다.',
    persona_name: '사무국 매니저',
    persona_job: '회원 단체 사무국 운영',
    thumbnail_url: null,
    thumbnail_emoji: '🗂',
    category: 'develop',
    components: ['프롬프트', '메모리', '명부 도구', '회계 분기', '검증 루프'],
    view_count: 412,
    avg_juzzep: 78,
    reaction_counts: { heart: 24, fire: 11, bow: 9, pinch: 6 },
    author: AUTHOR,
    tags: ['회원관리', '사무행정', '정기보고'],
    published_at: '2026-04-22T09:00:00+09:00',
    created_at: '2026-04-22T09:00:00+09:00',
    body_md:
      '## 한 줄 그림\n\n`회원 DB → 정기 브리핑 → 분기(회계/문서/명부) → 보고 채널`\n\n## 일상 언어로\n\n매주 정해진 요일 아침마다 회원 변동·회계 분개·이번 주 행사 목록을 정리해서 운영 채널에 올려준다. 사람이 빠진 칸만 채우면 끝.',
  },
  {
    id: 'seed-meditation',
    slug: 'meditation-companion',
    title: 'AI 명상 동행 앱',
    one_liner:
      '명상 세션을 AI가 곁에서 안내·기록·회고. 하루 한 번 침묵에 들어가는 의식이 되도록 설계한 페르소나.',
    purpose:
      '명상 앱이 "기능"으로 끝나지 않고 "관계"가 되도록, 어제의 호흡·오늘의 감정·내일의 의도를 잇는 동행 페르소나를 설계한다.',
    persona_name: '명상 가이드',
    persona_job: 'AI 명상 동행 페르소나',
    thumbnail_url: null,
    thumbnail_emoji: '🧘',
    category: 'develop',
    components: ['페르소나 시스템 프롬프트', '장기 기억', '톤 가드레일', '음성 출력'],
    view_count: 1187,
    avg_juzzep: 92,
    reaction_counts: { heart: 88, fire: 41, bow: 22, pinch: 14 },
    author: AUTHOR,
    tags: ['AI앱', '명상', '페르소나'],
    published_at: '2026-03-30T20:30:00+09:00',
    created_at: '2026-03-30T20:30:00+09:00',
    body_md:
      '## 한 줄 그림\n\n`사용자 의도 → 동행 페르소나 → 명상 스크립트 → 회고 저장 → 다음날 호출`\n\n## 일상 언어로\n\n앱을 열면 어제 한 명상이 한 줄로 떠 있고, 가이드가 "오늘은 어디서 멈췄어?"부터 묻는다. 응답을 받아 가이드 세션을 만들고 끝나면 자동 회고를 남긴다.',
  },
  {
    id: 'seed-tip-curator',
    slug: 'channel-tip-curator',
    title: '채널 콘텐츠 큐레이션 자동화',
    one_liner:
      '메신저 채널 메시지를 주기마다 신선도·희소성·근거 3축으로 점수화 → 문서·노트·웹 3채널 자동 배포.',
    purpose:
      '커뮤니티 채널의 "스쳐 지나가는 팁"을 자동으로 모아 다채널 자산으로 적립한다. 사람이 큐레이션하지 않는다.',
    persona_name: '큐레이터',
    persona_job: '콘텐츠 큐레이션 자동화',
    thumbnail_url: null,
    thumbnail_emoji: '💡',
    category: 'improve',
    components: ['채널 수확기', '3축 점수기', '요약기', '다채널 배포기', '주기 루프'],
    view_count: 856,
    avg_juzzep: 85,
    reaction_counts: { heart: 47, fire: 33, bow: 12, pinch: 21 },
    author: AUTHOR,
    tags: ['큐레이션', '콘텐츠', '자동화'],
    published_at: '2026-05-08T11:00:00+09:00',
    created_at: '2026-05-08T11:00:00+09:00',
    body_md:
      '## 한 줄 그림\n\n`채널 수확 → 분류 → 점수(40·30·30) → 요약 → 문서/노트/웹`\n\n## 일상 언어로\n\n채널에 떠다니는 팁을 주기마다 수집해서 신선한지·드문지·근거 있는지 점수를 매기고, 상위만 정리해서 세 곳에 동시에 올린다. 사람이 안 봐도 자산이 쌓인다.',
  },
  {
    id: 'seed-campaign',
    slug: 'campaign-ops',
    title: '선거 캠프 운영 자동화',
    one_liner:
      '후보 일정·SNS 콘텐츠·후원 회계·선거법 검증을 한 줄 명령으로 묶었다. 본진 + 자원봉사 통합 라우팅.',
    purpose:
      '후보 본인 명의 활동과 자원봉사 활동을 분리하면서도 같은 메시지·같은 일정 위에서 움직이게 한다. 선거법 위반 위험은 자동 점검으로 사전 차단.',
    persona_name: '캠페인 매니저',
    persona_job: '선거 캠프 운영',
    thumbnail_url: null,
    thumbnail_emoji: '🗳',
    category: 'proposal',
    components: ['일정 라우터', 'SNS 발행기', '회계 분기', '선거법 검증 게이트'],
    view_count: 234,
    avg_juzzep: 73,
    reaction_counts: { heart: 18, fire: 9, bow: 7, pinch: 4 },
    author: AUTHOR,
    tags: ['캠페인', '일정관리', '컴플라이언스'],
    published_at: '2026-04-10T18:00:00+09:00',
    created_at: '2026-04-10T18:00:00+09:00',
    body_md:
      '## 한 줄 그림\n\n`후보 입력 → (본진 ⊕ 자원봉사 SNS) → 선거법 검증 → 발행/전송`\n\n## 일상 언어로\n\n후보 한 명이 한 말을 본진과 자원봉사 양쪽 채널에 맞는 톤으로 분기하고, 발행 전에 선거법 위반 신호를 자동으로 잡아낸다.',
  },
  {
    id: 'seed-self-awareness',
    slug: 'self-awareness-game',
    title: '자기 인식 코칭 게임',
    one_liner:
      '하루의 한 장면을 게임 메타포로 라벨링. 데일리 기록·주간 회고·캐릭터 시트로 자기 인식을 게임화.',
    purpose:
      '"오늘 무엇을 배웠고 무엇을 안고 가는가"를 일상 단위로 라벨링하고, 주간/월간 검토를 통해 자기 자신과의 관계를 게임처럼 가볍게 다룬다.',
    persona_name: '인식 안내자',
    persona_job: '자기 인식 코칭',
    thumbnail_url: null,
    thumbnail_emoji: '🌌',
    category: 'verify',
    components: ['캐릭터 빌더', '데일리 라벨링', '주간 회고', '리프레이밍', '인벤토리'],
    view_count: 562,
    avg_juzzep: 89,
    reaction_counts: { heart: 53, fire: 18, bow: 31, pinch: 9 },
    author: AUTHOR,
    tags: ['자기인식', '게임화', '코칭'],
    published_at: '2026-05-15T10:00:00+09:00',
    created_at: '2026-05-15T10:00:00+09:00',
    body_md:
      '## 한 줄 그림\n\n`오늘의 한 장면 → 라벨링 → 인벤토리 → 주간 회고 → 시트 갱신`\n\n## 일상 언어로\n\n오늘 있었던 한 장면을 두 관점으로 나눠 기록하고, 주말마다 가상의 검토자에게 점검받는다. 게임처럼 가볍게.',
  },
  {
    id: 'seed-closed-loop',
    slug: 'closed-loop-designer',
    title: '닫힌 루프 자동화 설계기',
    one_liner:
      '"이거 자동으로 돌게 해줘" 한마디에 상태머신·LLM 노드·게이트·실패 모드까지 4종 청사진을 뽑아낸다.',
    purpose:
      '자동화 작업을 만들기 전에 "어디가 결정적이고 어디가 LLM 판단인지"를 명확히 분리한 청사진을 먼저 뽑아, 만들고 나서 후회하지 않게 한다.',
    persona_name: '설계자',
    persona_job: '자동화 청사진 작성',
    thumbnail_url: null,
    thumbnail_emoji: '🔄',
    category: 'develop',
    components: ['스펙 인터뷰', '상태머신 설계', 'LLM 노드 설계', '품질 게이트', 'FMEA'],
    view_count: 318,
    avg_juzzep: 81,
    reaction_counts: { heart: 22, fire: 17, bow: 8, pinch: 11 },
    author: AUTHOR,
    tags: ['메타', '자동화', '설계'],
    published_at: '2026-05-12T14:00:00+09:00',
    created_at: '2026-05-12T14:00:00+09:00',
    body_md:
      '## 한 줄 그림\n\n`스펙 인터뷰 → 상태머신 → LLM 노드 → 게이트 → FMEA → 청사진 4종`\n\n## 일상 언어로\n\n자동화하고 싶은 작업을 12가지 질문으로 받아낸 뒤, 그림 한 장(Mermaid)·코드 뼈대·운영 매뉴얼·실패 대응표를 한 번에 만들어준다.',
  },
] as const;

/** 갤러리 fallback — DB 0건일 때 사용 */
export function getSeedFeedRows(): HarnessFeedRow[] {
  return SHOWCASE.map(({ body_md: _b, purpose: _p, ...feed }) => feed);
}

/** 상세 fallback — DB miss 시 slug 조회 */
export function findSeedBySlug(slug: string): HarnessDetailRow | null {
  return SHOWCASE.find((s) => s.slug === slug) ?? null;
}
