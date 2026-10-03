import {
  Edit2,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  ReservationWithTreatment,
  Treatment,
} from '../../types';
import {
  formatShortDate,
  getCurrentDateString,
  isInCurrentMonth,
  isInCurrentWeek,
  isToday,
} from '../../utils/dateUtils';
import { CategoryBadge, StatusBadge } from '../ui/StatusBadge';

interface ReservationListViewProps {
  reservations: ReservationWithTreatment[];
  treatments: Treatment[];
  onOpenNewReservation: () => void;
  onSelectReservation: (reservation: ReservationWithTreatment) => void;
  onEditReservation: (reservation: ReservationWithTreatment) => void;
  onDeleteReservation: (reservation: ReservationWithTreatment) => void;
}

export const ReservationListView: React.FC<ReservationListViewProps> = ({
  reservations,
  treatments,
  onOpenNewReservation,
  onSelectReservation,
  onEditReservation,
  onDeleteReservation,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [treatmentFilter, setTreatmentFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'nearest' | 'newest_first' | 'oldest_first'>('nearest');

  const todayStr = getCurrentDateString();

  // Helper for tomorrow string
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Filter & Search Logic
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // 1. Search Query (Nama Moms, Nama Anak, No. WhatsApp, Reservation ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesMom = r.mom_name.toLowerCase().includes(query);
        const matchesChild = r.child_name.toLowerCase().includes(query);
        const matchesPhone = r.whatsapp.toLowerCase().includes(query);
        const matchesCode = r.reservation_code.toLowerCase().includes(query);
        if (!matchesMom && !matchesChild && !matchesPhone && !matchesCode) {
          return false;
        }
      }

      // 2. Date Filter
      if (dateFilter === 'today') {
        if (!isToday(r.reservation_date)) return false;
      } else if (dateFilter === 'tomorrow') {
        if (r.reservation_date !== tomorrowStr) return false;
      } else if (dateFilter === 'this_week') {
        if (!isInCurrentWeek(r.reservation_date)) return false;
      } else if (dateFilter === 'this_month') {
        if (!isInCurrentMonth(r.reservation_date)) return false;
      } else if (dateFilter === 'custom' && customDate) {
        if (r.reservation_date !== customDate) return false;
      }

      // 3. Guest Category Filter
      if (categoryFilter !== 'all') {
        if (r.guest_category !== categoryFilter) return false;
      }

      // 4. Status Filter
      if (statusFilter !== 'all') {
        if (r.status !== statusFilter) return false;
      }

      // 5. Treatment Filter
      if (treatmentFilter !== 'all') {
        if (r.treatment_id !== treatmentFilter) return false;
      }

      return true;
    });
  }, [
    reservations,
    searchQuery,
    dateFilter,
    customDate,
    tomorrowStr,
    categoryFilter,
    statusFilter,
    treatmentFilter,
  ]);

  // Sorting
  const sortedReservations = useMemo(() => {
    const list = [...filteredReservations];
    if (sortOrder === 'nearest') {
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
    } else if (sortOrder === 'oldest_first') {
      list.sort((a, b) => {
        if (a.reservation_date !== b.reservation_date) {
          return a.reservation_date.localeCompare(b.reservation_date);
        }
        return a.reservation_time.localeCompare(b.reservation_time);
      });
    }
    return list;
  }, [filteredReservations, sortOrder]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setCustomDate('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setTreatmentFilter('all');
    setSortOrder('nearest');
  };

  const hasActiveFilters =
    searchQuery ||
    dateFilter !== 'all' ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    treatmentFilter !== 'all';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Title & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#223749] tracking-tight">
            Reservations
          </h2>
          <p className="text-sm text-[#647b8e] mt-0.5">
            Daftar lengkap seluruh jadwal reservasi spa ({sortedReservations.length} data)
          </p>
        </div>

        <button
          onClick={onOpenNewReservation}
          className="px-4 py-2.5 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-sm transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Reservation</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E4EBF0] shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#647b8e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan Nama Moms, Anak, No. WhatsApp, atau ID Reservasi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
              Tanggal
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="tomorrow">Besok</option>
              <option value="this_week">Minggu Ini</option>
              <option value="this_month">Bulan Ini</option>
              <option value="custom">Pilih Tanggal...</option>
            </select>
          </div>

          {/* Custom Date Input (if selected) */}
          {dateFilter === 'custom' && (
            <div>
              <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
                Pilih Tanggal Spesifik
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
              />
            </div>
          )}

          {/* Guest Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
              Kategori Tamu
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
            >
              <option value="all">Semua Kategori</option>
              <option value="Trial">Trial</option>
              <option value="Pelanggan">Pelanggan</option>
              <option value="Influencer">Influencer</option>
            </select>
          </div>

          {/* Status Filter */}
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
              <option value="Rescheduled">Rescheduled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          {/* Treatment Filter */}
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

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-semibold text-[#647b8e] uppercase tracking-wider mb-1">
              Urutan
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4EBF0] bg-white text-xs text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
            >
              <option value="nearest">Terdekat / Jadwal Depan</option>
              <option value="newest_first">Tanggal Terbaru &darr;</option>
              <option value="oldest_first">Tanggal Terlama &uarr;</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between border-t border-[#E4EBF0]/60">
            <span className="text-xs text-[#647b8e]">
              Menampilkan {sortedReservations.length} dari {reservations.length} reservasi
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4eafde] hover:text-[#3ea0cf] hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs overflow-hidden">
        {sortedReservations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f4fafc] border border-[#E4EBF0] flex items-center justify-center mx-auto text-[#647b8e]">
              <Search className="w-6 h-6 text-[#647b8e]" />
            </div>
            <p className="mt-3 text-base font-bold text-[#223749]">
              No reservations found.
            </p>
            <p className="text-xs text-[#647b8e] mt-1 max-w-sm mx-auto">
              Tidak ada data reservasi yang sesuai dengan kriteria pencarian atau filter yang dipilih.
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl border border-[#4eafde] text-[#16567d] hover:bg-[#e8f5fb] font-semibold text-xs transition-colors"
              >
                Hapus Filter
              </button>
            ) : (
              <button
                onClick={onOpenNewReservation}
                className="mt-4 px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-xs transition-colors"
              >
                + New Reservation
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E4EBF0] bg-[#FAFDFE] text-xs font-semibold text-[#647b8e] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-3">Time</th>
                    <th className="py-3.5 px-4">Mom</th>
                    <th className="py-3.5 px-4">Child</th>
                    <th className="py-3.5 px-4">Treatment</th>
                    <th className="py-3.5 px-3">Guest Category</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4EBF0]/70">
                  {sortedReservations.map((item) => {
                    const isItemToday = item.reservation_date === todayStr;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#f9fcfe] transition-colors ${
                          isItemToday ? 'bg-[#f4fafc]/60' : ''
                        }`}
                      >
                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-[#223749] block">
                            {formatShortDate(item.reservation_date)}
                          </span>
                          <span className="text-[11px] font-mono text-[#647b8e]">
                            {item.reservation_code}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-[#16567d] bg-[#e8f5fb] px-2 py-1 rounded-md text-xs tabular-nums border border-[#4eafde]/30">
                            {item.reservation_time}
                          </span>
                        </td>

                        {/* Mom */}
                        <td className="py-3.5 px-4 font-semibold text-[#223749] whitespace-nowrap">
                          {item.mom_name}
                        </td>

                        {/* Child */}
                        <td className="py-3.5 px-4 text-xs text-[#4F6272] whitespace-nowrap">
                          <span className="font-medium text-[#223749]">{item.child_name}</span>
                          <span className="block text-[11px] text-[#647b8e]">{item.child_age}</span>
                        </td>

                        {/* Treatment */}
                        <td className="py-3.5 px-4 text-xs font-medium text-[#223749]">
                          {item.treatment_name}
                        </td>

                        {/* Guest Category */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <CategoryBadge category={item.guest_category} />
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <StatusBadge status={item.status} size="sm" />
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => onSelectReservation(item)}
                              className="px-2.5 py-1 rounded-lg border border-[#E4EBF0] hover:border-[#4eafde] text-xs font-semibold text-[#16567d] hover:bg-[#e8f5fb] transition-colors"
                              title="View Detail"
                            >
                              View
                            </button>
                            <button
                              onClick={() => onEditReservation(item)}
                              className="p-1 rounded-lg hover:bg-[#f4fafc] text-[#647b8e] hover:text-[#223749] transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteReservation(item)}
                              className="p-1 rounded-lg hover:bg-red-50 text-[#647b8e] hover:text-red-600 transition-colors"
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

            {/* Mobile / Tablet Responsive Card List */}
            <div className="block lg:hidden divide-y divide-[#E4EBF0]">
              {sortedReservations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectReservation(item)}
                  className="p-4 hover:bg-[#f4fafc] transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs bg-[#e8f5fb] text-[#16567d] px-2 py-0.5 rounded-md border border-[#4eafde]/30 tabular-nums">
                        {item.reservation_time}
                      </span>
                      <span className="text-xs font-semibold text-[#647b8e]">
                        {formatShortDate(item.reservation_date)}
                      </span>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <div>
                    <div className="text-base font-bold text-[#223749]">
                      {item.mom_name}
                    </div>
                    <div className="text-xs text-[#647b8e] mt-0.5">
                      Anak: {item.child_name} · {item.child_age}
                    </div>
                    <div className="text-xs font-medium text-[#16567d] mt-1">
                      {item.treatment_name}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E4EBF0]/70 flex items-center justify-between text-xs">
                    <CategoryBadge category={item.guest_category} />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReservation(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#f4fafc] border border-[#E4EBF0] text-xs font-semibold text-[#16567d]"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditReservation(item);
                        }}
                        className="p-1 text-[#647b8e] hover:text-[#223749]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteReservation(item);
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
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
