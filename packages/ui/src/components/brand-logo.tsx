interface Props {
  size?: number;
  withTagline?: boolean;
}

/**
 * 우하귀 워드마크 placeholder.
 * 이미지 자산은 _output/logo/ 에서 선정 후 apps/web/public/ 으로 이식.
 */
export function BrandLogo({ size = 48, withTagline = false }: Props) {
  return (
    <div className="inline-flex items-center gap-2" style={{ height: size }}>
      <span
        className="font-display text-brand-700"
        style={{ fontSize: size * 0.6 }}
        aria-label="우하귀 — 우리 하네스 귀엽지"
      >
        우하귀
      </span>
      {withTagline && <span className="text-xs text-brand-500">우리 하네스 귀엽지</span>}
    </div>
  );
}
