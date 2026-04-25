/**
 * About `/about` — 하네스란? · 우하귀는? · 로드맵
 * 근거: 기획안_우하귀.md §1-A, 도전신청서_작성본.md Q2~Q4, ui.md §2-1
 *
 * 공고 심사자도 읽을 수 있도록 전문용어에 풀이를 덧붙이고
 * 11가지 구성요소는 표로 정리한다.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — 우하귀는 어떤 커뮤니티?',
  description:
    'Agent = Model + Harness. 우하귀는 AI 하네스를 자랑하고 주접 받으며 배우는 모두의 커뮤니티입니다.',
};

// 하네스 11가지 구성요소 — 기획안 §1-A-4 표준 해부도
const HARNESS_ELEMENTS = [
  ['Orchestration Loop', '생각→행동→관찰(ReAct) 반복 · 에이전트의 중추'],
  ['Tools', '외부 함수·API 연결 = 에이전트의 "손"'],
  ['Memory', '단기(세션) + 장기(세션 간 지속) 기억 체계'],
  ['Context Management', '요약·마스킹·동적 로딩으로 context rot 방지'],
  ['Prompt Construction', '시스템·도구·메모리·대화이력 조립'],
  ['Output Parsing', 'tool_calls 구조화, Pydantic 스키마 제약'],
  ['State Management', '체크포인트·재개·시간여행 디버깅'],
  ['Error Handling', '일시적·LLM 복구·사용자 개입·예외 4분류'],
  ['Guardrails & Safety', '입력·출력·도구 호출 3단 검증 + tripwire'],
  ['Verification Loops', '규칙(린터)·시각(스크린샷)·LLM 심판 — 품질 2~3배↑'],
  ['Subagent Orchestration', 'Fork / Teammate / Worktree 다중 협업'],
] as const;

// 로드맵 — 기획안 §12
const ROADMAP = [
  {
    phase: 'Phase 0',
    window: '2026.05 ~ 06',
    title: '시드 런치 (Discord MVP)',
    bullets: [
      '하네스 23종 시드 콘텐츠 업로드',
      '일반인 · 실무자 혼합 시드 멤버 30명',
      '운영자가 직접 주접 톤 시연 → 문화 DNA 심기',
    ],
  },
  {
    phase: 'Phase 1',
    window: '2026.07 ~ 10',
    title: '웹 플랫폼 오픈',
    bullets: [
      '하네스 갤러리 + 주접 댓글 + 원클릭 이식',
      '"우리 동네 하네스" 직업별 필터 런칭',
      'PMF 측정 · WAU/DAU · 주접 어휘 5개 정착',
    ],
  },
  {
    phase: 'Phase 2',
    window: '2026.11 ~ 2027.04',
    title: '확산',
    bullets: [
      '노코드 하네스 템플릿 마켓 오픈',
      '기업용 사내 하네스 공유방 SaaS 출시',
      '오프라인 밋업 + 주접 어휘 사전 출간',
    ],
  },
] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[960px] space-y-20 py-4 md:py-8">
      {/* 헤더 */}
      <header className="text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-500">
          About Uhagwi
        </p>
        <h1 className="text-display text-4xl leading-tight text-brand-900 md:text-[56px]">
          우하귀는
          <br className="md:hidden" /> 어떤 곳인가요?
        </h1>
        <p className="mx-auto mt-5 max-w-[640px] text-base text-[color:var(--color-ink-600)] md:text-lg">
          AI 하네스를 자랑하고 주접 받으며 배우는, 누구나 AX·DX 전환을 함께하는 모두의 커뮤니티입니다.
        </p>
      </header>

      {/* ① 우하귀는? */}
      <section aria-labelledby="s1" className="space-y-4">
        <h2 id="s1" className="text-display text-2xl text-brand-900 md:text-3xl">
          ① 우하귀는 한 줄로?
        </h2>
        <div className="card space-y-3 text-base leading-relaxed md:p-6 md:text-lg">
          <p className="font-medium text-brand-800">
            &ldquo;내 AI 하네스 자랑하고 주접 받으며 배우는, 누구나 AX·DX 전환을 함께하는 모두의 커뮤니티.&rdquo;
          </p>
          <p className="text-[color:var(--color-ink-600)]">
            만든 사람은 자랑할 곳이 필요하고, 배우려는 사람은 따라 할 살아있는 구조가
            필요합니다. 우하귀는 두 집단을 한 공간에 두고, K-밈의 주접 문화를 축으로 삼아
            기술 디테일을 애정 언어로 흐르게 만듭니다.
          </p>
        </div>
      </section>

      {/* ② 하네스 11요소 */}
      <section aria-labelledby="s2" className="space-y-4">
        <h2 id="s2" className="text-display text-2xl text-brand-900 md:text-3xl">
          ② 하네스의 11가지 구성요소
        </h2>
        <p className="text-base text-[color:var(--color-ink-600)]">
          우하귀에 올라오는 모든 포스팅은 아래 11요소 중 어느 것을 썼는지 태그합니다.
          모델 바깥의 &ldquo;감싸는 것&rdquo;이 전부 여기에 들어갑니다.
        </p>
        <div className="card overflow-hidden p-0 md:p-0">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-brand-50 text-left text-brand-800">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold md:px-5">
                  요소
                </th>
                <th scope="col" className="px-4 py-3 font-semibold md:px-5">
                  한 줄 역할
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-ink-300)]/40">
              {HARNESS_ELEMENTS.map(([name, role]) => (
                <tr key={name} className="transition hover:bg-cream-100/50">
                  <td className="px-4 py-3 font-semibold text-brand-900 md:px-5">{name}</td>
                  <td className="px-4 py-3 text-[color:var(--color-ink-600)] md:px-5">{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ③ 왜 지금인가 */}
      <section aria-labelledby="s3" className="space-y-4">
        <h2 id="s3" className="text-display text-2xl text-brand-900 md:text-3xl">
          ③ 왜 지금인가?
        </h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="card md:p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              2023 — 프롬프트 엔지니어링
            </p>
            <p className="mt-2 text-base text-[color:var(--color-ink-900)]">
              &ldquo;좋은 프롬프트 한 줄&rdquo;로 모델을 달래는 시대. 개인 팁 수준의 콘텐츠가 주류.
            </p>
          </div>
          <div className="card border-2 border-brand-300 md:p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-juzzep-500">
              2026 — 하네스 엔지니어링
            </p>
            <p className="mt-2 text-base text-[color:var(--color-ink-900)]">
              모델을 감싸는 인프라 전체를 설계하는 시대. 실제 작동하는 시스템이 곧 자산이다.
            </p>
          </div>
        </div>
        <p className="text-base leading-relaxed text-[color:var(--color-ink-600)]">
          Anthropic 실험이 이를 증명합니다. 동일 모델·동일 프롬프트로, 하네스 없이는 20분·$9에
          핵심 기능이 작동하지 않았고, 풀 하네스를 두르자 6시간·$200 만에 완전 동작 앱이 완성됐습니다.
          <strong className="font-semibold text-brand-800"> 하네스 없는 구현은 &ldquo;부족한&rdquo; 게 아니라 &ldquo;근본적으로 깨진&rdquo; 결과</strong>를 냅니다.
        </p>
      </section>

      {/* ④ 창립자 */}
      <section aria-labelledby="s4" className="space-y-4">
        <h2 id="s4" className="text-display text-2xl text-brand-900 md:text-3xl">
          ④ 창립자
        </h2>
        <div className="card flex flex-col gap-4 md:flex-row md:items-center md:gap-8 md:p-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-100 text-display text-3xl text-brand-800">
            진
          </div>
          <div className="space-y-1.5">
            <p className="text-display text-xl text-brand-900 md:text-2xl">이진명</p>
            <p className="text-sm text-[color:var(--color-ink-600)]">
              AI 하네스 엔지니어 · 전북 기반 1인 개발자
            </p>
            <p className="text-sm leading-relaxed text-[color:var(--color-ink-900)]">
              하네스 <strong className="text-brand-700">23종</strong>을 직접 설계·운영 중.
              &ldquo;잘 만들어도 자랑할 곳이 없는&rdquo; 불균형을 직접 겪고 우하귀를 창안했습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ⑤ 로드맵 */}
      <section aria-labelledby="s5" className="space-y-4">
        <h2 id="s5" className="text-display text-2xl text-brand-900 md:text-3xl">
          ⑤ 로드맵 · 1년 목표
        </h2>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {ROADMAP.map((p) => (
            <article key={p.phase} className="card md:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-juzzep-500">
                {p.phase} · {p.window}
              </p>
              <h3 className="text-display mt-2 text-xl text-brand-900">{p.title}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-[color:var(--color-ink-900)]">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span aria-hidden="true" className="text-mint-500">
                      ✓
                    </span>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="card mt-6 bg-brand-50/70 md:p-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            1년차 KPI
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {[
              ['MAU', '5,000명'],
              ['일반인 비중', '70%↑'],
              ['등록 하네스', '1,000종'],
              ['이식 전환', '3,000건'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-[color:var(--color-ink-600)]">{k}</p>
                <p className="text-display text-xl text-brand-800 md:text-2xl">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link href="#" className="btn-cta">
          Discord 서버 입장하기 →
        </Link>
        <p className="mt-4 text-sm text-[color:var(--color-ink-600)]">
          Phase 0 시드 멤버를 모집 중입니다.
        </p>
      </section>
    </div>
  );
}
