import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Layers,
  ArrowLeftRight,
  Truck,
  FileText,
  Users,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Bell,
  Settings,
  Sparkles,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { UserRole } from '../types.ts';

export type NavTab =
  | 'DASHBOARD'
  | 'POS'
  | 'MEDICINES'
  | 'BATCHES'
  | 'INVENTORY'
  | 'PURCHASING'
  | 'PRESCRIPTIONS'
  | 'CUSTOMERS'
  | 'EXPENSES'
  | 'REPORTS'
  | 'AUDIT_LOGS'
  | 'NOTIFICATIONS'
  | 'SETTINGS';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userRole: UserRole;
  badgeCounts: {
    lowStock: number;
    expiringSoon: number;
    pendingRx: number;
    notifications: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  badgeCounts,
}) => {
  const menuItems = [
    {
      id: 'DASHBOARD' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'CASHIER', 'INVENTORY_MANAGER', 'ACCOUNTANT'],
    },
    {
      id: 'POS' as NavTab,
      label: 'Point of Sale (POS)',
      icon: ShoppingCart,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'CASHIER'],
      highlight: true,
    },
    {
      id: 'MEDICINES' as NavTab,
      label: 'Medicines Formulary',
      icon: Pill,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'INVENTORY_MANAGER'],
    },
    {
      id: 'BATCHES' as NavTab,
      label: 'Batches & FEFO',
      icon: Layers,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'INVENTORY_MANAGER'],
      badge: badgeCounts.expiringSoon > 0 ? `${badgeCounts.expiringSoon} Exp` : undefined,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    },
    {
      id: 'INVENTORY' as NavTab,
      label: 'Stock & Transfers',
      icon: ArrowLeftRight,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'INVENTORY_MANAGER', 'PHARMACIST'],
      badge: badgeCounts.lowStock > 0 ? `${badgeCounts.lowStock} Low` : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
    {
      id: 'PURCHASING' as NavTab,
      label: 'Suppliers & POs',
      icon: Truck,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'INVENTORY_MANAGER', 'ACCOUNTANT'],
    },
    {
      id: 'PRESCRIPTIONS' as NavTab,
      label: 'Prescriptions',
      icon: FileText,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST'],
      badge: badgeCounts.pendingRx > 0 ? `${badgeCounts.pendingRx} New` : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'CUSTOMERS' as NavTab,
      label: 'Customers & Credit',
      icon: Users,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'CASHIER', 'ACCOUNTANT'],
    },
    {
      id: 'EXPENSES' as NavTab,
      label: 'Operating Expenses',
      icon: DollarSign,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT'],
    },
    {
      id: 'REPORTS' as NavTab,
      label: 'Financial & Reports',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT'],
    },
    {
      id: 'NOTIFICATIONS' as NavTab,
      label: 'Alerts & Expiry',
      icon: Bell,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'INVENTORY_MANAGER', 'CASHIER', 'ACCOUNTANT'],
      badge: badgeCounts.notifications > 0 ? `${badgeCounts.notifications}` : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'AUDIT_LOGS' as NavTab,
      label: 'Audit & Compliance',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'],
    },
    {
      id: 'SETTINGS' as NavTab,
      label: 'Multi-Branch & Org',
      icon: Settings,
      roles: ['SUPER_ADMIN', 'PHARMACY_OWNER'],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-[#0F172A] p-3 hidden md:flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAllowed = item.roles.includes(userRole);

          if (!isAllowed) {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-600 opacity-40 cursor-not-allowed"
                title={`Restricted for role: ${userRole}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-600" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-600">Locked</span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id.toLowerCase()}`}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* FEFO Compliance Guarantee Indicator */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-800/40 p-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-blue-400">
          <Clock className="h-3.5 w-3.5" />
          <span>FEFO Engine Active</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
          Expired batches are strictly blocked. Earliest valid batches automatically dispensed first.
        </p>
      </div>
    </aside>
  );
};
