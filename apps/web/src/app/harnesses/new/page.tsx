/**
 * 포스팅 작성 `/harnesses/new` — 3-step Wizard
 * 근거: docs/service-dev/02_design/ui.md §2-4
 *
 * Step1 기본: 제목 / 의인화 이름(선택) / 한줄요약 / 직업·상황 / 태그
 * Step2 구조: 목적(일상언어) / 구조도(Mermaid) / 11요소 체크 / 프롬프트 스니펫
 * Step3 결과: 미디어 업로드 / 공개범위 / Discord 동시게시 / 전문용어 가드레일
 *
 * TODO: 구현 — ui.md §2-4 와이어프레임 참조
 *   - 인증 체크: auth() 없으면 /login?redirect=/harnesses/new
 *   - 단계 상태: URL 쿼리 ?step=1|2|3 (뒤로가기 대응)
 *   - 저장 API: POST /api/v1/harness (draft) → PATCH /api/v1/harness/:id (publish)
 */
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const metadata = {
  title: '하네스 포스팅',
  description: '내 하네스를 자랑해 보세요',
};

export default async function NewHarnessPage() {
  const session = await auth();
  if (!session) {
    redirect('/login?redirect=/harnesses/new');
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-brand-900 md:text-3xl">🌊 하네스 포스팅</h1>
        <p className="text-[color:var(--color-ink-600)]">
          3단계로 우리 하네스 소개해 봐요. 초안은 자동 저장돼요.
        </p>
      </header>

      {/* 스텝 인디케이터 */}
      <ol aria-label="작성 단계" className="flex items-center gap-2 text-sm">
        {[
          { n: 1, label: '기본' },
          { n: 2, label: '구조' },
          { n: 3, label: '결과' },
        ].map((s, i, arr) => (
          <li key={s.n} className="flex items-center gap-2">
            <span
              aria-current={s.n === 1 ? 'step' : undefined}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 font-bold text-white"
            >
              {s.n}
            </span>
            <span className="text-[color:var(--color-ink-900)]">{s.label}</span>
            {i < arr.length - 1 && <span aria-hidden="true">→</span>}
          </li>
        ))}
      </ol>

      {/* Step1 폼 placeholder */}
      <form className="card space-y-4" aria-label="Step 1 기본 정보" noValidate>
        {/* TODO: 구현 — zod 스키마 + Server Action */}
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-brand-800">제목 *</span>
          <input
            type="text"
            name="title"
            disabled
            className="w-full rounded-[10px] border border-[color:var(--color-ink-300)] bg-white px-4 py-2 disabled:opacity-60"
            placeholder="예: 주말-이메일-정리이"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-brand-800">의인화 이름 (선택)</span>
          <input
            type="text"
            name="persona_name"
            disabled
            className="w-full rounded-[10px] border border-[color:var(--color-ink-300)] bg-white px-4 py-2 disabled:opacity-60"
            placeholder="예: 주문이"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-brand-800">한줄요약 *</span>
          <input
            type="text"
            name="one_liner"
            disabled
            className="w-full rounded-[10px] border border-[color:var(--color-ink-300)] bg-white px-4 py-2 disabled:opacity-60"
            placeholder="우리 하네스가 뭐 하는 애예요?"
          />
        </label>
        <div className="flex justify-between pt-4">
          <button type="button" className="btn-ghost" disabled>
            ← 이전
          </button>
          <button type="button" className="btn-primary" disabled>
            다음 →
          </button>
        </div>
      </form>
    </div>
  );
}
