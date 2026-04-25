'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  src: string | null;
  fallbackEmoji: string;
  alt: string;
  /** sizes prop for next/image */
  sizes?: string;
  /** 이미지 padding (px-3 등 기본값) */
  imageClassName?: string;
  /** 이모지 폰트 크기 */
  emojiClassName?: string;
};

/**
 * 캐릭터 썸네일 — thumbnail_url 이미지 시도 후 404·로딩 실패 시 emoji 자동 fallback.
 * Phase 1 (수동 PNG 생성) 단계에서 PNG 미배치 상태에서도 깨진 이미지 안 보이게.
 */
export function CharacterThumbnail({
  src,
  fallbackEmoji,
  alt,
  sizes = '(max-width: 768px) 90vw, 360px',
  imageClassName = 'object-contain p-3',
  emojiClassName = 'text-6xl',
}: Props) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <span aria-hidden="true" className={emojiClassName}>
        {fallbackEmoji}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={imageClassName}
      onError={() => setErrored(true)}
    />
  );
}
