import { Calendar, Database, Loader2, Plus } from 'lucide-react';
import React from 'react';
import { formatFullIndonesianDate, getCurrentDateString } from '../../utils/dateUtils';
import { AuroraLogo } from '../ui/AuroraLogo';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileMenu?: () => void;
  onOpenNewReservation: () => void;
  onResetData: () => void;
  loading?: boolean;
  loadingMessage?: string;
  connectionStatus?: {
    isConfigured: boolean;
    isConnected: boolean;
    error?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenNewReservation,
  loading = false,
  loadingMessage = 'Loading...',
  connectionStatus,
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Ringkasan jadwal dan reservasi terkini',
    },
    calendar: {
      title: 'Calendar',
      subtitle: 'Jadwal reservasi interaktif bulanan, mingguan & harian',
    },
    reservations: {
      title: 'Reservations',
      subtitle: 'Daftar lengkap seluruh data reservasi spa',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manajemen pilihan treatment & konfigurasi sistem',
    },
  };

  const todayStr = getCurrentDateString();
  const formattedToday = formatFullIndonesianDate(todayStr);

  return (
    <header className="sticky top-0 z-20 h-14 md:h-20 bg-white/95 backdrop-blur-xs border-b border-[#E4EBF0] px-4 sm:px-8 flex items-center justify-between gap-3">
      {/* Left: Aurora Logo (HP) + Page Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="md:hidden shrink-0">
          <AuroraLogo size="sm" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-bold text-[#223749] tracking-tight truncate">
              {titles[currentTab].title}
            </h1>

            {/* Supabase Status Pill (Tablet & Desktop) */}
            {connectionStatus && (
              <span
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  connectionStatus.isConnected
                    ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                    : connectionStatus.isConfigured
                    ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                    : 'bg-[#e8f5fb] text-[#16567d] border-[#4eafde]/40'
                }`}
                title={
                  connectionStatus.isConnected
                    ? 'Terhubung dengan database Supabase'
                    : 'Mode database persisten aktif'
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    connectionStatus.isConnected
                      ? 'bg-emerald-500'
                      : connectionStatus.isConfigured
                      ? 'bg-amber-500'
                      : 'bg-[#4eafde]'
                  }`}
                />
                <Database className="w-3 h-3 opacity-70" />
                <span>
                  {connectionStatus.isConnected
                    ? 'Supabase'
                    : connectionStatus.isConfigured
                    ? 'Connecting'
                    : 'Supabase Ready'}
                </span>
              </span>
            )}
          </div>

          <p className="hidden md:block text-xs text-[#647b8e]">
            {titles[currentTab].subtitle}
          </p>
        </div>
      </div>

      {/* Right: Mobile compact status + Desktop/Tablet Date, Loading & CTA */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {loading && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e8f5fb] text-[#16567d] border border-[#4eafde]/50 text-[11px] sm:text-xs font-medium animate-pulse">
            <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-[#4eafde]" />
            <span className="hidden sm:inline">{loadingMessage}</span>
          </div>
        )}

        {/* Compact Supabase badge on HP */}
        {connectionStatus && (
          <span
            className={`md:hidden inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${
              connectionStatus.isConnected
                ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                : connectionStatus.isConfigured
                ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                : 'bg-[#e8f5fb] text-[#16567d] border-[#4eafde]/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus.isConnected
                  ? 'bg-emerald-500'
                  : connectionStatus.isConfigured
                  ? 'bg-amber-500'
                  : 'bg-[#4eafde]'
              }`}
            />
            <span>{connectionStatus.isConnected ? 'Supabase' : 'Sync'}</span>
          </span>
        )}

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f4fafc] border border-[#E4EBF0] text-xs text-[#647b8e]">
          <Calendar className="w-3.5 h-3.5 text-[#4eafde]" />
          <span>{formattedToday}</span>
        </div>

        {/* Desktop & Tablet Header CTA (Hidden on HP since center + is in bottom footer) */}
        <button
          onClick={onOpenNewReservation}
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Reservation</span>
        </button>
      </div>
    </header>
  );
};
