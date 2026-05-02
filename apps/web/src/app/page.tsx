/**
 * 랜딩 `/`
 * 근거: docs/service-dev/02_design/ui.md §2-1, 기획안_우하귀.md §1·§5·§7
 *
 * 섹션 구성:
 *  1) Hero — 메인 카피 + CTA 2종 + 바다사자 마스코트
 *  2) 하네스란? — Agent = Model + Harness 정의 + 자동차 비유 3아이콘
 *  3) 타겟 2장 — AI 써야 하는 모두(70%) · 하네스 빌더(30%)
 *  4) Teaser 갤러리 — 범용 검증·개선·서비스 개발 3장
 *  5) 주접 문화 — 보통 커뮤니티 vs 우하귀 댓글 비교
 *  6) Final CTA — "내 하네스 자랑하러 가자"
 */
import Link from 'next/link';
import { HeroLogoCarousel } from '@/components/hero-logo-carousel';
import {
  AnalogyCard,
  TargetCard,
  TeaserCard,
  TEASER_CARDS,
  JuzzepCompare,
  FinalCta,
} from '@/components/landing-sections';

export default function LandingPage() {
  return (
    // layout.tsx의 main 패딩을 상쇄하여 풀폭 섹션 구현
    <div className="-mx-4 -my-8 md:-mx-6 md:-my-12">
      {/* ============================================================ */}
      {/* 1. Hero */}
      {/* ============================================================ */}
      <section
        aria-labelledby="hero-title"
        className="surface-gradient px-4 pt-12 pb-20 md:px-6 md:pt-20 md:pb-28"
      >
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          {/* 좌: 카피 + CTA */}
          <div className="text-center md:text-left">
            <p className="mb-4 inline-flex items-center gap-2 rounded-pill bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200">
              🌊 AI 자동화 진단·실행 SaaS · v2 재구축 진행 중
            </p>
            <h1
              id="hero-title"
              className="text-display text-[38px] leading-[1.15] text-brand-900 md:text-[60px] md:leading-[1.1]"
            >
              AI가 진단하고,
              <br />
              AI가 일한다.
            </h1>
            <p className="mx-auto mt-5 max-w-[460px] text-base text-[color:var(--color-ink-600)] md:mx-0 md:max-w-[520px] md:text-lg md:leading-relaxed">
              30분이면 AI가 당신 일을 알아냅니다.
              <br />
              그다음부턴 Claude·Cursor에서 그 AI가 직접 일합니다.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
              <Link
                href="/interview"
                className="btn-cta w-full sm:w-auto"
                aria-label="무료 진단 시작"
              >
                30분 무료 진단 시작 →
              </Link>
              <Link
                href="/harnesses"
                className="btn-ghost w-full sm:w-auto"
                aria-label="하네스 갤러리 보기"
              >
                하네스 갤러리 보기
              </Link>
            </div>
          </div>

          {/* 우: 우하귀 로고 캐러셀 (11종 시안 10초마다 전환) */}
          <HeroLogoCarousel />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. 하네스란? */}
      {/* ============================================================ */}
      <section
        aria-labelledby="harness-intro-title"
        className="bg-cream-50 px-4 py-16 md:px-6 md:py-24"
      >
        <div className="mx-auto max-w-[960px] text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-500">
            Harness 101
          </p>
          <h2
            id="harness-intro-title"
            className="text-display text-3xl text-brand-900 md:text-[40px]"
          >
            하네스(Harness)가 뭔데?
          </h2>
          <p className="mx-auto mt-5 max-w-[720px] text-base text-[color:var(--color-ink-600)] md:text-lg">
            한 줄로 말하면{' '}
            <span className="whitespace-nowrap font-semibold text-brand-700">
              Agent = Model + Harness
            </span>
            .
            <br className="hidden md:block" />
            LLM을{' '}
            <strong className="font-semibold text-brand-800">실제로 쓸 수 있게 감싸는 소프트웨어 전체</strong>
            를 뜻한다.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
            <AnalogyCard
              icon="🧠"
              title="엔진 = Model"
              body="Claude·GPT·Gemini 같은 LLM 자체. 똑똑하지만 혼자선 도로를 달릴 수 없다."
            />
            <AnalogyCard
              icon="🚗"
              title="차체 = Harness"
              body="도구·메모리·가드레일·검증 루프. 모델을 감싸 실제 일을 하게 만드는 외골격."
            />
            <AnalogyCard
              icon="🧑‍💼"
              title="운전자 = You"
              body="의도와 맥락. 좋은 하네스는 내 일을 내 문법으로 돌아가게 한다."
            />
          </div>

          <div className="mt-10">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
            >
              하네스 11가지 구성요소 자세히 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. 타겟 2장 */}
      {/* ============================================================ */}
      <section
        aria-labelledby="target-title"
        className="bg-brand-50/60 px-4 py-16 md:px-6 md:py-24"
      >
        <div className="mx-auto max-w-[1100px]">
          <h2
            id="target-title"
            className="text-display text-center text-3xl text-brand-900 md:text-[40px]"
          >
            두 사람이 한 공간에서 만난다
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-center text-base text-[color:var(--color-ink-600)] md:text-lg">
            만든 사람과 배우려는 사람 — 서로가 서로에게 가장 필요한 존재.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
            <TargetCard
              badge="핵심 대중 · 70%"
              badgeTone="mint"
              title="AI 써야 하는 모두"
              subtitle="꽃집 사장·교사·마케터·학생·1인 지식노동자"
              lead="업무에 AI 엮는 법을 살아있는 예시로 모방한다."
              bullets={[
                '코드 한 줄 몰라도 스크롤 5초에 판단 가능',
                '꽃집 주문 자동화, 학원 과제 검수 같은 실사례',
                '전문 용어 자동 경고 · 일상 언어로 재설명',
              ]}
            />
            <TargetCard
              badge="시드 공급자 · 30%"
              badgeTone="juzzep"
              title="하네스 빌더"
              subtitle="AI 실무자·에이전트 빌더·노코드 헤비유저"
              lead="실전 시스템 포스팅하고 주접 리액션으로 보상받는다."
              bullets={[
                '내 하네스를 구경하고 피드백할 사람이 생긴다',
                '평가 배틀 · 오늘의 파이프라인 상시 노출',
                '"이 YAML 진짜 조각이다" 식 정서적 보상',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. Teaser 갤러리 */}
      {/* ============================================================ */}
      <section aria-labelledby="teaser-title" className="bg-cream-50 px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-500">
                Today&apos;s Harnesses
              </p>
              <h2
                id="teaser-title"
                className="text-display text-3xl text-brand-900 md:text-[40px]"
              >
                ✨ 오늘의 하네스
              </h2>
            </div>
            <Link
              href="/harnesses"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              갤러리 더 보기 →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3 md:gap-6">
            {TEASER_CARDS.map((card) => (
              <TeaserCard key={card.slug} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. 주접 문화 */}
      {/* ============================================================ */}
      <section
        aria-labelledby="juzzep-title"
        className="bg-brand-50/40 px-4 py-16 md:px-6 md:py-24"
      >
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-juzzep-500">
            우하귀의 말투
          </p>
          <h2 id="juzzep-title" className="text-display text-3xl text-brand-900 md:text-[40px]">
            &quot;건조한 리뷰&quot; 말고 &quot;주접&quot;
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-base text-[color:var(--color-ink-600)] md:text-lg">
            K-밈 대표 양식인 주접 문화를 기술 디테일과 합친다. 낙차에서 재미가, 과잉 애정에서 정서적 보상이 나온다.
          </p>
          <JuzzepCompare />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. Final CTA */}
      {/* ============================================================ */}
      <FinalCta />
    </div>
  );
}
