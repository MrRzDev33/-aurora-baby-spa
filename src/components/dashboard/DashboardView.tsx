import {
  Calendar as CalendarIcon,
  CalendarCheck2,
  CalendarRange,
  ChevronDown,
  Clock,
  Footprints,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  DashboardStats,
  GUEST_SOURCES,
  GuestCategory,
  JembolRecord,
  ReservationWithTreatment,
  Treatment,
  VisitRecord,
} from '../../types';
import { getCategoryTheme } from '../../utils/categoryTheme';
import {
  formatShortDate,
  isInCurrentMonth,
  isInCurrentWeek,
  isToday,
} from '../../utils/dateUtils';
import { CategoryBadge, StatusBadge } from '../ui/StatusBadge';

interface DashboardViewProps {
  stats: DashboardStats;
  reservations: ReservationWithTreatment[];
  treatments: Treatment[];
  jembolRecords: JembolRecord[];
  visitRecords: VisitRecord[];
  onOpenNewData: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToReservations: () => void;
  onNavigateToJembolVisit: (subTab?: 'jembol' | 'visit') => void;
  onSelectReservation: (reservation: ReservationWithTreatment) => void;
  onSelectJembol: (record: JembolRecord) => void;
  onSelectVisit: (record: VisitRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  reservations,
  treatments,
  jembolRecords,
  visitRecords,
  onOpenNewData,
  onNavigateToCalendar,
  onNavigateToReservations,
  onNavigateToJembolVisit,
  onSelectReservation,
  onSelectJembol,
  onSelectVisit,
}) => {
  // Home Filter State
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'range'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | GuestCategory>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [treatmentFilter, setTreatmentFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'recently_added' | 'nearest' | 'newest_first'>('recently_added');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Active list tab in Home bottom list section
  const [homeListTab, setHomeListTab] = useState<'reservations' | 'jembol' | 'visit'>('reservations');

  // Shared date range boundaries
  const effectiveStart = startDate && endDate && startDate > endDate ? endDate : startDate;
  const effectiveEnd = startDate && endDate && startDate > endDate ? startDate : endDate;

  const matchesHomePeriod = (dateStr: string): boolean => {
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

  // Quick period counts (reservations)
  const periodCounts = useMemo(() => {
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    for (const r of reservations) {
      if (isToday(r.reservation_date)) todayCount++;
      if (isInCurrentWeek(r.reservation_date)) weekCount++;
      if (isInCurrentMonth(r.reservation_date)) monthCount++;
    }
    return {
      all: reservations.length,
      today: todayCount,
      this_week: weekCount,
      this_month: monthCount,
    };
  }, [reservations]);

  // Base filtered reservations (Period + Date Range + Search + Status + Treatment, BEFORE category filter)
  const baseFilteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          r.mom_name.toLowerCase().includes(q) ||
          r.child_name.toLowerCase().includes(q) ||
          r.whatsapp.toLowerCase().includes(q) ||
          r.reservation_code.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (!matchesHomePeriod(r.reservation_date)) return false;

      if (sourceFilter !== 'all' && (r.guest_source || 'Tamu reguler') !== sourceFilter) {
        return false;
      }

      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }

      if (treatmentFilter !== 'all' && r.treatment_id !== treatmentFilter) {
        return false;
      }

      return true;
    });
  }, [reservations, searchQuery, periodFilter, effectiveStart, effectiveEnd, sourceFilter, statusFilter, treatmentFilter]);

  // Guest Category Breakdown (Trial, Pelanggan, Influencer)
  const categoryBreakdown = useMemo(() => {
    let trial = 0;
    let pelanggan = 0;
    let influencer = 0;

    for (const r of baseFilteredReservations) {
      if (r.guest_category === 'Trial') trial++;
      else if (r.guest_category === 'Pelanggan') pelanggan++;
      else if (r.guest_category === 'Influencer') influencer++;
    }

    const total = baseFilteredReservations.length;
    const pct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

    return {
      total,
      Trial: { count: trial, pct: pct(trial) },
      Pelanggan: { count: pelanggan, pct: pct(pelanggan) },
      Influencer: { count: influencer, pct: pct(influencer) },
    };
  }, [baseFilteredReservations]);

  // Final filtered reservations list
  const finalFilteredReservations = useMemo(() => {
    const filtered =
      categoryFilter === 'all'
        ? baseFilteredReservations
        : baseFilteredReservations.filter((r) => r.guest_category === categoryFilter);

    const list = [...filtered];
    if (sortOrder === 'recently_added') {
      list.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime() || 0;
        const timeB = new Date(b.created_at).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return b.reservation_code.localeCompare(a.reservation_code);
      });
    } else if (sortOrder === 'nearest') {
      list.sort((a, b) => {
        if (a.reservation_date !== b.reservation_date) {
          return a.reservation_date.localeCompare(b.reservation_date);
        }
        return a.reservation_time.localeCompare(b.reservation_time);
      });
    } else if (sortOrder === 'newest_first') {
      list.sort((a, b) => {
        if (a.reservation_date !== b.reservation_date) {
          return b.reservation_date.localeCompare(a.reservation_date);
        }
        return b.reservation_time.localeCompare(a.reservation_time);
      });
    }
    return list;
  }, [baseFilteredReservations, categoryFilter, sortOrder]);

  // Filtered Jembol Records (respecting Home Period + Date Range + Search)
  const filteredJembolRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = jembolRecords.filter((item) => {
      if (q) {
        const matches =
          item.nama.toLowerCase().includes(q) ||
          item.no_hp.toLowerCase().includes(q) ||
          item.treatment.toLowerCase().includes(q) ||
          item.alamat.toLowerCase().includes(q) ||
          item.tau_dari_mana.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return matchesHomePeriod(item.tanggal);
    });

    list.sort((a, b) => {
      if (sortOrder === 'newest_first') {
        return (b.tanggal || '').localeCompare(a.tanggal || '');
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [jembolRecords, searchQuery, periodFilter, effectiveStart, effectiveEnd, sortOrder]);

  // Jembol Split Counts: Visit Aja vs Trial Treatment vs Ambil Voucher
  const jembolSummary = useMemo(() => {
    let visitAja = 0;
    let trialTreatment = 0;
    let ambilVoucher = 0;
    for (const item of filteredJembolRecords) {
      if (item.jembol_type === 'Trial Treatment') trialTreatment++;
      else if (item.jembol_type === 'Ambil Voucher') ambilVoucher++;
      else visitAja++;
    }
    return {
      total: filteredJembolRecords.length,
      visitAja,
      trialTreatment,
      ambilVoucher,
    };
  }, [filteredJembolRecords]);

  // Filtered Visit Records (respecting Home Period + Date Range + Search)
  const filteredVisitRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = visitRecords.filter((item) => {
      if (q) {
        const matches =
          item.nama.toLowerCase().includes(q) ||
          item.no_hp.toLowerCase().includes(q) ||
          item.treatment.toLowerCase().includes(q) ||
          item.alamat.toLowerCase().includes(q) ||
          item.tau_dari_mana.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return matchesHomePeriod(item.tanggal);
    });

    list.sort((a, b) => {
      if (sortOrder === 'newest_first') {
        return (b.tanggal || '').localeCompare(a.tanggal || '');
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [visitRecords, searchQuery, periodFilter, effectiveStart, effectiveEnd, sortOrder]);

  // Status summary chips
  const statusSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    const source =
      categoryFilter === 'all'
        ? baseFilteredReservations
        : baseFilteredReservations.filter((r) => r.guest_category === categoryFilter);
    for (const r of source) {
      counts[r.status] = (counts[r.status] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [baseFilteredReservations, categoryFilter]);

  const handleResetFilters = () => {
    setPeriodFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setCategoryFilter('all');
    setSourceFilter('all');
    setStatusFilter('all');
    setTreatmentFilter('all');
    setSortOrder('recently_added');
  };

  const hasActiveFilters =
    periodFilter !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(searchQuery.trim()) ||
    categoryFilter !== 'all' ||
    sourceFilter !== 'all' ||
    statusFilter !== 'all' ||
    treatmentFilter !== 'all';

  const activeAdvancedFilterCount =
    (categoryFilter !== 'all' ? 1 : 0) +
    (sourceFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (treatmentFilter !== 'all' ? 1 : 0) +
    (sortOrder !== 'recently_added' ? 1 : 0);

  return (
    <div className="space-y-5 md:space-y-7 max-w-6xl mx-auto">
      {/* Welcome Banner / Overview Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-[#223749] tracking-tight">
            Reservation &amp; Activity Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#647b8e] mt-0.5">
            Ringkasan reservasi, kategori tamu, data jembol, dan kunjungan tamu
          </p>
        </div>

        {/* Action Buttons (Tablet & Desktop; HP uses bottom footer +) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onNavigateToCalendar}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#4eafde] text-[#16567d] hover:bg-[#e8f5fb] font-semibold text-sm transition-colors shadow-xs flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-[#4eafde]" />
            <span>View Calendar</span>
          </button>
          <button
            onClick={onOpenNewData}
            className="px-4 py-2.5 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-sm transition-colors shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Data</span>
          </button>
        </div>
      </div>

      {/* 3 Core Summary Cards (2-col balanced grid on HP, 3-col on Tablet/Desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {/* Card 1: Today's Reservations */}
        <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-[#E4EBF0] shadow-xs hover:border-[#4eafde]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#647b8e]">
              Today&apos;s Reservations
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#e8f5fb] text-[#4eafde] flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#223749] tabular-nums">
                {stats.todayCount}
              </span>
              <span className="text-xs text-[#647b8e]">reservasi</span>
            </div>
            <button
              type="button"
              onClick={onNavigateToCalendar}
              className="md:hidden text-xs font-semibold text-[#4eafde] hover:underline"
            >
              Calendar &rarr;
            </button>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#E4EBF0]/60 text-xs text-[#647b8e]">
            Jadwal reservasi untuk hari ini
          </div>
        </div>

        {/* Card 2: This Week */}
        <div className="col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-[#E4EBF0] shadow-xs hover:border-[#4eafde]/50 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#647b8e]">
              This Week
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#e8f5fb] text-[#4eafde] flex items-center justify-center shrink-0">
              <CalendarRange className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-bold text-[#223749] tabular-nums">
              {stats.thisWeekCount}
            </span>
            <span className="text-[11px] sm:text-xs text-[#647b8e]">reservasi</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#E4EBF0]/60 text-[11px] sm:text-xs text-[#647b8e]">
            <span className="sm:hidden">Minggu ini</span>
            <span className="hidden sm:inline">Total minggu berjalan (Senin–Minggu)</span>
          </div>
        </div>

        {/* Card 3: This Month */}
        <div className="col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-[#E4EBF0] shadow-xs hover:border-[#4eafde]/50 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#647b8e]">
              This Month
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#e8f5fb] text-[#4eafde] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-bold text-[#223749] tabular-nums">
              {stats.thisMonthCount}
            </span>
            <span className="text-[11px] sm:text-xs text-[#647b8e]">reservasi</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#E4EBF0]/60 text-[11px] sm:text-xs text-[#647b8e]">
            <span className="sm:hidden">Bulan ini</span>
            <span className="hidden sm:inline">Akumulasi bulan berjalan</span>
          </div>
        </div>
      </div>

      {/* ==================== HOME FILTER BAR ==================== */}
      <div className="space-y-3">
        {/* Quick Period Tabs + Rentang Tanggal */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {(
            [
              { key: 'all', label: 'Semua', count: periodCounts.all },
              { key: 'today', label: 'Hari Ini', count: periodCounts.today },
              { key: 'this_week', label: 'Minggu Ini', count: periodCounts.this_week },
              { key: 'this_month', label: 'Bulan Ini', count: periodCounts.this_month },
            ] as const
          ).map((tab) => {
            const isActive = periodFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPeriodFilter(tab.key)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between sm:justify-start gap-2 ${
                  isActive
                    ? 'bg-[#4eafde] text-white border-[#4eafde] shadow-xs'
                    : 'bg-white text-[#647b8e] border-[#E4EBF0] hover:bg-[#f4fafc] hover:text-[#223749]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-[#f4fafc] text-[#16567d] border border-[#E4EBF0]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setPeriodFilter('range')}
            className={`col-span-2 sm:col-span-1 min-h-[40px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center sm:justify-start gap-2 ${
              periodFilter === 'range'
                ? 'bg-[#4eafde] text-white border-[#4eafde] shadow-xs'
                : 'bg-white text-[#647b8e] border-[#E4EBF0] hover:bg-[#f4fafc] hover:text-[#223749]'
            }`}
          >
            <span>Rentang Tanggal</span>
            {periodFilter === 'range' && (startDate || endDate) && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white/25 text-white tabular-nums">
                {categoryBreakdown.total}
              </span>
            )}
          </button>
        </div>

        {/* Inline Date Range Inputs */}
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

        {/* Search & Advanced Filters */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E4EBF0] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#647b8e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nama, Anak, No. HP/WA, atau ID..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className={`md:hidden min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                showMobileFilters || activeAdvancedFilterCount > 0
                  ? 'bg-[#e8f5fb] text-[#16567d] border-[#4eafde]/60'
                  : 'bg-[#FAFDFE] text-[#647b8e] border-[#E4EBF0]'
              }`}
              aria-expanded={showMobileFilters}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
              {activeAdvancedFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#4eafde] text-white text-[10px] font-bold leading-none">
                  {activeAdvancedFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showMobileFilters ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          <div
            className={`${
              showMobileFilters ? 'grid' : 'hidden'
            } md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1`}
          >
            <div>
              <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
                Kategori Tamu
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | GuestCategory)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
              >
                <option value="all">Semua Kategori</option>
                <option value="Trial">Trial (Biru)</option>
                <option value="Pelanggan">Pelanggan (Hijau)</option>
                <option value="Influencer">Influencer (Ungu)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
                Sumber Tamu
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
              >
                <option value="all">Semua Sumber</option>
                {GUEST_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
              >
                <option value="all">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-in">Checked-in</option>
                <option value="In Treatment">In Treatment</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No Show">No Show</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
                Treatment
              </label>
              <select
                value={treatmentFilter}
                onChange={(e) => setTreatmentFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
              >
                <option value="all">Semua Treatment</option>
                {treatments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
                Urutan Daftar
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
              >
                <option value="recently_added">Input Terbaru</option>
                <option value="nearest">Jadwal Terdekat</option>
                <option value="newest_first">Tanggal Terbaru &darr;</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="pt-2 flex items-center justify-between border-t border-[#E4EBF0]/60">
              <span className="text-xs text-[#647b8e]">
                Filter aktif: <strong className="text-[#223749]">{finalFilteredReservations.length}</strong> reservasi ·{' '}
                <strong className="text-[#92400E]">{jembolSummary.total}</strong> jembol ·{' '}
                <strong className="text-[#0F766E]">{filteredVisitRecords.length}</strong> visit
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#4eafde] hover:text-[#3ea0cf] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== REKAP KATEGORI TAMU (TRIAL / PELANGGAN / INFLUENCER) ==================== */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#223749]">
              Rekap Kategori Tamu
            </h3>
            <p className="text-xs text-[#647b8e] mt-0.5">
              Jumlah Trial, Pelanggan, dan Influencer sesuai filter aktif (ketuk kartu untuk menyaring daftar)
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f4fafc] border border-[#E4EBF0] text-xs font-bold text-[#16567d] self-start sm:self-auto tabular-nums">
            <span>Total: {categoryBreakdown.total} Tamu</span>
          </div>
        </div>

        {/* 3 Category Stat Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {(
            [
              {
                key: 'Trial' as GuestCategory,
                label: 'Trial',
                sublabel: 'Sesi Percobaan',
                count: categoryBreakdown.Trial.count,
                pct: categoryBreakdown.Trial.pct,
                ringColor: 'ring-[#0EA5E9]',
              },
              {
                key: 'Pelanggan' as GuestCategory,
                label: 'Pelanggan',
                sublabel: 'Reguler / Member',
                count: categoryBreakdown.Pelanggan.count,
                pct: categoryBreakdown.Pelanggan.pct,
                ringColor: 'ring-[#16A34A]',
              },
              {
                key: 'Influencer' as GuestCategory,
                label: 'Influencer',
                sublabel: 'KOL / Media',
                count: categoryBreakdown.Influencer.count,
                pct: categoryBreakdown.Influencer.pct,
                ringColor: 'ring-[#9333EA]',
              },
            ] as const
          ).map((item) => {
            const theme = getCategoryTheme(item.key);
            const isSelected = categoryFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setCategoryFilter((prev) => (prev === item.key ? 'all' : item.key));
                  setHomeListTab('reservations');
                }}
                className={`p-2.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer overflow-hidden min-w-0 ${
                  theme.accentBorderClass
                } ${
                  isSelected
                    ? `ring-2 ${item.ringColor} shadow-sm scale-[1.01]`
                    : 'hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span
                    className={`inline-flex items-center text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md border truncate max-w-full ${theme.badgeClass}`}
                  >
                    {item.label}
                  </span>
                  <span className="hidden sm:inline-block text-xs font-bold text-[#4E6273] tabular-nums shrink-0">
                    {item.pct}%
                  </span>
                </div>

                <div className="mt-2 sm:mt-3 flex items-baseline justify-between gap-1 flex-wrap">
                  <div className="flex items-baseline gap-1 min-w-0">
                    <span className="text-xl sm:text-3xl font-bold text-[#223749] tabular-nums">
                      {item.count}
                    </span>
                    <span className="hidden sm:inline text-xs text-[#647b8e]">tamu</span>
                  </div>
                  <span className="sm:hidden text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/85 text-[#4E6273] border border-black/5 tabular-nums shrink-0">
                    {item.pct}%
                  </span>
                </div>

                <div className="text-[10px] sm:text-xs text-[#647b8e] mt-1 truncate">
                  {isSelected ? 'Sedang difilter' : item.sublabel}
                </div>
              </button>
            );
          })}
        </div>

        {/* Proportional Category Composition Bar */}
        {categoryBreakdown.total > 0 && (
          <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden flex">
              {categoryBreakdown.Trial.count > 0 && (
                <div
                  className="bg-[#0EA5E9] transition-all duration-300"
                  style={{ width: `${(categoryBreakdown.Trial.count / categoryBreakdown.total) * 100}%` }}
                  title={`Trial: ${categoryBreakdown.Trial.count}`}
                />
              )}
              {categoryBreakdown.Pelanggan.count > 0 && (
                <div
                  className="bg-[#16A34A] transition-all duration-300"
                  style={{ width: `${(categoryBreakdown.Pelanggan.count / categoryBreakdown.total) * 100}%` }}
                  title={`Pelanggan: ${categoryBreakdown.Pelanggan.count}`}
                />
              )}
              {categoryBreakdown.Influencer.count > 0 && (
                <div
                  className="bg-[#9333EA] transition-all duration-300"
                  style={{ width: `${(categoryBreakdown.Influencer.count / categoryBreakdown.total) * 100}%` }}
                  title={`Influencer: ${categoryBreakdown.Influencer.count}`}
                />
              )}
            </div>

            {statusSummary.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#647b8e] mr-1">
                  Status:
                </span>
                {statusSummary.map(([st, cnt]) => {
                  const isActiveStatus = statusFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() =>
                        setStatusFilter((prev) => (prev === st ? 'all' : st))
                      }
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors tabular-nums ${
                        isActiveStatus
                          ? 'bg-[#4eafde] text-white border-[#4eafde]'
                          : 'bg-[#FAFDFE] text-[#4E6273] border-[#E4EBF0] hover:border-[#4eafde]'
                      }`}
                    >
                      {st}: <span className="font-bold">{cnt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== RINGKASAN DATA JEMBOL & DATA VISIT ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Summary Card: Data Jembol (Visit Aja vs Trial Treatment) */}
        <div
          onClick={() => setHomeListTab('jembol')}
          className={`rounded-2xl border-2 p-4 sm:p-5 transition-all cursor-pointer ${
            homeListTab === 'jembol'
              ? 'border-[#D97706] bg-[#FFFBEB]/85 ring-2 ring-[#F59E0B]/25 shadow-xs'
              : 'border-[#FDE68A] bg-white hover:bg-[#FFFBEB]/40'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#223749]">
                  Data Jembol
                </h3>
                <p className="text-[11px] text-[#647b8e]">
                  Terpisah: Visit Aja, Trial Treatment &amp; Ambil Voucher
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToJembolVisit('jembol');
              }}
              className="text-xs font-bold text-[#D97706] hover:underline shrink-0"
            >
              Kelola &rarr;
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-[#E4EBF0]">
              <span className="text-[10px] font-semibold text-[#647b8e] uppercase block">
                Total
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#223749] tabular-nums">
                {jembolSummary.total}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FEF3C7]/70 border border-[#FDE68A]">
              <span className="text-[10px] font-bold text-[#92400E] uppercase block truncate">
                Visit Aja
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#78350F] tabular-nums">
                {jembolSummary.visitAja}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E0F2FE]/80 border border-[#BAE6FD]">
              <span className="text-[10px] font-bold text-[#0369A1] uppercase block truncate">
                Trial Treat.
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#0C4A6E] tabular-nums">
                {jembolSummary.trialTreatment}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#EDE9FE]/80 border border-[#DDD6FE]">
              <span className="text-[10px] font-bold text-[#5B21B6] uppercase block truncate">
                Voucher
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#4C1D95] tabular-nums">
                {jembolSummary.ambilVoucher}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Card: Data Visit */}
        <div
          onClick={() => setHomeListTab('visit')}
          className={`rounded-2xl border-2 p-4 sm:p-5 transition-all cursor-pointer ${
            homeListTab === 'visit'
              ? 'border-[#0D9488] bg-[#F0FDFA]/85 ring-2 ring-[#0D9488]/25 shadow-xs'
              : 'border-[#99F6E4] bg-white hover:bg-[#F0FDFA]/40'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shrink-0">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#223749]">
                  Data Visit
                </h3>
                <p className="text-[11px] text-[#647b8e]">
                  Data kunjungan tamu &amp; kesan pesan
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToJembolVisit('visit');
              }}
              className="text-xs font-bold text-[#0D9488] hover:underline shrink-0"
            >
              Kelola &rarr;
            </button>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-[#0F766E] uppercase block">
                Total Visit Sesuai Filter
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-bold text-[#134E4A] tabular-nums">
                  {filteredVisitRecords.length}
                </span>
                <span className="text-xs text-[#0F766E]">kunjungan</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#CCFBF1] text-[#0F766E]">
              {homeListTab === 'visit' ? 'Ditampilkan di bawah' : 'Ketuk untuk lihat daftar'}
            </span>
          </div>
        </div>
      </div>

      {/* ==================== TABBED DATA LIST AT HOME (RESERVASI / JEMBOL / VISIT) ==================== */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs p-4 sm:p-6">
        {/* List Header + Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 sm:pb-4 border-b border-[#E4EBF0] gap-3">
          <div className="grid grid-cols-3 sm:inline-flex p-1 rounded-xl bg-[#F4FAFC] border border-[#E4EBF0] gap-1">
            <button
              type="button"
              onClick={() => setHomeListTab('reservations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                homeListTab === 'reservations'
                  ? 'bg-white text-[#16567d] shadow-2xs border border-[#4eafde]/40'
                  : 'text-[#647b8e] hover:text-[#223749]'
              }`}
            >
              <span>Reservasi</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e8f5fb] text-[#16567d] tabular-nums">
                {finalFilteredReservations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHomeListTab('jembol')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                homeListTab === 'jembol'
                  ? 'bg-white text-[#92400E] shadow-2xs border border-[#F59E0B]/50'
                  : 'text-[#647b8e] hover:text-[#223749]'
              }`}
            >
              <span>Jembol</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] tabular-nums">
                {filteredJembolRecords.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHomeListTab('visit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                homeListTab === 'visit'
                  ? 'bg-white text-[#0F766E] shadow-2xs border border-[#0D9488]/50'
                  : 'text-[#647b8e] hover:text-[#223749]'
              }`}
            >
              <span>Visit</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] tabular-nums">
                {filteredVisitRecords.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (homeListTab === 'reservations') onNavigateToReservations();
              else if (homeListTab === 'jembol') onNavigateToJembolVisit('jembol');
              else onNavigateToJembolVisit('visit');
            }}
            className="text-xs font-semibold text-[#4eafde] hover:text-[#3ea0cf] hover:underline self-end md:self-auto"
          >
            Kelola Semua Data &rarr;
          </button>
        </div>

        {/* List Content */}
        <div className="mt-3 sm:mt-4">
          {homeListTab === 'reservations' && (
            <>
              {finalFilteredReservations.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <div className="w-12 h-12 rounded-2xl bg-[#f4fafc] border border-[#E4EBF0] flex items-center justify-center mx-auto text-[#647b8e]">
                    <Clock className="w-6 h-6 text-[#647b8e]" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#223749]">
                    Tidak ada data reservasi untuk filter ini.
                  </p>
                  <p className="text-xs text-[#647b8e] mt-1">
                    Ubah filter atau tambah data baru sekarang.
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 px-4 py-2 rounded-xl border border-[#4eafde] text-[#16567d] hover:bg-[#e8f5fb] font-semibold text-xs transition-colors"
                    >
                      Reset Filter
                    </button>
                  ) : (
                    <button
                      onClick={onOpenNewData}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-xs transition-colors"
                    >
                      + New Data
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-[#E4EBF0]">
                    {finalFilteredReservations.slice(0, 10).map((item) => {
                      const catTheme = getCategoryTheme(item.guest_category);
                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectReservation(item)}
                          className="py-3.5 px-2.5 sm:px-3 -mx-2.5 sm:-mx-3 rounded-xl hover:bg-[#f4fafc] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 group"
                        >
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                            <div className={`px-2.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm tabular-nums shrink-0 border ${catTheme.timeChipClass}`}>
                              {item.reservation_time}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="font-semibold text-sm text-[#223749] group-hover:text-[#16567d] transition-colors">
                                  {item.mom_name}
                                </span>
                                <CategoryBadge category={item.guest_category} />
                                <span className="text-xs text-[#647b8e]">
                                  ({item.child_name} · {item.child_age})
                                </span>
                              </div>
                              <div className="text-xs text-[#647b8e] mt-0.5 truncate">
                                {item.treatment_name} · {formatShortDate(item.reservation_date)} · {item.guest_source || 'Tamu reguler'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-12 sm:pl-0">
                            <StatusBadge status={item.status} size="sm" />
                            <span className="text-xs text-[#4eafde] sm:text-[#647b8e] group-hover:text-[#223749] font-medium">
                              Detail &rarr;
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {finalFilteredReservations.length > 10 && (
                    <div className="pt-4 mt-2 border-t border-[#E4EBF0] text-center">
                      <button
                        type="button"
                        onClick={onNavigateToReservations}
                        className="px-4 py-2 rounded-xl bg-[#f4fafc] hover:bg-[#e8f5fb] border border-[#4eafde]/40 text-xs font-bold text-[#16567d] transition-colors"
                      >
                        Lihat semua {finalFilteredReservations.length} reservasi &rarr;
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {homeListTab === 'jembol' && (
            <>
              {filteredJembolRecords.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center mx-auto text-[#D97706]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#223749]">
                    Belum ada Data Jembol untuk filter ini.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenNewData}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs"
                  >
                    + New Data
                  </button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-[#E4EBF0]">
                    {filteredJembolRecords.slice(0, 10).map((item) => {
                      const isTrial = item.jembol_type === 'Trial Treatment';
                      const isVoucher = item.jembol_type === 'Ambil Voucher';
                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectJembol(item)}
                          className={`py-3.5 px-2.5 sm:px-3 -mx-2.5 sm:-mx-3 rounded-xl transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 group ${
                            isTrial
                              ? 'hover:bg-[#F0F9FF]/70'
                              : isVoucher
                              ? 'hover:bg-[#F5F3FF]/70'
                              : 'hover:bg-[#FFFBEB]/60'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-md border shrink-0 ${
                                isTrial
                                  ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]'
                                  : isVoucher
                                  ? 'bg-[#EDE9FE] text-[#5B21B6] border-[#DDD6FE]'
                                  : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                              }`}
                            >
                              {item.jembol_type}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-[#223749] truncate">
                                {item.nama || 'Tanpa Nama'}
                              </div>
                              <div className="text-xs text-[#647b8e] truncate">
                                {item.tanggal ? formatShortDate(item.tanggal) : 'Tanpa tanggal'}
                                {item.treatment ? ` · ${item.treatment}` : ''}
                                {item.tau_dari_mana ? ` · ${item.tau_dari_mana}` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2.5">
                            <span className="text-xs text-[#647b8e] tabular-nums">
                              {item.no_hp || '-'}
                            </span>
                            <span className="text-xs text-[#D97706] font-semibold">
                              Detail &rarr;
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredJembolRecords.length > 10 && (
                    <div className="pt-4 mt-2 border-t border-[#E4EBF0] text-center">
                      <button
                        type="button"
                        onClick={() => onNavigateToJembolVisit('jembol')}
                        className="px-4 py-2 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-xs font-bold text-[#92400E] transition-colors"
                      >
                        Lihat semua {filteredJembolRecords.length} Data Jembol &rarr;
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {homeListTab === 'visit' && (
            <>
              {filteredVisitRecords.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center mx-auto text-[#0D9488]">
                    <Footprints className="w-6 h-6" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#223749]">
                    Belum ada Data Visit untuk filter ini.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenNewData}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs"
                  >
                    + New Data
                  </button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-[#E4EBF0]">
                    {filteredVisitRecords.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectVisit(item)}
                        className="py-3.5 px-2.5 sm:px-3 -mx-2.5 sm:-mx-3 rounded-xl hover:bg-[#F0FDFA]/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md border bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4] shrink-0">
                            Visit
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-[#223749] truncate">
                              {item.nama || 'Tanpa Nama'}
                            </div>
                            <div className="text-xs text-[#647b8e] truncate">
                              {item.tanggal ? formatShortDate(item.tanggal) : 'Tanpa tanggal'}
                              {item.treatment ? ` · ${item.treatment}` : ''}
                              {item.tau_dari_mana ? ` · ${item.tau_dari_mana}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2.5">
                          <span className="text-xs text-[#647b8e] tabular-nums">
                            {item.no_hp || '-'}
                          </span>
                          <span className="text-xs text-[#0D9488] font-semibold">
                            Detail &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredVisitRecords.length > 10 && (
                    <div className="pt-4 mt-2 border-t border-[#E4EBF0] text-center">
                      <button
                        type="button"
                        onClick={() => onNavigateToJembolVisit('visit')}
                        className="px-4 py-2 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] text-xs font-bold text-[#0F766E] transition-colors"
                      >
                        Lihat semua {filteredVisitRecords.length} Data Visit &rarr;
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
