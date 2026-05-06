import type { BenchmarkDomain, Grade } from '@/lib/grades';

export type GalleryFilter = 'all' | 'mine' | 'human' | 'ai';
export type DomainFilter = 'all' | BenchmarkDomain;
export type SortBy = 'grade' | 'recent' | 'domain';

export const DOMAIN_LABELS: Record<BenchmarkDomain, { emoji: string; label: string }> = {
  education: { emoji: '🎓', label: '교육' },
  admin: { emoji: '🏛', label: '행정' },
  cafe_business: { emoji: '☕', label: '자영업' },
  research: { emoji: '🔬', label: '연구' },
  design: { emoji: '🎨', label: '디자인' },
  engineering: { emoji: '💻', label: '개발' },
  general: { emoji: '🌐', label: '일반' },
};

export const GRADE_ORDER: Record<Grade, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };
