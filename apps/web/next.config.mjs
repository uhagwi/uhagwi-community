/**
 * Next.js 설정
 * 근거: docs/service-dev/02_design/api.md §1, ui.md §3
 * - Discord CDN: 아바타 이미지
 * - Supabase Storage: 하네스 썸네일·미디어 업로드
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.discordapp.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media.discordapp.net', pathname: '/**' },
      // Supabase Storage — 프로젝트 ref 확정 후 정교화
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  experimental: {
    // Server Actions은 Next 14.2에서 기본 활성. 추후 옵션 필요 시 확장.
  },
  // Monorepo 워크스페이스 패키지 트랜스파일
  transpilePackages: ['@uhagwi/ui', '@uhagwi/db'],
};

export default nextConfig;
