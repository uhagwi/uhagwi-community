'use client';

/**
 * 하네스 작성 폼 (클라이언트 컴포넌트)
 * 근거: docs/service-dev/02_design/ui.md §2-4 작성 위저드 단순화 (1-step)
 *
 * - Zod 클라이언트 검증 (서버와 동일 규칙)
 * - submit 시 fetch POST /api/harnesses → 성공: router.push(url)
 * - 콤마 구분 입력 → array (components, tags)
 * - aria-invalid · 명시 label · 글자수 카운터
 *
 * 보조 컴포넌트:
 *   - ./harness-form-fields    : Field, Spinner, VisibilityRadios, splitCsv
 *   - ./harness-form-inputs    : TextInputs, BodyInputs
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
  Spinner,
  VisibilityRadios,
  splitCsv,
  type Category,
  type Visibility,
} from './harness-form-fields';
import { TextInputs, BodyInputs } from './harness-form-inputs';

const FormSchema = z.object({
  title: z.string().min(2, '제목은 2자 이상이어야 해요.').max(120),
  one_liner: z.string().min(1, '한줄요약은 필수예요.').max(200),
  persona_name: z.string().max(40).optional(),
  persona_job: z.string().max(40).optional(),
  purpose: z.string().min(1, '목적은 필수예요.').max(2000),
  body_md: z.string().max(20000).optional(),
  category: z.enum(['verify', 'improve', 'proposal', 'develop', 'other']),
  visibility: z.enum(['public', 'link', 'private']),
});

type FieldErrors = Partial<Record<string, string>>;

export function HarnessForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [title, setTitle] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [personaName, setPersonaName] = useState('');
  const [personaJob, setPersonaJob] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [componentsRaw, setComponentsRaw] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [visibility, setVisibility] = useState<Visibility>('public');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const formValues = {
      title: title.trim(),
      one_liner: oneLiner.trim(),
      persona_name: personaName.trim() || undefined,
      persona_job: personaJob.trim() || undefined,
      purpose: purpose.trim(),
      body_md: bodyMd.trim() || undefined,
      category,
      visibility,
    };

    const parsed = FormSchema.safeParse(formValues);
    if (!parsed.success) {
      const fe: FieldErrors = {};
      for (const issue of parsed.error.errors) {
        const key = issue.path.join('.');
        if (!fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }

    const components = splitCsv(componentsRaw, 20);
    const tags = splitCsv(tagsRaw, 8);

    setSubmitting(true);
    try {
      const res = await fetch('/api/harnesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, components, tags }),
      });
      if (!res.ok) {
        let detail = `요청 실패 (${res.status})`;
        try {
          const j = (await res.json()) as {
            detail?: string;
            errors?: { field: string; message: string }[];
          };
          if (j.detail) detail = j.detail;
          if (j.errors?.length) {
            const fe: FieldErrors = {};
            for (const er of j.errors) fe[er.field] = er.message;
            setErrors(fe);
          }
        } catch {
          /* json 파싱 실패는 무시 */
        }
        setServerError(detail);
        setSubmitting(false);
        return;
      }
      const json = (await res.json()) as { url?: string; slug?: string };
      const next = json.url ?? (json.slug ? `/harnesses/${json.slug}` : '/harnesses');
      startTransition(() => {
        router.push(next);
        router.refresh();
      });
    } catch (err) {
      setServerError(
        err instanceof Error ? `네트워크 오류: ${err.message}` : '네트워크 오류',
      );
      setSubmitting(false);
    }
  }

  const busy = submitting || isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="card space-y-5"
      aria-label="하네스 작성 폼"
      noValidate
    >
      <TextInputs
        title={title}
        setTitle={setTitle}
        oneLiner={oneLiner}
        setOneLiner={setOneLiner}
        personaName={personaName}
        setPersonaName={setPersonaName}
        personaJob={personaJob}
        setPersonaJob={setPersonaJob}
        errors={errors}
        busy={busy}
      />
      <BodyInputs
        purpose={purpose}
        setPurpose={setPurpose}
        bodyMd={bodyMd}
        setBodyMd={setBodyMd}
        componentsRaw={componentsRaw}
        setComponentsRaw={setComponentsRaw}
        category={category}
        setCategory={setCategory}
        tagsRaw={tagsRaw}
        setTagsRaw={setTagsRaw}
        errors={errors}
        busy={busy}
      />
      <VisibilityRadios value={visibility} onChange={setVisibility} disabled={busy} />

      {serverError ? (
        <div
          role="alert"
          className="rounded-[10px] border border-[color:var(--color-danger)] bg-red-50 px-4 py-3 text-sm text-[color:var(--color-danger)]"
        >
          {serverError}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => router.back()}
          disabled={busy}
        >
          취소
        </button>
        <button type="submit" className="btn-primary" disabled={busy} aria-busy={busy}>
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> 게시 중…
            </span>
          ) : (
            '게시하기'
          )}
        </button>
      </div>
    </form>
  );
}
