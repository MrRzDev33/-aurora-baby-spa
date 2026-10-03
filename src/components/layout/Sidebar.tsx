import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import React from 'react';
import { AuroraLogo } from '../ui/AuroraLogo';

export type NavTab = 'dashboard' | 'calendar' | 'reservations' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNewReservation: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenNewReservation,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'reservations', label: 'Reservations', icon: ClipboardList },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-white border-r border-[#E4EBF0] flex flex-col transition-all duration-200 ease-in-out shrink-0 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen
            ? 'w-72 translate-x-0 shadow-lg'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header with Aurora Logo */}
        <div className="h-20 border-b border-[#E4EBF0] flex items-center justify-between px-4 sm:px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <AuroraLogo size="md" />
            {(!isCollapsed || isMobileOpen) && (
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

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-lg border border-[#E4EBF0] hover:bg-[#f4fafc] text-[#647b8e] hover:text-[#223749] items-center justify-center transition-colors"
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
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 pb-2">
            <button
              onClick={() => {
                onOpenNewReservation();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-sm transition-colors shadow-xs"
            >
              <span className="text-base leading-none font-bold">+</span>
              <span>New Reservation</span>
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
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#4eafde]' : 'text-[#647b8e]'
                  }`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quiet Brand Footer */}
        <div className="p-4 border-t border-[#E4EBF0]">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="text-xs text-[#647b8e] flex items-center justify-between">
              <span>Admin Console</span>
              <span className="text-[11px] text-[#9AA7B4]">Aurora Spa</span>
            </div>
          ) : (
            <div className="text-center text-[10px] text-[#9AA7B4]">Aurora</div>
          )}
        </div>
      </aside>
    </>
  );
};
