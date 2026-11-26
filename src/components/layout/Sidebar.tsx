import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Layers,
  LayoutDashboard,
  Plus,
  Settings,
} from 'lucide-react';
import React from 'react';
import { AuroraLogo } from '../ui/AuroraLogo';

export type NavTab = 'dashboard' | 'calendar' | 'reservations' | 'data' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenNewData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
  onOpenNewData,
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    mobileLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', mobileLabel: 'Home', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', mobileLabel: 'Calendar', icon: CalendarDays },
    { id: 'reservations', label: 'Reservations', mobileLabel: 'Reservasi', icon: ClipboardList },
    { id: 'data', label: 'Data', mobileLabel: 'Data', icon: Layers },
    { id: 'settings', label: 'Settings', mobileLabel: 'Settings', icon: Settings },
  ];

  // 4 primary routes in HP bottom footer (+ center New Data button = 5 clean slots)
  // Settings is accessible via compact gear button in HP Header
  const mobileBottomLeft = navItems.slice(0, 2); // Home, Calendar
  const mobileBottomRight = navItems.slice(2, 4); // Reservasi, Data

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* ==================== DESKTOP & TABLET LEFT SIDEBAR (md+) ==================== */}
      <aside
        className={`hidden md:flex sticky top-0 left-0 z-40 h-screen bg-white border-r border-[#E4EBF0] flex-col transition-all duration-200 ease-in-out shrink-0 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        {/* Brand Header with Aurora Logo */}
        <div className="h-20 border-b border-[#E4EBF0] flex items-center justify-between px-4 sm:px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <AuroraLogo size="md" />
            {!isCollapsed && (
              <div className="truncate">
                <span className="block text-base font-bold text-[#223749] tracking-tight leading-tight">
                  Aurora
                </span>
                <span className="block text-xs font-medium text-[#647b8e] tracking-wide">
                  Mom &amp; Baby Spa
                </span>
              </div>
            )}
          </div>

          {/* Desktop / Tablet Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="flex w-7 h-7 rounded-lg border border-[#E4EBF0] hover:bg-[#f4fafc] text-[#647b8e] hover:text-[#223749] items-center justify-center transition-colors"
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick CTA inside expanded sidebar */}
        {!isCollapsed && (
          <div className="p-4 pb-2">
            <button
              onClick={onOpenNewData}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-sm transition-colors shadow-xs"
            >
              <span className="text-base leading-none font-bold">+</span>
              <span>New Data</span>
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-[#e8f5fb] text-[#16567d] font-semibold shadow-xs'
                    : 'text-[#647b8e] hover:bg-[#f4fafc] hover:text-[#223749]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#4eafde]' : 'text-[#647b8e]'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Quiet Brand Footer */}
        <div className="p-4 border-t border-[#E4EBF0]">
          {!isCollapsed ? (
            <div className="text-xs text-[#647b8e] flex items-center justify-between">
              <span>Admin Console</span>
              <span className="text-[11px] text-[#9AA7B4]">Aurora Spa</span>
            </div>
          ) : (
            <div className="text-center text-[10px] text-[#9AA7B4]">Aurora</div>
          )}
        </div>
      </aside>

      {/* ==================== MOBILE BOTTOM FOOTER NAVIGATION (< md / HP) ==================== */}
      <nav
        aria-label="Navigasi Utama HP"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4EBF0] shadow-[0_-6px_24px_rgba(15,23,42,0.07)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 items-end px-1.5 pt-1.5 pb-2 max-w-md mx-auto">
          {/* Left 2 Tabs: Home (Dashboard) & Calendar */}
          {mobileBottomLeft.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-colors min-h-[48px] ${
                  isActive
                    ? 'text-[#16567d] font-bold'
                    : 'text-[#647b8e] hover:text-[#223749] font-medium'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition-colors ${
                    isActive ? 'bg-[#e8f5fb]' : 'bg-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#4eafde]' : 'text-[#647b8e]'
                    }`}
                  />
                </div>
                <span className="text-[10px] leading-none tracking-tight">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}

          {/* Center Floating "+" New Data Button */}
          <div className="flex flex-col items-center justify-end pb-0.5">
            <button
              type="button"
              onClick={onOpenNewData}
              className="w-12 h-12 -mt-5 rounded-2xl bg-[#4eafde] hover:bg-[#3ea0cf] active:scale-95 text-white shadow-lg shadow-[#4eafde]/35 ring-4 ring-white flex items-center justify-center transition-all"
              aria-label="Tambah Data Baru"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[10px] font-bold text-[#16567d] leading-none mt-1">
              New Data
            </span>
          </div>

          {/* Right 2 Tabs: Reservasi & Jembol */}
          {mobileBottomRight.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-colors min-h-[48px] ${
                  isActive
                    ? 'text-[#16567d] font-bold'
                    : 'text-[#647b8e] hover:text-[#223749] font-medium'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition-colors ${
                    isActive ? 'bg-[#e8f5fb]' : 'bg-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#4eafde]' : 'text-[#647b8e]'
                    }`}
                  />
                </div>
                <span className="text-[10px] leading-none tracking-tight">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
