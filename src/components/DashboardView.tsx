import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  FileText,
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShoppingCart,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Sale, AppNotification, Branch, UserRole } from '../types.ts';

interface DashboardViewProps {
  kpis: {
    todayRevenue: number;
    todayProfit: number;
    todayExpenses: number;
    monthlyRevenue: number;
    monthlyGrossProfit: number;
    monthlyNetProfit: number;
    totalMedicines: number;
    inventoryValuation: number;
    lowStockCount: number;
    expiredBatchesCount: number;
    expiringSoonCount: number;
    pendingRxCount: number;
    customerReceivables: number;
    supplierPayables: number;
    salesCount: number;
    averageBasketValue: number;
  };
  recentSales: Sale[];
  topSelling: { name: string; quantity: number; revenue: number }[];
  notifications: AppNotification[];
  currentBranch: Branch;
  userRole: UserRole;
  onNavigateTab: (tab: any) => void;
  onOpenAiCopilot: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  recentSales,
  topSelling,
  notifications,
  currentBranch,
  userRole,
  onNavigateTab,
  onOpenAiCopilot,
}) => {
  const [dateFilter, setDateFilter] = useState<'TODAY' | '7D' | '30D' | 'THIS_MONTH'>('THIS_MONTH');

  // Simulated 7-day trend chart data matching pharmacy figures
  const trendData = [
    { day: 'Mon 08/08', revenue: 1420, cogs: 780, profit: 640 },
    { day: 'Tue 08/09', revenue: 1680, cogs: 910, profit: 770 },
    { day: 'Wed 08/10', revenue: 1540, cogs: 820, profit: 720 },
    { day: 'Thu 08/11', revenue: 2100, cogs: 1100, profit: 1000 },
    { day: 'Fri 08/12', revenue: 2450, cogs: 1280, profit: 1170 },
    { day: 'Sat 08/13', revenue: 1980, cogs: 1020, profit: 960 },
    { day: 'Sun 08/14', revenue: 2650, cogs: 1390, profit: 1260 },
  ];

  const categoryDistribution = [
    { name: 'Antibiotics', value: 34, color: '#10b981' },
    { name: 'Cardiovascular', value: 28, color: '#3b82f6' },
    { name: 'Analgesics', value: 18, color: '#f59e0b' },
    { name: 'Endocrine/Diabetes', value: 12, color: '#8b5cf6' },
    { name: 'Respiratory', value: 8, color: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Pharmacy Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time multi-branch retail sales, FEFO stock valuation, and clinical workflow metrics for{' '}
            <span className="font-semibold text-blue-600">{currentBranch?.name || 'All Branches'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Date Filters */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs text-slate-500 shadow-xs">
            {(['TODAY', '7D', '30D', 'THIS_MONTH'] as const).map((filter) => (
              <button
                key={filter}
                id={`date-filter-${filter.toLowerCase()}`}
                onClick={() => setDateFilter(filter)}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  dateFilter === filter ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'hover:text-slate-800'
                }`}
              >
                {filter === 'TODAY'
                  ? 'Today'
                  : filter === '7D'
                  ? 'Last 7 Days'
                  : filter === '30D'
                  ? 'Last 30 Days'
                  : 'This Month'}
              </button>
            ))}
          </div>

          <button
            id="dashboard-open-pos-button"
            onClick={() => onNavigateTab('POS')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Open POS</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales & Profit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Sales</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 border border-blue-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            ${kpis.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Gross Profit:</span>
            <span className="font-semibold text-green-600">
              +${kpis.todayProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Monthly Net Operating Profit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Operating Profit</span>
            <div className="rounded-lg bg-green-50 p-2 text-green-600 border border-green-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            ${kpis.monthlyNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Monthly Revenue:</span>
            <span className="font-medium text-slate-700">
              ${kpis.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Inventory Asset Valuation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Valuation</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 border border-indigo-100">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            ${kpis.inventoryValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Formulary Lines:</span>
            <span className="font-semibold text-indigo-600">{kpis.totalMedicines} Active Meds</span>
          </div>
        </div>

        {/* Clinical Expiry & Low Stock Risks */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock & Expiry Alerts</span>
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600 border border-orange-100">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-red-600">{kpis.lowStockCount} Low</span>
            <span className="text-slate-300 text-lg">/</span>
            <span className="text-orange-500">{kpis.expiringSoonCount} Expiring</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Quarantined:</span>
            <span className="font-semibold text-red-600">{kpis.expiredBatchesCount} Batches</span>
          </div>
        </div>
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateTab('PRESCRIPTIONS')}
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Prescriptions</span>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-800">{kpis.pendingRxCount} Rx Orders</div>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">Click to dispense →</p>
        </div>

        <div
          onClick={() => onNavigateTab('CUSTOMERS')}
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Customer Credit (AR)</span>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-800">
            ${kpis.customerReceivables.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Outstanding balance</p>
        </div>

        <div
          onClick={() => onNavigateTab('PURCHASING')}
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Supplier Payables (AP)</span>
            <Building className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-800">
            ${kpis.supplierPayables.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Scheduled invoices</p>
        </div>

        <div
          onClick={() => onNavigateTab('EXPENSES')}
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Expenses</span>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-800">
            ${kpis.todayExpenses.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Store operations</p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Area Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Revenue vs Cost of Goods Sold (COGS)</h2>
              <p className="text-xs text-slate-500">7-Day financial velocity and gross profit margins</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-blue-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 font-medium text-green-600">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Profit
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    color: '#1e293b',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Therapeutic Category Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Sales by Therapeutic Category</h2>
            <p className="text-xs text-slate-500">Distribution of dispensed medicines</p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    color: '#1e293b',
                  }}
                  formatter={(value: any) => [`${value}% of total sales`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {categoryDistribution.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="line-clamp-1">{c.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Selling Medicines & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Formulary Lines */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">Top-Selling Medicines (Velocity)</h2>
            <button
              onClick={() => onNavigateTab('MEDICINES')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              View Formulary →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topSelling.map((item, idx) => (
              <div key={item.name} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[11px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.quantity} units dispensed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">${item.revenue.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">Gross Sales</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions & Invoices */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">Recent POS Sales Invoices</h2>
            <button
              onClick={() => onNavigateTab('REPORTS')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              All Sales Ledger →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentSales.map((sale) => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>{sale.invoiceNumber}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                      {sale.paymentMethod}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {sale.customerName || 'Walk-in'} • Cashier: {sale.cashierName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">${sale.totalAmount.toFixed(2)}</div>
                  <div className="text-[10px] text-green-600 font-medium">+${sale.grossProfit.toFixed(2)} profit</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Intelligence Action Bar */}
      <div className="bg-blue-600 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">PharmaCore AI Intelligence Copilot</div>
            <p className="text-xs text-blue-100">
              Automated demand forecasting, smart reorders, and FEFO expiry financial loss prevention.
            </p>
          </div>
        </div>

        <button
          id="ask-ai-analytics-button"
          onClick={onOpenAiCopilot}
          className="shrink-0 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 shadow-xs transition"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask AI Assistant</span>
        </button>
      </div>
    </div>
  );
};
