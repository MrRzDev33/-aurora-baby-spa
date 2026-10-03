import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  CalendarViewType,
  ReservationWithTreatment,
} from '../../types';
import {
  ENGLISH_MONTHS_SHORT,
  INDONESIAN_DAYS,
  INDONESIAN_MONTHS,
  formatFullIndonesianDate,
  formatIndonesianDate,
  getCurrentDateString,
  getShortTreatmentName,
} from '../../utils/dateUtils';
import { StatusBadge } from '../ui/StatusBadge';

interface CalendarViewProps {
  reservations: ReservationWithTreatment[];
  onSelectReservation: (reservation: ReservationWithTreatment) => void;
  onOpenNewReservationForDate?: (dateStr: string) => void;
  onOpenNewReservation: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  reservations,
  onSelectReservation,
  onOpenNewReservationForDate,
  onOpenNewReservation,
}) => {
  // Reference date: start in October 2026 (or today's month)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Default to 2026-10-09 or today
    const now = new Date();
    // If today is in 2026, use now, else initialize to October 2026
    if (now.getFullYear() === 2026) return now;
    return new Date(2026, 9, 9);
  });

  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-09');
  const [isDayPanelOpen, setIsDayPanelOpen] = useState<boolean>(false);

  const todayStr = getCurrentDateString();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Navigation handlers
  const handlePrev = () => {
    if (viewType === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewType === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
      const str = formatDateToISO(d);
      setSelectedDateStr(str);
    }
  };

  const handleNext = () => {
    if (viewType === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewType === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
      const str = formatDateToISO(d);
      setSelectedDateStr(str);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(todayStr);
  };

  function formatDateToISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Group reservations by date (YYYY-MM-DD)
  const reservationsByDate = React.useMemo(() => {
    const map = new Map<string, ReservationWithTreatment[]>();
    for (const r of reservations) {
      const list = map.get(r.reservation_date) || [];
      list.push(r);
      map.set(r.reservation_date, list);
    }
    // Sort each list by time
    map.forEach((list) => {
      list.sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
    });
    return map;
  }, [reservations]);

  // Selected date reservations
  const selectedDateReservations = reservationsByDate.get(selectedDateStr) || [];

  // Generate Month Grid days
  const monthDays = React.useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday as start of week: 0 = Mon, ..., 6 = Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month filler days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth, -i);
      days.push({
        date: d,
        dateStr: formatDateToISO(d),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({
        date: d,
        dateStr: formatDateToISO(d),
        isCurrentMonth: true,
      });
    }

    // Next month filler days (fill up to 35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: d,
        dateStr: formatDateToISO(d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Generate Week Days
  const weekDays = React.useMemo(() => {
    const ref = new Date(currentDate);
    const dayOfWeek = ref.getDay();
    const diffToMonday = ref.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(ref.setDate(diffToMonday));

    const days: { date: Date; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        date: d,
        dateStr: formatDateToISO(d),
      });
    }
    return days;
  }, [currentDate]);

  const handleDateClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setIsDayPanelOpen(true);
  };

  const handleOpenAddForCurrentDate = () => {
    if (onOpenNewReservationForDate) {
      onOpenNewReservationForDate(selectedDateStr);
    } else {
      onOpenNewReservation();
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Top Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4EBF0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Month/Year title & Navigation buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-xl border border-[#E4EBF0] hover:bg-[#F5FAFD] text-[#263746] flex items-center justify-center transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-xl border border-[#E4EBF0] hover:bg-[#F5FAFD] text-[#263746] flex items-center justify-center transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-[#E4EBF0] hover:bg-[#F5FAFD] text-xs font-semibold text-[#263746] transition-colors"
          >
            Hari Ini
          </button>

          <h2 className="text-lg sm:text-xl font-bold text-[#263746] tracking-tight ml-2">
            {INDONESIAN_MONTHS[currentMonth]} {currentYear}
          </h2>
        </div>

        {/* Right: View Switcher (Month, Week, Day) */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#f4fafc] border border-[#E4EBF0] rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewType === 'month'
                  ? 'bg-white text-[#16567d] shadow-xs border border-[#4eafde]/50'
                  : 'text-[#647b8e] hover:text-[#223749]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewType === 'week'
                  ? 'bg-white text-[#16567d] shadow-xs border border-[#4eafde]/50'
                  : 'text-[#647b8e] hover:text-[#223749]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewType('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewType === 'day'
                  ? 'bg-white text-[#16567d] shadow-xs border border-[#4eafde]/50'
                  : 'text-[#647b8e] hover:text-[#223749]'
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={onOpenNewReservation}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Reservation</span>
          </button>
        </div>
      </div>

      {/* Main Calendar View Area */}
      <div className="relative">
        {/* ==================== MONTH VIEW ==================== */}
        {viewType === 'month' && (
          <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs overflow-hidden">
            {/* Day Header row */}
            <div className="grid grid-cols-7 border-b border-[#E4EBF0] bg-[#FAFDFE] text-center">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((dayName, idx) => (
                <div
                  key={dayName}
                  className={`py-3 text-xs font-semibold uppercase tracking-wider ${
                    idx >= 5 ? 'text-[#3575A3]' : 'text-[#71808F]'
                  }`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#E4EBF0]">
              {monthDays.map(({ date, dateStr, isCurrentMonth }) => {
                const dayReservations = reservationsByDate.get(dateStr) || [];
                const resCount = dayReservations.length;
                const isSelected = selectedDateStr === dateStr;
                const isCurrentToday = todayStr === dateStr;

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr)}
                    className={`min-h-[110px] sm:min-h-[125px] p-2 flex flex-col justify-between transition-colors cursor-pointer select-none ${
                      !isCurrentMonth ? 'bg-[#fafcfd]/60 opacity-50' : 'bg-white'
                    } ${
                      isSelected
                        ? 'ring-2 ring-inset ring-[#4eafde] bg-[#f4fafc]'
                        : 'hover:bg-[#f9fcfe]'
                    }`}
                  >
                    {/* Date Number & Count Badge */}
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-lg ${
                          isCurrentToday
                            ? 'bg-[#4eafde] text-white font-bold shadow-xs'
                            : isSelected
                            ? 'bg-[#e8f5fb] text-[#16567d]'
                            : isCurrentMonth
                            ? 'text-[#223749]'
                            : 'text-[#9AA7B4]'
                        }`}
                      >
                        {date.getDate()}
                      </span>

                      {/* Reservation count badge: "3 Reservations" or "1 Reservation" */}
                      {resCount > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#e8f5fb] text-[#16567d] border border-[#4eafde]/40 tabular-nums">
                          {resCount} {resCount === 1 ? 'Reservation' : 'Reservations'}
                        </span>
                      )}
                    </div>

                    {/* Events list: [Nama Moms] — [Treatment Short] */}
                    <div className="mt-2 space-y-1 overflow-hidden">
                      {dayReservations.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectReservation(item);
                          }}
                          className="px-2 py-1 rounded-md bg-[#e8f5fb] hover:bg-[#d8eef8] border border-[#4eafde]/40 text-[#16567d] text-[11px] font-medium truncate transition-colors flex items-center gap-1.5"
                          title={`${item.reservation_time} · ${item.mom_name} — ${item.treatment_name}`}
                        >
                          <span className="font-semibold tabular-nums shrink-0">
                            {item.reservation_time}
                          </span>
                          <span className="truncate">
                            {item.mom_name} — {getShortTreatmentName(item.treatment_name)}
                          </span>
                        </div>
                      ))}

                      {dayReservations.length > 2 && (
                        <div className="text-[10px] font-semibold text-[#4eafde] pl-1">
                          +{dayReservations.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== WEEK VIEW ==================== */}
        {viewType === 'week' && (
          <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-[#E4EBF0]">
              {weekDays.map(({ date, dateStr }) => {
                const dayReservations = reservationsByDate.get(dateStr) || [];
                const resCount = dayReservations.length;
                const isSelected = selectedDateStr === dateStr;
                const isCurrentToday = todayStr === dateStr;
                const dayIndex = date.getDay();

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr)}
                    className={`p-3 min-h-[350px] flex flex-col cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#f4fafc]' : 'bg-white hover:bg-[#f9fcfe]'
                    }`}
                  >
                    {/* Header */}
                    <div className="pb-3 border-b border-[#E4EBF0] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-[#647b8e] uppercase">
                          {INDONESIAN_DAYS[dayIndex]}
                        </div>
                        <div
                          className={`text-lg font-bold mt-0.5 inline-block ${
                            isCurrentToday
                              ? 'px-2 py-0.5 rounded-lg bg-[#4eafde] text-white'
                              : 'text-[#223749]'
                          }`}
                        >
                          {date.getDate()} {ENGLISH_MONTHS_SHORT[date.getMonth()]}
                        </div>
                      </div>

                      {resCount > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#e8f5fb] text-[#16567d] border border-[#4eafde]/40">
                          {resCount}
                        </span>
                      )}
                    </div>

                    {/* Events inside this day */}
                    <div className="mt-3 space-y-2 flex-1 overflow-y-auto">
                      {dayReservations.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#9AA7B4]">
                          Tidak ada reservasi
                        </div>
                      ) : (
                        dayReservations.map((item) => (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectReservation(item);
                            }}
                            className="p-2.5 rounded-xl bg-[#e8f5fb] hover:bg-[#d8eef8] border border-[#4eafde]/40 transition-colors text-left"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-[#16567d]">
                              <span>{item.reservation_time}</span>
                              <StatusBadge status={item.status} size="sm" />
                            </div>
                            <div className="text-sm font-semibold text-[#223749] mt-1 truncate">
                              {item.mom_name}
                            </div>
                            <div className="text-xs text-[#607283] truncate mt-0.5">
                              {item.treatment_name}
                            </div>
                            <div className="text-[11px] text-[#647b8e] mt-1">
                              Anak: {item.child_name}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== DAY VIEW ==================== */}
        {viewType === 'day' && (
          <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4EBF0]">
              <div>
                <h3 className="text-lg font-bold text-[#263746]">
                  {formatFullIndonesianDate(selectedDateStr)}
                </h3>
                <p className="text-xs text-[#71808F] mt-0.5">
                  {selectedDateReservations.length}{' '}
                  {selectedDateReservations.length === 1 ? 'Reservation' : 'Reservations'}
                </p>
              </div>
              <button
                onClick={handleOpenAddForCurrentDate}
                className="px-3.5 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add for this date</span>
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {selectedDateReservations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-2xl bg-[#f4fafc] border border-[#E4EBF0] flex items-center justify-center mx-auto text-[#647b8e]">
                    <CalendarIcon className="w-6 h-6 text-[#647b8e]" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#223749]">
                    No reservations for this date.
                  </p>
                  <p className="text-xs text-[#647b8e] mt-1">
                    Belum ada jadwal treatment yang dibuat pada tanggal ini.
                  </p>
                  <button
                    onClick={handleOpenAddForCurrentDate}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-xs transition-colors"
                  >
                    + Buat Reservasi
                  </button>
                </div>
              ) : (
                selectedDateReservations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectReservation(item)}
                    className="p-4 rounded-xl border border-[#E4EBF0] hover:border-[#4eafde] hover:bg-[#f4fafc] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="px-3 py-2 rounded-xl bg-[#e8f5fb] text-[#16567d] font-bold text-base tabular-nums border border-[#4eafde]/40 shrink-0">
                        {item.reservation_time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#223749] text-base">
                            {item.mom_name}
                          </span>
                          <span className="text-xs text-[#647b8e]">
                            · Anak: {item.child_name} ({item.child_age})
                          </span>
                        </div>
                        <div className="text-sm text-[#4E6273] font-medium mt-0.5">
                          {item.treatment_name}
                        </div>
                        <div className="text-xs text-[#647b8e] mt-1">
                          No. WA: {item.whatsapp} · Kategori: {item.guest_category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <StatusBadge status={item.status} />
                      <span className="text-xs text-[#4eafde] hover:text-[#3ea0cf] font-semibold">
                        Lihat Detail &rarr;
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================== DAY DETAIL DRAWER / POPUP ==================== */}
      {/* Triggered when user clicks a date in month or week view */}
      {isDayPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E4EBF0] flex items-center justify-between bg-[#f4fafc]/60">
              <div>
                <h3 className="text-base font-bold text-[#223749]">
                  {formatIndonesianDate(selectedDateStr)}
                </h3>
                <div className="mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#e8f5fb] text-[#16567d] border border-[#4eafde]/40">
                    {selectedDateReservations.length}{' '}
                    {selectedDateReservations.length === 1 ? 'Reservation' : 'Reservations'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDayPanelOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-[#E4EBF0] flex items-center justify-center text-[#647b8e] hover:text-[#223749]"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of reservations for this date */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {selectedDateReservations.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-8 h-8 text-[#647b8e] mx-auto opacity-50" />
                  <p className="mt-2 text-sm font-medium text-[#223749]">
                    No reservations for this date.
                  </p>
                  <p className="text-xs text-[#647b8e] mt-0.5">
                    Tidak ada jadwal perawatan pada tanggal ini.
                  </p>
                </div>
              ) : (
                selectedDateReservations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsDayPanelOpen(false);
                      onSelectReservation(item);
                    }}
                    className="p-3.5 rounded-xl border border-[#E4EBF0] hover:border-[#4eafde] hover:bg-[#f4fafc] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-[#e8f5fb] text-[#16567d] tabular-nums">
                          {item.reservation_time}
                        </span>
                        <span className="text-sm font-bold text-[#223749] group-hover:text-[#16567d] transition-colors">
                          {item.mom_name}
                        </span>
                      </div>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <div className="text-xs font-medium text-[#4B6071] mt-2">
                      {item.treatment_name}
                    </div>

                    <div className="text-[11px] text-[#647b8e] mt-1 flex items-center justify-between">
                      <span>Anak: {item.child_name} ({item.child_age})</span>
                      <span className="text-[#4eafde] group-hover:underline">Detail &rarr;</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E4EBF0] bg-[#FAFDFE] flex items-center justify-between gap-3">
              <button
                onClick={() => setIsDayPanelOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#647b8e] hover:bg-white hover:text-[#223749] transition-colors"
              >
                Tutup
              </button>

              <button
                onClick={() => {
                  setIsDayPanelOpen(false);
                  handleOpenAddForCurrentDate();
                }}
                className="px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Reservation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
