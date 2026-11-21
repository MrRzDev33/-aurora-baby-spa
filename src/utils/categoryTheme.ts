import { GuestCategory } from '../types';

export interface CategoryTheme {
  label: GuestCategory;
  badgeClass: string;
  cardClass: string;
  pillClass: string;
  dotClass: string;
  timeChipClass: string;
  rowTintClass: string;
  accentBorderClass: string;
}

const CATEGORY_THEMES: Record<GuestCategory, CategoryTheme> = {
  Trial: {
    label: 'Trial',
    badgeClass: 'bg-[#0EA5E9] text-white border-[#0284C7] shadow-2xs',
    cardClass: 'bg-[#E0F2FE] hover:bg-[#BAE6FD] border-[#38BDF8] text-[#0C4A6E]',
    pillClass: 'bg-[#E0F2FE] hover:bg-[#BAE6FD] border-[#38BDF8] text-[#0369A1]',
    dotClass: 'bg-[#0EA5E9]',
    timeChipClass: 'bg-[#0EA5E9] text-white border-[#0284C7]',
    rowTintClass: 'bg-[#F0F9FF]/75 hover:bg-[#E0F2FE]/80',
    accentBorderClass: 'border-[#38BDF8] bg-[#F0F9FF]/75 hover:bg-[#E0F2FE]/70',
  },
  Pelanggan: {
    label: 'Pelanggan',
    badgeClass: 'bg-[#16A34A] text-white border-[#15803D] shadow-2xs',
    cardClass: 'bg-[#DCFCE7] hover:bg-[#BBF7D0] border-[#4ADE80] text-[#14532D]',
    pillClass: 'bg-[#DCFCE7] hover:bg-[#BBF7D0] border-[#4ADE80] text-[#15803D]',
    dotClass: 'bg-[#16A34A]',
    timeChipClass: 'bg-[#16A34A] text-white border-[#15803D]',
    rowTintClass: 'bg-[#F0FDF4]/75 hover:bg-[#DCFCE7]/80',
    accentBorderClass: 'border-[#4ADE80] bg-[#F0FDF4]/75 hover:bg-[#DCFCE7]/70',
  },
  Influencer: {
    label: 'Influencer',
    badgeClass: 'bg-[#9333EA] text-white border-[#7E22CE] shadow-2xs',
    cardClass: 'bg-[#F3E8FF] hover:bg-[#E9D5FF] border-[#C084FC] text-[#581C87]',
    pillClass: 'bg-[#F3E8FF] hover:bg-[#E9D5FF] border-[#C084FC] text-[#7E22CE]',
    dotClass: 'bg-[#9333EA]',
    timeChipClass: 'bg-[#9333EA] text-white border-[#7E22CE]',
    rowTintClass: 'bg-[#FAF5FF]/75 hover:bg-[#F3E8FF]/80',
    accentBorderClass: 'border-[#C084FC] bg-[#FAF5FF]/75 hover:bg-[#F3E8FF]/70',
  },
};

export function getCategoryTheme(category: GuestCategory): CategoryTheme {
  return CATEGORY_THEMES[category] || CATEGORY_THEMES.Trial;
}
