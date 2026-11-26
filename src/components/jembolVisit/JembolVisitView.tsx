import {
  AlertTriangle,
  ChevronDown,
  Edit2,
  ExternalLink,
  Footprints,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { JembolRecord, JembolType, VisitRecord } from '../../types';
import {
  formatShortDate,
  getWhatsAppLink,
  isInCurrentMonth,
  isInCurrentWeek,
  isToday,
} from '../../utils/dateUtils';

interface JembolVisitViewProps {
  jembolRecords: JembolRecord[];
  visitRecords: VisitRecord[];
  missingTables?: {
    jembolTableMissing: boolean;
    visitTableMissing: boolean;
  };
  initialSubTab?: 'jembol' | 'visit';
  onOpenNewJembol: () => void;
  onOpenNewVisit: () => void;
  onSelectJembol: (record: JembolRecord) => void;
  onEditJembol: (record: JembolRecord) => void;
  onDeleteJembol: (record: JembolRecord) => void;
  onSelectVisit: (record: VisitRecord) => void;
  onEditVisit: (record: VisitRecord) => void;
  onDeleteVisit: (record: VisitRecord) => void;
  onNavigateToSettings?: () => void;
}

export const JembolVisitView: React.FC<JembolVisitViewProps> = ({
  jembolRecords,
  visitRecords,
  missingTables,
  initialSubTab = 'jembol',
  onOpenNewJembol,
  onOpenNewVisit,
  onSelectJembol,
  onEditJembol,
  onDeleteJembol,
  onSelectVisit,
  onEditVisit,
  onDeleteVisit,
  onNavigateToSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'jembol' | 'visit'>(initialSubTab);

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  // Shared filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<
    'all' | 'today' | 'this_week' | 'this_month' | 'range'
  >('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [jembolTypeFilter, setJembolTypeFilter] = useState<'all' | JembolType>('all');
  const [sortOrder, setSortOrder] = useState<'recently_added' | 'newest_date' | 'oldest_date'>(
    'recently_added'
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Check date match
  const matchesPeriod = (dateStr: string): boolean => {
    if (periodFilter === 'all') return true;
    if (!dateStr) return false;
    if (periodFilter === 'today') return isToday(dateStr);
    if (periodFilter === 'this_week') return isInCurrentWeek(dateStr);
    if (periodFilter === 'this_month') return isInCurrentMonth(dateStr);
    if (periodFilter === 'range') {
      const effectiveStart = startDate && endDate && startDate > endDate ? endDate : startDate;
      const effectiveEnd = startDate && endDate && startDate > endDate ? startDate : endDate;
      if (effectiveStart && dateStr < effectiveStart) return false;
      if (effectiveEnd && dateStr > effectiveEnd) return false;
      return true;
    }
    return true;
  };

  const matchesSearch = (item: {
    nama: string;
    no_hp: string;
    alamat: string;
    treatment: string;
    tau_dari_mana: string;
    kesan_pesan: string;
    keterangan: string;
  }): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.nama.toLowerCase().includes(q) ||
      item.no_hp.toLowerCase().includes(q) ||
      item.alamat.toLowerCase().includes(q) ||
      item.treatment.toLowerCase().includes(q) ||
      item.tau_dari_mana.toLowerCase().includes(q) ||
      item.kesan_pesan.toLowerCase().includes(q) ||
      item.keterangan.toLowerCase().includes(q)
    );
  };

  // Period counts for active tab
  const periodCounts = useMemo(() => {
    const source = activeTab === 'jembol' ? jembolRecords : visitRecords;
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    for (const r of source) {
      if (r.tanggal && isToday(r.tanggal)) todayCount++;
      if (r.tanggal && isInCurrentWeek(r.tanggal)) weekCount++;
      if (r.tanggal && isInCurrentMonth(r.tanggal)) monthCount++;
    }
    return {
      all: source.length,
      today: todayCount,
      this_week: weekCount,
      this_month: monthCount,
    };
  }, [activeTab, jembolRecords, visitRecords]);

  // Jembol base-filtered (before jembolTypeFilter so Visit Aja vs Trial Treatment counts stay visible)
  const baseFilteredJembol = useMemo(() => {
    return jembolRecords.filter((item) => matchesSearch(item) && matchesPeriod(item.tanggal));
  }, [jembolRecords, searchQuery, periodFilter, startDate, endDate]);

  const jembolCounts = useMemo(() => {
    let visitAja = 0;
    let trialTreatment = 0;
    for (const item of baseFilteredJembol) {
      if (item.jembol_type === 'Trial Treatment') trialTreatment++;
      else visitAja++;
    }
    return {
      total: baseFilteredJembol.length,
      visitAja,
      trialTreatment,
    };
  }, [baseFilteredJembol]);

  const sortedJembol = useMemo(() => {
    const list =
      jembolTypeFilter === 'all'
        ? [...baseFilteredJembol]
        : baseFilteredJembol.filter((r) => r.jembol_type === jembolTypeFilter);

    list.sort((a, b) => {
      if (sortOrder === 'newest_date') {
        return (b.tanggal || '').localeCompare(a.tanggal || '');
      }
      if (sortOrder === 'oldest_date') {
        return (a.tanggal || '9999-99-99').localeCompare(b.tanggal || '9999-99-99');
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [baseFilteredJembol, jembolTypeFilter, sortOrder]);

  // Visit filtered & sorted
  const sortedVisits = useMemo(() => {
    const list = visitRecords.filter((item) => matchesSearch(item) && matchesPeriod(item.tanggal));
    list.sort((a, b) => {
      if (sortOrder === 'newest_date') {
        return (b.tanggal || '').localeCompare(a.tanggal || '');
      }
      if (sortOrder === 'oldest_date') {
        return (a.tanggal || '9999-99-99').localeCompare(b.tanggal || '9999-99-99');
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [visitRecords, searchQuery, periodFilter, startDate, endDate, sortOrder]);

  const visitStats = useMemo(() => {
    let todayCount = 0;
    let monthCount = 0;
    for (const item of visitRecords) {
      if (item.tanggal && isToday(item.tanggal)) todayCount++;
      if (item.tanggal && isInCurrentMonth(item.tanggal)) monthCount++;
    }
    return { total: sortedVisits.length, todayCount, monthCount };
  }, [visitRecords, sortedVisits.length]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setPeriodFilter('all');
    setStartDate('');
    setEndDate('');
    setJembolTypeFilter('all');
    setSortOrder('recently_added');
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    periodFilter !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    (activeTab === 'jembol' && jembolTypeFilter !== 'all') ||
    sortOrder !== 'recently_added';

  const activeListCount = activeTab === 'jembol' ? sortedJembol.length : sortedVisits.length;

  const showMissingBanner = Boolean(
    missingTables?.jembolTableMissing || missingTables?.visitTableMissing
  );

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      {/* Header Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-[#223749] tracking-tight">
            Data Jembol &amp; Visit
          </h2>
          <p className="text-xs sm:text-sm text-[#647b8e] mt-0.5">
            Kelola data jemput bola (Visit Aja &amp; Trial Treatment) serta kunjungan tamu
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={activeTab === 'jembol' ? onOpenNewJembol : onOpenNewVisit}
            className={`px-4 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs flex items-center gap-1.5 ${
              activeTab === 'jembol'
                ? 'bg-[#D97706] hover:bg-[#B45309]'
                : 'bg-[#0D9488] hover:bg-[#0F766E]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'jembol' ? '+ Data Jembol' : '+ Data Visit'}</span>
          </button>
        </div>
      </div>

      {/* Missing Table Hint Banner (non-blocking, localStorage fallback active) */}
      {showMissingBanner && (
        <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#92400E]">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <span>
              Tabel <code>jembol_records</code> / <code>visit_records</code> belum dijalankan di Supabase. Data sementara tersimpan di perangkat ini — jalankan script SQL terbaru di Supabase SQL Editor agar sinkron antar perangkat.
            </span>
          </div>
          {onNavigateToSettings && (
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#F59E0B]/50 text-[#92400E] font-bold hover:bg-[#FEF3C7] transition-colors shrink-0 self-start sm:self-auto"
            >
              Buka Settings SQL
            </button>
          )}
        </div>
      )}

      {/* Main Sub-Tab Switcher: Data Jembol | Data Visit */}
      <div className="p-1.5 bg-white border border-[#E4EBF0] rounded-2xl shadow-xs grid grid-cols-2 gap-1.5 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('jembol')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'jembol'
              ? 'bg-[#FFFBEB] text-[#92400E] border border-[#F59E0B]/60 shadow-2xs'
              : 'text-[#647b8e] hover:text-[#223749] hover:bg-[#FAFDFE]'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'jembol' ? 'text-[#D97706]' : ''}`} />
          <span>Data Jembol</span>
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-md tabular-nums ${
              activeTab === 'jembol'
                ? 'bg-[#D97706] text-white'
                : 'bg-[#f4fafc] text-[#16567d] border border-[#E4EBF0]'
            }`}
          >
            {jembolRecords.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visit')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'visit'
              ? 'bg-[#F0FDFA] text-[#134E4A] border border-[#0D9488]/50 shadow-2xs'
              : 'text-[#647b8e] hover:text-[#223749] hover:bg-[#FAFDFE]'
          }`}
        >
          <Footprints className={`w-4 h-4 ${activeTab === 'visit' ? 'text-[#0D9488]' : ''}`} />
          <span>Data Visit</span>
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-md tabular-nums ${
              activeTab === 'visit'
                ? 'bg-[#0D9488] text-white'
                : 'bg-[#f4fafc] text-[#16567d] border border-[#E4EBF0]'
            }`}
          >
            {visitRecords.length}
          </span>
        </button>
      </div>

      {/* ==================== SUMMARY CARDS ==================== */}
      {activeTab === 'jembol' ? (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {/* Card: Total Jembol */}
          <button
            type="button"
            onClick={() => setJembolTypeFilter('all')}
            className={`p-3.5 sm:p-5 rounded-2xl border-2 text-left transition-all bg-white ${
              jembolTypeFilter === 'all'
                ? 'border-[#4eafde] ring-2 ring-[#4eafde]/25 shadow-xs'
                : 'border-[#E4EBF0] hover:border-[#4eafde]/50'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#647b8e] block">
              Total Jembol
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#223749] tabular-nums">
                {jembolCounts.total}
              </span>
              <span className="hidden sm:inline text-xs text-[#647b8e]">data</span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#647b8e] mt-1 truncate">
              Semua tipe jembol
            </p>
          </button>

          {/* Card: Visit Aja */}
          <button
            type="button"
            onClick={() =>
              setJembolTypeFilter((prev) => (prev === 'Visit Aja' ? 'all' : 'Visit Aja'))
            }
            className={`p-3.5 sm:p-5 rounded-2xl border-2 text-left transition-all bg-[#FFFBEB]/70 ${
              jembolTypeFilter === 'Visit Aja'
                ? 'border-[#D97706] ring-2 ring-[#F59E0B]/35 shadow-sm'
                : 'border-[#FDE68A] hover:border-[#D97706]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#92400E] truncate">
                Visit Aja
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#78350F] tabular-nums">
                {jembolCounts.visitAja}
              </span>
              <span className="hidden sm:inline text-xs text-[#92400E]/80">data</span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#92400E]/80 mt-1 truncate">
              {jembolTypeFilter === 'Visit Aja' ? 'Sedang difilter' : 'Kunjungan saja'}
            </p>
          </button>

          {/* Card: Trial Treatment */}
          <button
            type="button"
            onClick={() =>
              setJembolTypeFilter((prev) =>
                prev === 'Trial Treatment' ? 'all' : 'Trial Treatment'
              )
            }
            className={`p-3.5 sm:p-5 rounded-2xl border-2 text-left transition-all bg-[#F0F9FF]/80 ${
              jembolTypeFilter === 'Trial Treatment'
                ? 'border-[#0EA5E9] ring-2 ring-[#0EA5E9]/35 shadow-sm'
                : 'border-[#BAE6FD] hover:border-[#0EA5E9]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0EA5E9] shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0369A1] truncate">
                Trial Treatment
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#0C4A6E] tabular-nums">
                {jembolCounts.trialTreatment}
              </span>
              <span className="hidden sm:inline text-xs text-[#0369A1]/80">data</span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#0369A1]/80 mt-1 truncate">
              {jembolTypeFilter === 'Trial Treatment' ? 'Sedang difilter' : 'Sesi percobaan'}
            </p>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-2xl border-2 border-[#99F6E4] bg-[#F0FDFA]/80">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0F766E] block">
              Visit Tercatat
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#134E4A] tabular-nums">
                {visitStats.total}
              </span>
              <span className="hidden sm:inline text-xs text-[#0F766E]">data</span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#0F766E]/80 mt-1 truncate">
              Sesuai filter aktif
            </p>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl border border-[#E4EBF0] bg-white">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#647b8e] block">
              Hari Ini
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#223749] tabular-nums">
                {visitStats.todayCount}
              </span>
              <span className="hidden sm:inline text-xs text-[#647b8e]">visit</span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#647b8e] mt-1 truncate">
              Kunjungan hari ini
            </p>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl border border-[#E4EBF0] bg-white">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#647b8e] block">
              Bulan Ini
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#223749] tabular-nums">
                {visitStats.monthCount}
              </span>
              <span className="hidden sm:inline text-xs text-[#647b8e]">visit</span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#647b8e] mt-1 truncate">
              Akumulasi bulan ini
            </p>
          </div>
        </div>
      )}

      {/* ==================== PERIOD CLASSIFICATION & DATE RANGE ==================== */}
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
        </button>
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

      {/* ==================== SEARCH & ADVANCED FILTERS ==================== */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#E4EBF0] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#647b8e] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama, No. HP, Alamat, Treatment, atau Tau Dari Mana..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className={`md:hidden min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
              showMobileFilters
                ? 'bg-[#e8f5fb] text-[#16567d] border-[#4eafde]/60'
                : 'bg-[#FAFDFE] text-[#647b8e] border-[#E4EBF0]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showMobileFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        <div
          className={`${showMobileFilters ? 'grid' : 'hidden'} md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1`}
        >
          {activeTab === 'jembol' && (
            <div>
              <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
                Jenis Jembol
              </label>
              <select
                value={jembolTypeFilter}
                onChange={(e) => setJembolTypeFilter(e.target.value as 'all' | JembolType)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
              >
                <option value="all">Semua Tipe Jembol</option>
                <option value="Visit Aja">Visit Aja</option>
                <option value="Trial Treatment">Trial Treatment</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
              Urutan
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
            >
              <option value="recently_added">Input Terbaru</option>
              <option value="newest_date">Tanggal Terbaru &darr;</option>
              <option value="oldest_date">Tanggal Terlama &uarr;</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between border-t border-[#E4EBF0]/60">
            <span className="text-xs text-[#647b8e]">
              Menampilkan <strong className="text-[#223749]">{activeListCount}</strong> data cocok
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4eafde] hover:text-[#3ea0cf] hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* ==================== DATA LIST / TABLE ==================== */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs overflow-hidden">
        {activeListCount === 0 ? (
          <div className="text-center py-14 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f4fafc] border border-[#E4EBF0] flex items-center justify-center mx-auto text-[#647b8e]">
              {activeTab === 'jembol' ? (
                <Sparkles className="w-6 h-6 text-[#D97706]" />
              ) : (
                <Footprints className="w-6 h-6 text-[#0D9488]" />
              )}
            </div>
            <p className="mt-3 text-base font-bold text-[#223749]">
              {activeTab === 'jembol' ? 'Belum ada Data Jembol.' : 'Belum ada Data Visit.'}
            </p>
            <p className="text-xs text-[#647b8e] mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Tidak ada data yang cocok dengan filter aktif.'
                : 'Tambahkan data baru melalui tombol di atas atau menu + New Data.'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl border border-[#4eafde] text-[#16567d] hover:bg-[#e8f5fb] font-semibold text-xs"
              >
                Reset Filter
              </button>
            ) : (
              <button
                type="button"
                onClick={activeTab === 'jembol' ? onOpenNewJembol : onOpenNewVisit}
                className={`mt-4 px-4 py-2 rounded-xl text-white font-semibold text-xs ${
                  activeTab === 'jembol'
                    ? 'bg-[#D97706] hover:bg-[#B45309]'
                    : 'bg-[#0D9488] hover:bg-[#0F766E]'
                }`}
              >
                {activeTab === 'jembol' ? '+ Input Data Jembol' : '+ Input Data Visit'}
              </button>
            )}
          </div>
        ) : activeTab === 'jembol' ? (
          <>
            {/* Desktop Table: Data Jembol */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E4EBF0] bg-[#FAFDFE] text-xs font-semibold text-[#647b8e] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-3">Jenis</th>
                    <th className="py-3.5 px-4">Nama</th>
                    <th className="py-3.5 px-4">No. HP</th>
                    <th className="py-3.5 px-4">Treatment</th>
                    <th className="py-3.5 px-4">Tau Dari Mana</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4EBF0]/70">
                  {sortedJembol.map((item) => {
                    const isTrial = item.jembol_type === 'Trial Treatment';
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isTrial ? 'hover:bg-[#F0F9FF]/70' : 'hover:bg-[#FFFBEB]/60'
                        }`}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#223749]">
                          {item.tanggal ? formatShortDate(item.tanggal) : '-'}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                              isTrial
                                ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]'
                                : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                            }`}
                          >
                            {item.jembol_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#223749]">{item.nama || '-'}</div>
                          {item.alamat && (
                            <div className="text-[11px] text-[#647b8e] truncate max-w-[200px]">
                              {item.alamat}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                          {item.no_hp ? (
                            <a
                              href={getWhatsAppLink(item.no_hp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#16567d] hover:underline font-medium tabular-nums"
                            >
                              <span>{item.no_hp}</span>
                              <ExternalLink className="w-3 h-3 text-[#4eafde]" />
                            </a>
                          ) : (
                            <span className="text-[#9AA7B4]">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-[#223749]">
                          {item.treatment || <span className="text-[#9AA7B4]">-</span>}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#4E6273]">
                          {item.tau_dari_mana || <span className="text-[#9AA7B4]">-</span>}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectJembol(item)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#E4EBF0] hover:border-[#4eafde] text-xs font-semibold text-[#16567d] hover:bg-[#e8f5fb]"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditJembol(item)}
                              className="p-1.5 rounded-lg hover:bg-white text-[#647b8e] hover:text-[#223749]"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteJembol(item)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[#647b8e] hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Cards: Data Jembol */}
            <div className="block lg:hidden p-3 sm:p-4 space-y-3 bg-[#FAFDFE]">
              {sortedJembol.map((item) => {
                const isTrial = item.jembol_type === 'Trial Treatment';
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectJembol(item)}
                    className={`p-4 rounded-xl border-2 cursor-pointer space-y-2.5 shadow-2xs ${
                      isTrial
                        ? 'border-[#BAE6FD] bg-[#F0F9FF]/70'
                        : 'border-[#FDE68A] bg-[#FFFBEB]/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md text-white ${
                          isTrial ? 'bg-[#0EA5E9]' : 'bg-[#D97706]'
                        }`}
                      >
                        {item.jembol_type}
                      </span>
                      <span className="text-xs font-semibold text-[#4E6273]">
                        {item.tanggal ? formatShortDate(item.tanggal) : 'Tanpa tanggal'}
                      </span>
                    </div>

                    <div>
                      <div className="text-base font-bold text-[#223749] truncate">
                        {item.nama || 'Tanpa Nama'}
                      </div>
                      {item.treatment && (
                        <div className="text-xs font-semibold text-[#16567d] mt-0.5">
                          {item.treatment}
                        </div>
                      )}
                      {item.alamat && (
                        <div className="text-xs text-[#647b8e] mt-0.5 truncate">{item.alamat}</div>
                      )}
                      {(item.tau_dari_mana || item.kesan_pesan) && (
                        <div className="text-[11px] text-[#4E6273] mt-1 truncate">
                          {item.tau_dari_mana ? `Sumber: ${item.tau_dari_mana}` : ''}
                          {item.tau_dari_mana && item.kesan_pesan ? ' · ' : ''}
                          {item.kesan_pesan ? `"${item.kesan_pesan}"` : ''}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-black/10 flex items-center justify-between gap-2">
                      <span className="text-xs text-[#4E6273] tabular-nums truncate">
                        {item.no_hp || '-'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectJembol(item);
                          }}
                          className="min-h-[36px] px-3 py-1 rounded-xl bg-white border border-[#E4EBF0] text-xs font-semibold text-[#16567d]"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditJembol(item);
                          }}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-white border border-[#E4EBF0] text-[#647b8e]"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteJembol(item);
                          }}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-white border border-red-200 text-red-500"
                          aria-label="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Desktop Table: Data Visit */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E4EBF0] bg-[#FAFDFE] text-xs font-semibold text-[#647b8e] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Nama</th>
                    <th className="py-3.5 px-4">No. HP</th>
                    <th className="py-3.5 px-4">Treatment</th>
                    <th className="py-3.5 px-4">Tau Dari Mana</th>
                    <th className="py-3.5 px-4">Kesan / Ket.</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4EBF0]/70">
                  {sortedVisits.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F0FDFA]/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#223749]">
                        {item.tanggal ? formatShortDate(item.tanggal) : '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#223749]">{item.nama || '-'}</div>
                        {item.alamat && (
                          <div className="text-[11px] text-[#647b8e] truncate max-w-[200px]">
                            {item.alamat}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        {item.no_hp ? (
                          <a
                            href={getWhatsAppLink(item.no_hp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0F766E] hover:underline font-medium tabular-nums"
                          >
                            <span>{item.no_hp}</span>
                            <ExternalLink className="w-3 h-3 text-[#0D9488]" />
                          </a>
                        ) : (
                          <span className="text-[#9AA7B4]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#223749]">
                        {item.treatment || <span className="text-[#9AA7B4]">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#4E6273]">
                        {item.tau_dari_mana || <span className="text-[#9AA7B4]">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#4E6273] max-w-[200px] truncate">
                        {item.kesan_pesan || item.keterangan || (
                          <span className="text-[#9AA7B4]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectVisit(item)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#E4EBF0] hover:border-[#0D9488] text-xs font-semibold text-[#0F766E] hover:bg-[#F0FDFA]"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditVisit(item)}
                            className="p-1.5 rounded-lg hover:bg-white text-[#647b8e] hover:text-[#223749]"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteVisit(item)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#647b8e] hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Cards: Data Visit */}
            <div className="block lg:hidden p-3 sm:p-4 space-y-3 bg-[#FAFDFE]">
              {sortedVisits.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectVisit(item)}
                  className="p-4 rounded-xl border-2 border-[#99F6E4] bg-[#F0FDFA]/70 cursor-pointer space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#0D9488] text-white">
                      Data Visit
                    </span>
                    <span className="text-xs font-semibold text-[#4E6273]">
                      {item.tanggal ? formatShortDate(item.tanggal) : 'Tanpa tanggal'}
                    </span>
                  </div>

                  <div>
                    <div className="text-base font-bold text-[#223749] truncate">
                      {item.nama || 'Tanpa Nama'}
                    </div>
                    {item.treatment && (
                      <div className="text-xs font-semibold text-[#0F766E] mt-0.5">
                        {item.treatment}
                      </div>
                    )}
                    {item.alamat && (
                      <div className="text-xs text-[#647b8e] mt-0.5 truncate">{item.alamat}</div>
                    )}
                    {(item.tau_dari_mana || item.kesan_pesan) && (
                      <div className="text-[11px] text-[#4E6273] mt-1 truncate">
                        {item.tau_dari_mana ? `Sumber: ${item.tau_dari_mana}` : ''}
                        {item.tau_dari_mana && item.kesan_pesan ? ' · ' : ''}
                        {item.kesan_pesan ? `"${item.kesan_pesan}"` : ''}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-black/10 flex items-center justify-between gap-2">
                    <span className="text-xs text-[#4E6273] tabular-nums truncate">
                      {item.no_hp || '-'}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVisit(item);
                        }}
                        className="min-h-[36px] px-3 py-1 rounded-xl bg-white border border-[#E4EBF0] text-xs font-semibold text-[#0F766E]"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditVisit(item);
                        }}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-white border border-[#E4EBF0] text-[#647b8e]"
                        aria-label="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteVisit(item);
                        }}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-white border border-red-200 text-red-500"
                        aria-label="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
