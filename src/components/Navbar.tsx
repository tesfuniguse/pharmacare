import React from 'react';
import {
  Pill,
  Building2,
  Bell,
  Sparkles,
  Search,
  UserCheck,
  ChevronDown,
  ShieldAlert,
  Store,
  RefreshCw,
} from 'lucide-react';
import { User, Branch, Organization, AppNotification } from '../types.ts';

interface NavbarProps {
  currentUser: User;
  organization: Organization;
  currentBranch: Branch;
  allBranches: Branch[];
  allUsers: User[];
  notifications: AppNotification[];
  onSwitchUser: (userId: string) => void;
  onSwitchBranch: (branchId: string) => void;
  onOpenAiCopilot: () => void;
  onOpenNotifications: () => void;
  onQuickSearch: (query: string) => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  organization,
  currentBranch,
  allBranches,
  allUsers,
  notifications,
  onSwitchUser,
  onSwitchBranch,
  onOpenAiCopilot,
  onOpenNotifications,
  onQuickSearch,
  onRefreshData,
  isRefreshing,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalCount = notifications.filter((n) => !n.read && n.severity === 'CRITICAL').length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs lg:px-6">
      {/* Brand & Organization */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Pill className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900">PharmaCore</span>
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
              PRO ERP & POS
            </span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-1">{organization?.name || 'Healthcare Network'}</p>
        </div>
      </div>

      {/* Global Quick Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="global-search-input"
            placeholder="Search medicine, SKU, barcode, generic, customer or Rx..."
            onChange={(e) => onQuickSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-100 py-1.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Branch & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Branch Selector */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
            <Store className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <select
              id="branch-selector"
              value={currentBranch?.id || 'branch-1'}
              onChange={(e) => onSwitchBranch(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-white text-slate-800">
                🏢 All Branches (Consolidated)
              </option>
              {allBranches.map((b) => (
                <option key={b.id} value={b.id} className="bg-white text-slate-800">
                  📍 {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Analytics Copilot Trigger */}
        <button
          id="ai-copilot-button"
          onClick={onOpenAiCopilot}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
          title="Open AI Smart Analytics Copilot"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Data Refresh */}
        <button
          id="refresh-data-button"
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          title="Sync & Refresh Live Store Data"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Notifications Trigger */}
        <button
          id="notifications-button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          title="Alerts & Expiry Warnings"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User / RBAC Role Switcher */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-800 line-clamp-1">{currentUser.name}</div>
            <div className="text-[10px] font-medium text-blue-600 tracking-wide uppercase">
              {currentUser.role.replace('_', ' ')}
            </div>
          </div>
          <div className="relative">
            <select
              id="user-role-switcher"
              value={currentUser.id}
              onChange={(e) => onSwitchUser(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              title="Switch Active RBAC User Role for Testing"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-white text-slate-800">
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
