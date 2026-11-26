import {
  ArrowLeft,
  ChevronRight,
  Footprints,
  RotateCcw,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  GUEST_SOURCES,
  GuestCategory,
  JembolRecord,
  ReservationWithTreatment,
  VisitRecord,
} from '../../types';
import { getCategoryTheme } from '../../utils/categoryTheme';
import {
  formatShortDate,
  isInCurrentMonth,
  isInCurrentWeek,
  isToday,
} from '../../utils/dateUtils';
import { JembolVisitView } from '../jembolVisit/JembolVisitView';
import { CategoryBadge, StatusBadge } from '../ui/StatusBadge';

export type DataCategoryTab = 'menu' | 'jembol' | 'visit' | 'sumber_tamu';

interface DataViewProps {
  reservations: ReservationWithTreatment[];
  jembolRecords: JembolRecord[];
  visitRecords: VisitRecord[];
  missingTables?: {
    jembolTableMissing: boolean;
    visitTableMissing: boolean;
  };
  initialCategory?: DataCategoryTab;
  navSignal?: number;
  onOpenNewJembol: () => void;
  onOpenNewVisit: () => void;
  onSelectReservation: (record: ReservationWithTreatment) => void;
  onSelectJembol: (record: JembolRecord) => void;
  onEditJembol: (record: JembolRecord) => void;
  onDeleteJembol: (record: JembolRecord) => void;
  onSelectVisit: (record: VisitRecord) => void;
  onEditVisit: (record: VisitRecord) => void;
  onDeleteVisit: (record: VisitRecord) => void;
  onNavigateToSettings?: () => void;
}

