'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const LOGOS = [
  '/logos/logo_v1_variety_main.png',
  '/logos/logo_v2_mascot_hug.png',
  '/logos/logo_v2_sealion__gemini-3-pro-image-preview.png',
  '/logos/logo_v2_sealion__imagen-4.0-ultra-generate-001.png',
  '/logos/logo_v2_sealion_grayblue_a.png',
  '/logos/logo_v2_sealion_grayblue_b.png',
  '/logos/logo_v2_sealion_hug.png',
  '/logos/logo_v2_sealion_hug_alt.png',
  '/logos/logo_v2_sealion_pro__imagen-4.0-generate-001.png',
  '/logos/logo_v3_sticker_pop.png',
  '/logos/logo_v4_retro_tv.png',
] as const;

const INTERVAL_MS = 10_000;

/**
 * Hero 우측 로고 캐러셀 — 11종 우하귀 로고를 10초마다 페이드 전환.
 */
export function HeroLogoCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % LOGOS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[420px] md:max-w-[480px]"
      role="img"
      aria-label="우하귀 메인 로고 — 11종 시안이 순환됩니다"
    >
      {LOGOS.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="(max-width: 768px) 80vw, 480px"
          className={`object-contain drop-shadow-[0_12px_36px_rgba(122,95,191,0.25)] transition-opacity duration-[1200ms] ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}
