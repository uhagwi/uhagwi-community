'use client';

import type { Grade } from '@/lib/grades';

const ADMIN_GRADES: Array<Grade | 'all'> = ['all', 'S', 'A', 'B', 'C', 'D'];

interface Props {
  gradeFilter: Grade | 'all';
  setGradeFilter: (g: Grade | 'all') => void;
  poolSize: number;
  onDrawN: (n: number) => void;
  onShowAll: () => void;
  onFillAll: () => void;
  onReset: () => void;
}

export function AdminPanel({
  gradeFilter,
  setGradeFilter,
  poolSize,
  onDrawN,
  onShowAll,
  onFillAll,
  onReset,
}: Props) {
  return (
    <div className="rounded-card border-2 border-orange-300 bg-orange-50 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-orange-900">🛠 관리자 패널</p>
        <p className="text-[10px] text-orange-700">URL `?admin=1` — 본인 테스트 전용</p>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
          등급 강제 ({poolSize}장 풀)
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {ADMIN_GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGradeFilter(g)}
              className={`rounded-pill border px-2.5 py-1 text-[11px] font-bold transition ${
                gradeFilter === g
                  ? 'border-orange-600 bg-orange-600 text-white'
                  : 'border-orange-300 bg-white text-orange-800 hover:bg-orange-100'
              }`}
            >
              {g === 'all' ? '전체' : g}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
          무제한 뽑기 (현재 풀)
        </p>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
          <AdminBtn onClick={() => onDrawN(1)} disabled={poolSize === 0}>+1</AdminBtn>
          <AdminBtn onClick={() => onDrawN(3)} disabled={poolSize === 0}>+3</AdminBtn>
          <AdminBtn onClick={() => onDrawN(5)} disabled={poolSize === 0}>+5</AdminBtn>
          <AdminBtn onClick={() => onDrawN(10)} disabled={poolSize === 0}>+10</AdminBtn>
          <AdminBtn onClick={onShowAll}>전체 표시</AdminBtn>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
          컬렉션 조작 (localStorage)
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <AdminBtn onClick={onFillAll}>📦 전체 18장 채우기</AdminBtn>
          <AdminBtn onClick={onReset} danger>🗑 초기화 (게이트·컬렉션·총합)</AdminBtn>
        </div>
      </div>
    </div>
  );
}

function AdminBtn({
  onClick,
  disabled,
  danger,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-card border px-2.5 py-1.5 text-[11px] font-bold transition disabled:opacity-50 ${
        danger
          ? 'border-red-300 bg-white text-red-800 hover:bg-red-50'
          : 'border-orange-400 bg-white text-orange-900 hover:bg-orange-100'
      }`}
    >
      {children}
    </button>
  );
}
