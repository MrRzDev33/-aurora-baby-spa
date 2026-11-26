import { AlertCircle, Calendar, Loader2, Plus, Settings } from 'lucide-react';
import React from 'react';
import { formatFullIndonesianDate, getCurrentDateString } from '../../utils/dateUtils';
import { AuroraLogo } from '../ui/AuroraLogo';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onOpenMobileMenu?: () => void;
  onOpenNewData: () => void;
  onResetData: () => void;
  loading?: boolean;
  loadingMessage?: string;
  connectionStatus?: {
    isConfigured: boolean;
    isConnected: boolean;
    isChecking?: boolean;
    error?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewData,
  loading = false,
  loadingMessage = 'Loading...',
  connectionStatus,
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Ringkasan reservasi, data jembol, dan kunjungan tamu',
    },
    calendar: {
      title: 'Calendar',
      subtitle: 'Jadwal reservasi interaktif bulanan, mingguan & harian',
    },
    reservations: {
      title: 'Reservations',
      subtitle: 'Daftar lengkap seluruh data reservasi spa',
    },
    jembol_visit: {
      title: 'Jembol & Visit',
      subtitle: 'Data jemput bola (Visit Aja & Trial Treatment) dan kunjungan',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manajemen pilihan treatment & konfigurasi sistem',
    },
  };

  const todayStr = getCurrentDateString();
  const formattedToday = formatFullIndonesianDate(todayStr);

  const isChecking = Boolean(connectionStatus?.isChecking);
  const isOnline = Boolean(connectionStatus?.isConnected);
  const isError = Boolean(connectionStatus && !isChecking && !isOnline);

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

            {/* Connection Status Pill (Tablet & Desktop): Online / Error */}
            {connectionStatus && (
              <span
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isOnline
                    ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                    : isError
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                }`}
                title={
                  isOnline
                    ? 'Sistem terhubung (Online)'
                    : isError
                    ? connectionStatus.error || 'Terjadi gangguan koneksi database'
                    : 'Memeriksa koneksi...'
                }
              >
                {isError ? (
                  <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                )}
                <span>
                  {isOnline ? 'Online' : isError ? 'Status Error' : 'Connecting...'}
                </span>
              </span>
            )}
          </div>

          <p className="hidden md:block text-xs text-[#647b8e]">
            {titles[currentTab].subtitle}
          </p>
        </div>
      </div>

      {/* Right: Mobile compact status + Settings button + Desktop/Tablet Date, Loading & CTA */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {loading && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e8f5fb] text-[#16567d] border border-[#4eafde]/50 text-[11px] sm:text-xs font-medium animate-pulse">
            <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-[#4eafde]" />
            <span className="hidden sm:inline">{loadingMessage}</span>
          </div>
        )}

        {/* Compact Online / Error badge on HP */}
        {connectionStatus && (
          <span
            className={`md:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isOnline
                ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                : isError
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
            }`}
            title={isError ? connectionStatus.error || 'Koneksi bermasalah' : 'Online'}
          >
            {isError ? (
              <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
            ) : (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
            )}
            <span>{isOnline ? 'Online' : isError ? 'Error' : 'Sync...'}</span>
          </span>
        )}

        {/* Compact Settings button on HP (< md) so bottom footer stays clean at 5 slots */}
        {onSelectTab && (
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className={`md:hidden w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
              currentTab === 'settings'
                ? 'bg-[#e8f5fb] border-[#4eafde] text-[#16567d]'
                : 'bg-white border-[#E4EBF0] text-[#647b8e] hover:text-[#223749]'
            }`}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f4fafc] border border-[#E4EBF0] text-xs text-[#647b8e]">
          <Calendar className="w-3.5 h-3.5 text-[#4eafde]" />
          <span>{formattedToday}</span>
        </div>

        {/* Desktop & Tablet Header CTA */}
        <button
          onClick={onOpenNewData}
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Data</span>
        </button>
      </div>
    </header>
  );
};
