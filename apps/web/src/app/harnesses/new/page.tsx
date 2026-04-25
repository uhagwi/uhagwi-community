/**
 * 포스팅 작성 `/harnesses/new`
 * 근거: docs/service-dev/02_design/ui.md §2-4
 *
 * 흐름:
 *   1) 서버에서 auth() 검사 — 미인증이면 /login?redirect=/harnesses/new
 *   2) 클라이언트 폼(HarnessForm) 렌더 — submit 시 POST /api/harnesses
 *
 * 위저드(3-step)는 Phase 2로 미루고 단일 폼으로 출시 (요청서 지시).
 */
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { HarnessForm } from '@/components/harness-form';

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
          한 화면에 다 담았어요. 본문은 Markdown 으로 자유롭게 적어 주세요.
        </p>
      </header>

      <HarnessForm />

      <p className="text-center text-xs text-[color:var(--color-ink-600)]">
        * 게시 즉시 갤러리에 올라가요. 비공개를 선택하면 나만 볼 수 있어요.
      </p>
    </div>
  );
}
