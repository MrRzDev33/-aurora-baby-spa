import { ChevronDown, Info, X } from 'lucide-react';
import React, { useState } from 'react';
import { GuestCategory } from '../../types';
import { getCategoryTheme } from '../../utils/categoryTheme';

interface CategoryLegendPopupProps {
  isSidebarCollapsed?: boolean;
}

const CATEGORY_NOTES: {
  category: GuestCategory;
  colorName: string;
  description: string;
}[] = [
  {
    category: 'Trial',
    colorName: 'Biru',
    description: 'Tamu baru / sesi percobaan',
  },
  {
    category: 'Pelanggan',
    colorName: 'Hijau',
    description: 'Pelanggan tetap / reguler',
  },
  {
    category: 'Influencer',
    colorName: 'Ungu',
    description: 'KOL / kolaborasi media',
  },
];

export const CategoryLegendPopup: React.FC<CategoryLegendPopupProps> = ({
  isSidebarCollapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Align cleanly in the bottom-left above the HP bottom footer, and in the bottom-left of content area on Tablet/Desktop
  const leftOffsetClass = isSidebarCollapsed
    ? 'left-3 sm:left-4 md:left-[6rem]'
    : 'left-3 sm:left-4 md:left-[17rem]';

  return (
    <div className={`fixed bottom-[78px] md:bottom-5 z-30 transition-all duration-200 ${leftOffsetClass}`}>
      {isOpen ? (
        <div
          className="w-[214px] sm:w-[252px] rounded-2xl border border-[#D8E7F1] bg-white/95 backdrop-blur-md shadow-xl overflow-hidden animate-popup-in"
          role="region"
          aria-label="Catatan Warna Kategori Tamu"
        >
          {/* Compact Header */}
          <div className="px-3.5 py-2.5 bg-[#F4FAFC] border-b border-[#E4EBF0] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Info className="w-3.5 h-3.5 text-[#4eafde] shrink-0" />
              <span className="text-xs font-bold text-[#223749] truncate">
                Catatan Kategori Tamu
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-lg hover:bg-white text-[#647b8e] hover:text-[#223749] flex items-center justify-center transition-colors shrink-0"
              title="Kecilkan catatan kategori"
              aria-label="Tutup pop-up catatan kategori"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category Color List */}
          <div className="p-2.5 space-y-1.5">
            {CATEGORY_NOTES.map((item) => {
              const theme = getCategoryTheme(item.category);
              return (
                <div
                  key={item.category}
                  className={`px-2.5 py-2 rounded-xl border flex items-center gap-2.5 ${theme.accentBorderClass}`}
                >
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-2xs ${theme.dotClass}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[#223749]">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.badgeClass}`}>
                        {item.colorName}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#647b8e] truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="min-h-[40px] px-3.5 py-2 rounded-full border border-[#D8E7F1] bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl hover:border-[#4eafde] text-xs font-bold text-[#223749] flex items-center gap-2 transition-all animate-popup-in active:scale-95"
          aria-label="Buka catatan warna kategori tamu"
        >
          <span className="flex items-center -space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9] ring-2 ring-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-2 ring-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA] ring-2 ring-white" />
          </span>
          <span>Kategori</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#647b8e] rotate-180" />
        </button>
      )}
    </div>
  );
};
