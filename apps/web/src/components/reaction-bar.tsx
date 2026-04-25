/**
 * ReactionBar — 카드/상세 공용 리액션 막대 래퍼
 * 근거: docs/service-dev/02_design/ui.md §3-5 카드 푸터 · §2-3 상세 사이드
 *
 * JuzzepReactions 의 variant 만 다르게 노출하는 얇은 어댑터.
 * - card  : 카드 그리드 푸터용 작은 사이즈
 * - detail: 상세 페이지 사이드바용 일반 사이즈
 */
'use client';

import {
  JuzzepReactions,
  type JuzzepReactionsProps,
  type ReactionType,
  type ReactionCounts,
} from '@/components/juzzep-reactions';

export type ReactionBarProps = Omit<JuzzepReactionsProps, 'variant'> & {
  variant?: 'card' | 'detail';
};

export function ReactionBar({ variant = 'detail', ...rest }: ReactionBarProps) {
  return <JuzzepReactions {...rest} variant={variant === 'card' ? 'sm' : 'md'} />;
}

export type { ReactionType, ReactionCounts };
