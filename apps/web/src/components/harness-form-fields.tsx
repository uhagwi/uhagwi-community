'use client';

/**
 * 하네스 폼용 보조 컴포넌트 묶음
 *  - Field: label · hint · error 래퍼
 *  - Spinner: 제출 중 인디케이터
 *  - VisibilityRadios: 공개 범위 라디오 그룹
 *  - 옵션 상수 (CATEGORY_OPTIONS · VISIBILITY_OPTIONS)
 */

export type Visibility = 'public' | 'link' | 'private';
export type Category = 'verify' | 'improve' | 'proposal' | 'develop' | 'other';

export const CATEGORY_OPTIONS: ReadonlyArray<{ value: Category; label: string }> = [
  { value: 'verify', label: '검증 (verify)' },
  { value: 'improve', label: '개선 (improve)' },
  { value: 'proposal', label: '제안서 (proposal)' },
  { value: 'develop', label: '개발 (develop)' },
  { value: 'other', label: '기타 (other)' },
];

export const VISIBILITY_OPTIONS: ReadonlyArray<{ value: Visibility; label: string; desc: string }> = [
  { value: 'public', label: '전체 공개', desc: '갤러리·검색에 모두 노출' },
  { value: 'link', label: '링크 공유', desc: '주소 아는 사람만' },
  { value: 'private', label: '비공개', desc: '나만 볼 수 있어요' },
];

/** label · hint · error 를 한 묶음으로 렌더 */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-800">
          {label}
          {required ? (
            <span className="ml-0.5 text-[color:var(--color-danger)]">*</span>
          ) : null}
        </span>
        {hint ? (
          <span className="text-xs text-[color:var(--color-ink-600)]">{hint}</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-err`}
          role="alert"
          className="text-xs text-[color:var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
    />
  );
}

export function VisibilityRadios({
  value,
  onChange,
  disabled,
}: {
  value: Visibility;
  onChange: (v: Visibility) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 block text-sm font-semibold text-brand-800">공개 범위</legend>
      <div className="grid gap-2 md:grid-cols-3">
        {VISIBILITY_OPTIONS.map((v) => (
          <label
            key={v.value}
            className={`flex cursor-pointer items-start gap-2 rounded-[10px] border px-3 py-2 ${
              value === v.value
                ? 'border-brand-600 bg-brand-50'
                : 'border-[color:var(--color-ink-300)] bg-white'
            }`}
          >
            <input
              type="radio"
              name="visibility"
              value={v.value}
              checked={value === v.value}
              onChange={() => onChange(v.value)}
              disabled={disabled}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold text-brand-900">{v.label}</span>
              <span className="block text-xs text-[color:var(--color-ink-600)]">{v.desc}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** 콤마 구분 문자열을 정리된 배열로 (공백제거 · 빈값 제거 · 최대 N) */
export function splitCsv(raw: string, max: number): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}
