import {
  Calendar as CalendarIcon,
  CalendarCheck2,
  CalendarRange,
  Clock,
  Plus,
  Users,
} from 'lucide-react';
import React from 'react';
import { DashboardStats, ReservationWithTreatment } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface DashboardViewProps {
  stats: DashboardStats;
  upcomingReservations: ReservationWithTreatment[];
  onOpenNewReservation: () => void;
  onNavigateToCalendar: () => void;
  onSelectReservation: (reservation: ReservationWithTreatment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  upcomingReservations,
  onOpenNewReservation,
  onNavigateToCalendar,
  onSelectReservation,
}) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner / Overview Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#223749] tracking-tight">
            Reservation Overview
          </h2>
          <p className="text-sm text-[#647b8e] mt-0.5">
            Pantau dan kelola jadwal treatment ibu &amp; bayi hari ini dan minggu berjalan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToCalendar}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#4eafde] text-[#16567d] hover:bg-[#e8f5fb] font-semibold text-sm transition-colors shadow-xs flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-[#4eafde]" />
            <span>View Calendar</span>
          </button>
          <button
            onClick={onOpenNewReservation}
            className="px-4 py-2.5 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-sm transition-colors shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Reservation</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Today's Reservations */}
        <div className="bg-white rounded-2xl p-6 border border-[#E4EBF0] shadow-xs hover:border-[#4eafde]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#647b8e]">
              Today&apos;s Reservations
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#e8f5fb] text-[#4eafde] flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#223749] tabular-nums">
              {stats.todayCount}
            </span>
            <span className="text-xs text-[#647b8e]">reservasi</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E4EBF0]/60 text-xs text-[#647b8e]">
            Jadwal reservasi untuk hari ini
          </div>
        </div>

        {/* Card 2: This Week */}
        <div className="bg-white rounded-2xl p-6 border border-[#E4EBF0] shadow-xs hover:border-[#4eafde]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#647b8e]">
              This Week
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#e8f5fb] text-[#4eafde] flex items-center justify-center">
              <CalendarRange className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#223749] tabular-nums">
              {stats.thisWeekCount}
            </span>
            <span className="text-xs text-[#647b8e]">reservasi</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E4EBF0]/60 text-xs text-[#647b8e]">
            Total reservasi minggu berjalan (Senin–Minggu)
          </div>
        </div>

        {/* Card 3: This Month */}
        <div className="bg-white rounded-2xl p-6 border border-[#E4EBF0] shadow-xs hover:border-[#4eafde]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#647b8e]">
              This Month
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#e8f5fb] text-[#4eafde] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#223749] tabular-nums">
              {stats.thisMonthCount}
            </span>
            <span className="text-xs text-[#647b8e]">reservasi</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E4EBF0]/60 text-xs text-[#647b8e]">
            Akumulasi reservasi bulan berjalan
          </div>
        </div>
      </div>

      {/* Section: Upcoming Reservations */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E4EBF0]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#223749]">
              Upcoming Reservations
            </h3>
            <p className="text-xs text-[#647b8e] mt-0.5">
              Jadwal perawatan terdekat yang akan berlangsung
            </p>
          </div>
          <button
            onClick={onNavigateToCalendar}
            className="text-xs font-semibold text-[#4eafde] hover:text-[#3ea0cf] hover:underline"
          >
            Lihat di Calendar &rarr;
          </button>
        </div>

        <div className="mt-4">
          {upcomingReservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-[#f4fafc] border border-[#E4EBF0] flex items-center justify-center mx-auto text-[#647b8e]">
                <Clock className="w-6 h-6 text-[#647b8e]" />
              </div>
              <p className="mt-3 text-sm font-medium text-[#223749]">
                No upcoming reservations.
              </p>
              <p className="text-xs text-[#647b8e] mt-1">
                Belum ada reservasi mendatang yang terjadwal.
              </p>
              <button
                onClick={onOpenNewReservation}
                className="mt-4 px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-xs transition-colors"
              >
                + New Reservation
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E4EBF0]">
              {upcomingReservations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectReservation(item)}
                  className="py-3.5 px-3 -mx-3 rounded-xl hover:bg-[#f4fafc] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Time badge */}
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#e8f5fb] text-[#16567d] font-semibold text-sm tabular-nums shrink-0 border border-[#4eafde]/30">
                      {item.reservation_time}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#223749] group-hover:text-[#16567d] transition-colors">
                          {item.mom_name}
                        </span>
                        <span className="text-xs text-[#647b8e]">
                          ({item.child_name} · {item.child_age})
                        </span>
                      </div>
                      <div className="text-xs text-[#647b8e] mt-0.5">
                        {item.treatment_name} · {item.reservation_date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-xs text-[#647b8e] group-hover:text-[#223749] hidden sm:inline">
                      Detail &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
