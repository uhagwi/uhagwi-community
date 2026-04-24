// ERD 문서(§reactions.type) 기준 — heart / fire / bow / pinch 4종
export type ReactionType = 'heart' | 'fire' | 'bow' | 'pinch';

export const REACTION_META: Record<ReactionType, { emoji: string; label: string }> = {
  heart: { emoji: '❤️', label: '조각이다' },
  fire: { emoji: '🔥', label: '불탄다' },
  bow: { emoji: '🙇', label: '영접합니다' },
  pinch: { emoji: '🤌', label: '주접' },
};
