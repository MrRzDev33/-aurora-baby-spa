import { GuestCategory } from '../types';

export interface CategoryTheme {
  label: GuestCategory;
  badgeClass: string;
  cardClass: string;
  pillClass: string;
  dotClass: string;
  timeChipClass: string;
  accentBorderClass: string;
}

const CATEGORY_THEMES: Record<GuestCategory, CategoryTheme> = {
  Trial: {
    label: 'Trial',
    badgeClass: 'bg-[#E8F5FB] text-[#16567D] border-[#4EAFDE]/50',
    cardClass: 'bg-[#E8F5FB]/85 hover:bg-[#D8EEF9] border-[#4EAFDE]/45 text-[#16567D]',
    pillClass: 'bg-[#E8F5FB] hover:bg-[#D5ECF8] border-[#4EAFDE]/50 text-[#16567D]',
    dotClass: 'bg-[#4EAFDE]',
    timeChipClass: 'bg-[#E8F5FB] text-[#16567D] border-[#4EAFDE]/45',
    accentBorderClass: 'border-[#4EAFDE]/50',
  },
  Pelanggan: {
    label: 'Pelanggan',
    badgeClass: 'bg-[#ECFDF3] text-[#156B3B] border-[#22C55E]/45',
    cardClass: 'bg-[#ECFDF3]/90 hover:bg-[#DCFCE7] border-[#22C55E]/40 text-[#156B3B]',
    pillClass: 'bg-[#ECFDF3] hover:bg-[#DCFCE7] border-[#22C55E]/45 text-[#156B3B]',
    dotClass: 'bg-[#22C55E]',
    timeChipClass: 'bg-[#ECFDF3] text-[#156B3B] border-[#22C55E]/40',
    accentBorderClass: 'border-[#22C55E]/45',
  },
  Influencer: {
    label: 'Influencer',
    badgeClass: 'bg-[#F5F0FF] text-[#6B21A8] border-[#A855F7]/45',
    cardClass: 'bg-[#F5F0FF]/90 hover:bg-[#EDE4FF] border-[#A855F7]/40 text-[#6B21A8]',
    pillClass: 'bg-[#F5F0FF] hover:bg-[#EDE4FF] border-[#A855F7]/45 text-[#6B21A8]',
    dotClass: 'bg-[#A855F7]',
    timeChipClass: 'bg-[#F5F0FF] text-[#6B21A8] border-[#A855F7]/40',
    accentBorderClass: 'border-[#A855F7]/45',
  },
};

export function getCategoryTheme(category: GuestCategory): CategoryTheme {
  return CATEGORY_THEMES[category] || CATEGORY_THEMES.Trial;
}
