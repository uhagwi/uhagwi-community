'use client';

/**
 * HarnessForm 의 실제 입력 필드들 (본 폼은 부모에서 useState 들고 흘려준다).
 * 분리 이유: 메인 폼 파일의 250라인 제한 준수.
 */
import { Field, type Category, CATEGORY_OPTIONS } from './harness-form-fields';

const INPUT_CLASS =
  'w-full rounded-[10px] border border-[color:var(--color-ink-300)] bg-white px-4 py-2';

export function TextInputs(props: {
  title: string;
  setTitle: (v: string) => void;
  oneLiner: string;
  setOneLiner: (v: string) => void;
  personaName: string;
  setPersonaName: (v: string) => void;
  personaJob: string;
  setPersonaJob: (v: string) => void;
  errors: Partial<Record<string, string>>;
  busy: boolean;
}) {
  const { title, setTitle, oneLiner, setOneLiner, personaName, setPersonaName, personaJob, setPersonaJob, errors, busy } = props;
  return (
    <>
      <Field
        label="제목"
        required
        htmlFor="hf-title"
        error={errors['title']}
        hint={`${title.length}/120`}
      >
        <input
          id="hf-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 120))}
          maxLength={120}
          aria-invalid={errors['title'] ? true : undefined}
          aria-describedby={errors['title'] ? 'hf-title-err' : undefined}
          className={INPUT_CLASS}
          placeholder="예: 주말-이메일-정리이"
          disabled={busy}
          required
        />
      </Field>

      <Field
        label="한줄요약"
        required
        htmlFor="hf-one"
        error={errors['one_liner']}
        hint={`${oneLiner.length}/200`}
      >
        <input
          id="hf-one"
          type="text"
          value={oneLiner}
          onChange={(e) => setOneLiner(e.target.value.slice(0, 200))}
          maxLength={200}
          aria-invalid={errors['one_liner'] ? true : undefined}
          className={INPUT_CLASS}
          placeholder="우리 하네스가 뭐 하는 애예요?"
          disabled={busy}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="페르소나 이름 (선택)" htmlFor="hf-pname" error={errors['persona_name']}>
          <input
            id="hf-pname"
            type="text"
            value={personaName}
            onChange={(e) => setPersonaName(e.target.value.slice(0, 40))}
            maxLength={40}
            className={INPUT_CLASS}
            placeholder="예: 주문이"
            disabled={busy}
          />
        </Field>
        <Field label="페르소나 직업 (선택)" htmlFor="hf-pjob" error={errors['persona_job']}>
          <input
            id="hf-pjob"
            type="text"
            value={personaJob}
            onChange={(e) => setPersonaJob(e.target.value.slice(0, 40))}
            maxLength={40}
            className={INPUT_CLASS}
            placeholder="예: 꽃집 사장"
            disabled={busy}
          />
        </Field>
      </div>
    </>
  );
}

export function BodyInputs(props: {
  purpose: string;
  setPurpose: (v: string) => void;
  bodyMd: string;
  setBodyMd: (v: string) => void;
  componentsRaw: string;
  setComponentsRaw: (v: string) => void;
  category: Category;
  setCategory: (v: Category) => void;
  tagsRaw: string;
  setTagsRaw: (v: string) => void;
  errors: Partial<Record<string, string>>;
  busy: boolean;
}) {
  const { purpose, setPurpose, bodyMd, setBodyMd, componentsRaw, setComponentsRaw, category, setCategory, tagsRaw, setTagsRaw, errors, busy } = props;
  return (
    <>
      <Field
        label="목적·배경"
        required
        htmlFor="hf-purpose"
        error={errors['purpose']}
        hint={`${purpose.length}/2000`}
      >
        <textarea
          id="hf-purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value.slice(0, 2000))}
          maxLength={2000}
          rows={4}
          aria-invalid={errors['purpose'] ? true : undefined}
          className={INPUT_CLASS}
          placeholder="이 하네스가 어떤 문제를 풀어요?"
          disabled={busy}
          required
        />
      </Field>

      <Field
        label="본문 (Markdown 지원)"
        htmlFor="hf-body"
        error={errors['body_md']}
        hint={`${bodyMd.length}/20000`}
      >
        <textarea
          id="hf-body"
          value={bodyMd}
          onChange={(e) => setBodyMd(e.target.value.slice(0, 20000))}
          maxLength={20000}
          rows={8}
          className={`${INPUT_CLASS} font-mono text-sm`}
          placeholder={'## 사용 시나리오\n- 매주 금요일 오전 9시 메일 정리\n\n## 프롬프트\n```\n...\n```'}
          disabled={busy}
        />
      </Field>

      <Field
        label="구성요소 (콤마 구분, 최대 20개)"
        htmlFor="hf-components"
        hint="예: Tools, Memory, Prompt, Context"
      >
        <input
          id="hf-components"
          type="text"
          value={componentsRaw}
          onChange={(e) => setComponentsRaw(e.target.value)}
          className={INPUT_CLASS}
          placeholder="Tools, Memory, Prompt"
          disabled={busy}
        />
      </Field>

      <Field label="카테고리" htmlFor="hf-cat">
        <select
          id="hf-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className={INPUT_CLASS}
          disabled={busy}
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="태그 (콤마 구분, 최대 8개)"
        htmlFor="hf-tags"
        hint="예: 자동화, 마케팅, 클로드"
      >
        <input
          id="hf-tags"
          type="text"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          className={INPUT_CLASS}
          placeholder="자동화, 클로드, n8n"
          disabled={busy}
        />
      </Field>
    </>
  );
}