export const DataView: React.FC<DataViewProps> = ({
  reservations,
  jembolRecords,
  visitRecords,
  missingTables,
  initialCategory = 'menu',
  navSignal = 0,
  onOpenNewJembol,
  onOpenNewVisit,
  onSelectReservation,
  onSelectJembol,
  onEditJembol,
  onDeleteJembol,
  onSelectVisit,
  onEditVisit,
  onDeleteVisit,
  onNavigateToSettings,
}) => {
  const [activePage, setActivePage] = useState<DataCategoryTab>(initialCategory);

  useEffect(() => {
    setActivePage(initialCategory);
  }, [initialCategory, navSignal]);

  // State for Rekapan Data Sumber Tamu sub-page
  const [periodFilter, setPeriodFilter] = useState<
    'all' | 'today' | 'this_week' | 'this_month' | 'range'
  >('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | GuestCategory>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const effectiveStart = startDate && endDate && startDate > endDate ? endDate : startDate;
  const effectiveEnd = startDate && endDate && startDate > endDate ? startDate : endDate;

  const matchesPeriod = (dateStr: string): boolean => {
    if (periodFilter === 'all') return true;
    if (!dateStr) return false;
    if (periodFilter === 'today') return isToday(dateStr);
    if (periodFilter === 'this_week') return isInCurrentWeek(dateStr);
    if (periodFilter === 'this_month') return isInCurrentMonth(dateStr);
    if (periodFilter === 'range') {
      if (effectiveStart && dateStr < effectiveStart) return false;
      if (effectiveEnd && dateStr > effectiveEnd) return false;
      return true;
    }
    return true;
  };

  // Base filtered reservations for Rekapan Sumber Tamu
  const baseReservationsForRecap = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return reservations.filter((r) => {
      if (!matchesPeriod(r.reservation_date)) return false;
      if (categoryFilter !== 'all' && r.guest_category !== categoryFilter) return false;
      if (q) {
        const hit =
          r.mom_name.toLowerCase().includes(q) ||
          r.child_name.toLowerCase().includes(q) ||
          r.whatsapp.toLowerCase().includes(q) ||
          r.treatment_name.toLowerCase().includes(q) ||
          (r.guest_source || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [reservations, periodFilter, effectiveStart, effectiveEnd, categoryFilter, searchQuery]);

  // Counts per Sumber Tamu
  const sourceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const src of GUEST_SOURCES) {
      counts[src] = 0;
    }
    let noSourceCount = 0;

    for (const r of baseReservationsForRecap) {
      if (r.guest_source && Object.prototype.hasOwnProperty.call(counts, r.guest_source)) {
        counts[r.guest_source]++;
      } else {
        noSourceCount++;
      }
    }

    const total = baseReservationsForRecap.length;
    const pct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

    return {
      total,
      items: GUEST_SOURCES.map((src) => ({
        source: src,
        count: counts[src],
        pct: pct(counts[src]),
      })),
      noSourceCount,
      noSourcePct: pct(noSourceCount),
    };
  }, [baseReservationsForRecap]);

  // Reservations shown when drilling down or browsing Rekapan Sumber Tamu
  const filteredRecapReservations = useMemo(() => {
    const list =
      selectedSource === 'all'
        ? baseReservationsForRecap
        : selectedSource === '__empty__'
        ? baseReservationsForRecap.filter((r) => !r.guest_source)
        : baseReservationsForRecap.filter((r) => r.guest_source === selectedSource);

    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [baseReservationsForRecap, selectedSource]);

  const hasRecapFilters =
    periodFilter !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    categoryFilter !== 'all' ||
    selectedSource !== 'all' ||
    Boolean(searchQuery.trim());

  const resetRecapFilters = () => {
    setPeriodFilter('all');
    setStartDate('');
    setEndDate('');
    setCategoryFilter('all');
    setSelectedSource('all');
    setSearchQuery('');
  };

  // ==================== 1. MAIN LIST MENU (CHOOSE DATA CATEGORY FIRST) ====================
  if (activePage === 'menu') {
    const menuItems = [
      {
        id: 'jembol' as const,
        title: 'Data Jembol',
        description: 'Visit Aja, Trial Treatment & Ambil Voucher (Tanpa Visit)',
        countText: `${jembolRecords.length} data`,
        icon: Sparkles,
        iconBg: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
      },
      {
        id: 'visit' as const,
        title: 'Data Visit',
        description: 'Data kunjungan tamu, treatment & kesan pesan',
        countText: `${visitRecords.length} data`,
        icon: Footprints,
        iconBg: 'bg-[#CCFBF1] text-[#0D9488] border-[#99F6E4]',
      },
      {
        id: 'sumber_tamu' as const,
        title: 'Rekapan Data Sumber Tamu',
        description: 'Jumlah Tamu reguler, Affiliate, Barter Influencer & sumber lainnya',
        countText: `${reservations.length} reservasi`,
        icon: Users,
        iconBg: 'bg-[#e8f5fb] text-[#16567d] border-[#BAE6FD]',
      },
    ];

    return (
      <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-[#223749] tracking-tight">
            Semua Data
          </h2>
          <p className="text-xs sm:text-sm text-[#647b8e] mt-0.5">
            Pilih salah satu data di bawah ini untuk membuka halamannya
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs overflow-hidden divide-y divide-[#E4EBF0]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                className="w-full min-h-[72px] px-4 py-4 sm:px-5 sm:py-4 text-left flex items-center justify-between gap-3 hover:bg-[#FAFDFE] active:bg-[#f4fafc] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-bold text-[#223749] group-hover:text-[#16567d] transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#647b8e] mt-0.5 truncate">
                      <span className="font-semibold text-[#16567d] tabular-nums">
                        {item.countText}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>{item.description}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[#9AA7B4] group-hover:text-[#4eafde] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== 2. DATA JEMBOL OR DATA VISIT PAGE (PREVIOUS UI) ====================
  if (activePage === 'jembol' || activePage === 'visit') {
    return (
      <div className="space-y-4 max-w-6xl mx-auto">
        <div>
          <button
            type="button"
            onClick={() => setActivePage('menu')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E4EBF0] hover:border-[#4eafde] text-xs font-semibold text-[#16567d] hover:bg-[#f4fafc] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Pilihan Data</span>
          </button>
        </div>

        <JembolVisitView
          jembolRecords={jembolRecords}
          visitRecords={visitRecords}
          missingTables={missingTables}
          initialSubTab={activePage}
          hideTabSwitcher={true}
          onOpenNewJembol={onOpenNewJembol}
          onOpenNewVisit={onOpenNewVisit}
          onSelectJembol={onSelectJembol}
          onEditJembol={onEditJembol}
          onDeleteJembol={onDeleteJembol}
          onSelectVisit={onSelectVisit}
          onEditVisit={onEditVisit}
          onDeleteVisit={onDeleteVisit}
          onNavigateToSettings={onNavigateToSettings}
        />
      </div>
    );
  }

  // ==================== 3. REKAPAN DATA SUMBER TAMU PAGE ====================
  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <div>
        <button
          type="button"
          onClick={() => setActivePage('menu')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E4EBF0] hover:border-[#4eafde] text-xs font-semibold text-[#16567d] hover:bg-[#f4fafc] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Pilihan Data</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-[#223749] tracking-tight">
            Rekapan Data Sumber Tamu
          </h2>
          <p className="text-xs sm:text-sm text-[#647b8e] mt-0.5">
            Total inputan Tamu reguler dan seluruh sumber tamu lainnya ({sourceBreakdown.total} reservasi)
          </p>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
        {(
          [
            { key: 'all', label: 'Semua' },
            { key: 'today', label: 'Hari Ini' },
            { key: 'this_week', label: 'Minggu Ini' },
            { key: 'this_month', label: 'Bulan Ini' },
            { key: 'range', label: 'Rentang Tanggal' },
          ] as const
        ).map((tab) => {
          const active = periodFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPeriodFilter(tab.key)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                tab.key === 'range' ? 'col-span-2 sm:col-span-1' : ''
              } ${
                active
                  ? 'bg-[#4eafde] text-white border-[#4eafde] shadow-xs'
                  : 'bg-white text-[#647b8e] border-[#E4EBF0] hover:bg-[#f4fafc] hover:text-[#223749]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {periodFilter === 'range' && (
        <div className="bg-[#F4FAFC] p-3.5 sm:p-4 rounded-2xl border border-[#4eafde]/40 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-popup-in">
          <div>
            <label className="block text-[11px] font-semibold text-[#16567d] uppercase tracking-wider mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-[#D8E7F1] bg-white text-xs sm:text-sm text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#16567d] uppercase tracking-wider mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-[#D8E7F1] bg-white text-xs sm:text-sm text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
            />
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E4EBF0] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#647b8e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama Moms, Anak, WA, atau Treatment..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as 'all' | GuestCategory)}
          className="px-3.5 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs sm:text-sm text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
        >
          <option value="all">Semua Kategori Tamu</option>
          <option value="Trial">Trial</option>
          <option value="Pelanggan">Pelanggan</option>
          <option value="Influencer">Influencer</option>
        </select>

        {hasRecapFilters && (
          <button
            type="button"
            onClick={resetRecapFilters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#4eafde] hover:bg-[#f4fafc]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Summary Cards for Each Sumber Tamu */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-bold text-[#223749]">
            Rincian Jumlah per Sumber Tamu
          </h3>
          {selectedSource !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedSource('all')}
              className="text-xs font-semibold text-[#4eafde] hover:underline"
            >
              Tampilkan Semua Sumber
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {sourceBreakdown.items.map((item) => {
            const isSelected = selectedSource === item.source;
            const isRegular = item.source === 'Tamu reguler';
            return (
              <button
                key={item.source}
                type="button"
                onClick={() =>
                  setSelectedSource((prev) => (prev === item.source ? 'all' : item.source))
                }
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer min-w-0 ${
                  isSelected
                    ? 'bg-[#e8f5fb] border-[#4eafde] ring-2 ring-[#4eafde]/25'
                    : isRegular
                    ? 'bg-[#F4FAFC] border-[#BAE6FD] hover:border-[#4eafde]'
                    : 'bg-white border-[#E4EBF0] hover:bg-[#FAFDFE] hover:border-[#4eafde]/60'
                }`}
              >
                <div className="text-[11px] sm:text-xs font-bold text-[#223749] truncate">
                  {item.source}
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold text-[#16567d] tabular-nums">
                    {item.count}
                  </span>
                  <span className="text-[11px] font-semibold text-[#647b8e] tabular-nums">
                    {item.pct}%
                  </span>
                </div>
              </button>
            );
          })}

          {sourceBreakdown.noSourceCount > 0 && (
            <button
              type="button"
              onClick={() =>
                setSelectedSource((prev) => (prev === '__empty__' ? 'all' : '__empty__'))
              }
              className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer min-w-0 ${
                selectedSource === '__empty__'
                  ? 'bg-[#e8f5fb] border-[#4eafde] ring-2 ring-[#4eafde]/25'
                  : 'bg-[#FAFDFE] border-[#E4EBF0] hover:border-[#4eafde]/60'
              }`}
            >
              <div className="text-[11px] sm:text-xs font-bold text-[#647b8e] truncate">
                Tanpa Sumber (Data Lama)
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-[#4E6273] tabular-nums">
                  {sourceBreakdown.noSourceCount}
                </span>
                <span className="text-[11px] font-semibold text-[#647b8e] tabular-nums">
                  {sourceBreakdown.noSourcePct}%
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Matching Reservations List for Selected Source */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs overflow-hidden">
        <div className="px-4 py-3.5 sm:px-6 border-b border-[#E4EBF0] bg-[#FAFDFE] flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-bold text-[#223749]">
            {selectedSource === 'all'
              ? 'Semua Data Reservasi'
              : selectedSource === '__empty__'
              ? 'Data Lama (Tanpa Sumber)'
              : `Sumber: ${selectedSource}`}
          </span>
          <span className="text-xs font-semibold text-[#647b8e] tabular-nums">
            {filteredRecapReservations.length} data
          </span>
        </div>

        {filteredRecapReservations.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs sm:text-sm text-[#647b8e]">
            Tidak ada data reservasi untuk sumber tamu atau filter ini.
          </div>
        ) : (
          <div className="divide-y divide-[#E4EBF0]">
            {filteredRecapReservations.map((item) => {
              const catTheme = getCategoryTheme(item.guest_category);
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectReservation(item)}
                  className="px-4 py-3.5 sm:px-6 hover:bg-[#f4fafc] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border tabular-nums shrink-0 ${catTheme.timeChipClass}`}
                    >
                      {item.reservation_time}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-[#223749]">
                          {item.mom_name}
                        </span>
                        <CategoryBadge category={item.guest_category} />
                      </div>
                      <div className="text-xs text-[#647b8e] mt-0.5 truncate">
                        {formatShortDate(item.reservation_date)} · {item.treatment_name} ·{' '}
                        <span className="font-medium text-[#16567d]">
                          {item.guest_source || 'Tanpa sumber'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-12 sm:pl-0">
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-xs font-semibold text-[#4eafde]">Detail &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
