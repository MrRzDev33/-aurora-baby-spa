import React from 'react';
import { GuestCategory, ReservationStatus } from '../../types';
import { getCategoryTheme } from '../../utils/categoryTheme';

interface StatusBadgeProps {
  status: ReservationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-[#f4fafc] text-[#223749] border-[#d8eaf5]';

  switch (status) {
    case 'Confirmed':
      colorClasses = 'bg-[#e8f5fb] text-[#16567d] border-[#4eafde]/50 font-medium';
      break;
    case 'In Treatment':
      colorClasses = 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe] font-medium';
      break;
    case 'Checked-in':
      colorClasses = 'bg-[#f0fdfa] text-[#0f766e] border-[#99f6e4] font-medium';
      break;
    case 'Completed':
      colorClasses = 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]';
      break;
    case 'Pending':
      colorClasses = 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
      break;
    case 'Rescheduled':
      colorClasses = 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]';
      break;
    case 'Cancelled':
      colorClasses = 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]';
      break;
    case 'No Show':
      colorClasses = 'bg-[#fff1f2] text-[#be123c] border-[#fecdd3]';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-tight ${sizeClasses} ${colorClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Confirmed'
            ? 'bg-[#4eafde]'
            : status === 'In Treatment'
            ? 'bg-[#3b82f6]'
            : status === 'Checked-in'
            ? 'bg-[#14b8a6]'
            : status === 'Completed'
            ? 'bg-[#22c55e]'
            : status === 'Pending'
            ? 'bg-[#f59e0b]'
            : status === 'Cancelled'
            ? 'bg-[#ef4444]'
            : 'bg-[#94a3b8]'
        }`}
      />
      {status}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: GuestCategory }> = ({ category }) => {
  const theme = getCategoryTheme(category);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs border font-semibold ${theme.badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dotClass}`} />
      {category}
    </span>
  );
};
