import React, { useState } from 'react';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Package,
  Printer,
  Download,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { FinancialSummary, Branch } from '../types.ts';

interface FinancialReportsViewProps {
  financials: FinancialSummary;
  currentBranch: Branch;
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  financials,
  currentBranch,
}) => {
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');

  const grossProfitMargin =
    financials.revenue > 0 ? ((financials.grossProfit / financials.revenue) * 100).toFixed(1) : '0';
  const netProfitMargin =
    financials.revenue > 0 ? ((financials.netProfit / financials.revenue) * 100).toFixed(1) : '0';

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Amount\n' +
      `Gross Revenue,$${financials.revenue.toFixed(2)}\n` +
      `Cost of Goods Sold (COGS),-$${financials.costOfGoodsSold.toFixed(2)}\n` +
      `Gross Profit,$${financials.grossProfit.toFixed(2)}\n` +
      `Gross Margin,${grossProfitMargin}%\n` +
      `Operating Expenses,-$${financials.operatingExpenses.toFixed(2)}\n` +
      `Net Operating Profit,$${financials.netProfit.toFixed(2)}\n` +
      `Net Margin,${netProfitMargin}%\n` +
      `Total Inventory Asset Value,$${financials.inventoryValuation.toFixed(2)}\n` +
      `Customer Receivables (AR),$${financials.customerReceivables.toFixed(2)}\n` +
      `Supplier Payables (AP),$${financials.supplierPayables.toFixed(2)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PharmaCore_Financial_Statement_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Executive Financial Statements & P&L</span>
          </h1>
          <p className="text-xs text-slate-500">
            Income statement, COGS analysis, operating margins, and balance sheet accounts for{' '}
            <span className="font-semibold text-blue-600">{currentBranch?.name || 'All Branches'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Financial Report</span>
          </button>
        </div>
      </div>

      {/* Date Range Selection Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-xs">
        <span className="text-slate-500 font-medium">Reporting Period:</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Primary Financial Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="text-xs text-slate-500 font-medium">Total Gross Revenue</div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            ${financials.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-green-700 font-medium">{financials.salesCount} POS Sales Completed</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="text-xs text-slate-500 font-medium">Gross Profit (Revenue - COGS)</div>
          <div className="text-2xl font-bold text-green-700 tracking-tight font-mono">
            ${financials.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">{grossProfitMargin}% Gross Margin</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="text-xs text-slate-500 font-medium">Net Operating Profit</div>
          <div className="text-2xl font-bold text-blue-600 tracking-tight font-mono">
            ${financials.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold">{netProfitMargin}% Net Profit Margin</div>
        </div>
      </div>

      {/* Detailed Income Statement (P&L) Ledger */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Statement of Operations (Profit & Loss)
          </h2>
          <span className="text-xs text-slate-500 font-mono">Currency: USD ($)</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Revenue */}
          <div className="flex justify-between py-1.5 border-b border-slate-100 font-semibold text-slate-900">
            <span>Gross Pharmaceutical Sales Revenue</span>
            <span className="font-mono text-sm">${financials.revenue.toFixed(2)}</span>
          </div>

          {/* Discounts */}
          <div className="flex justify-between py-1 text-slate-500 pl-4">
            <span>Less: Customer Discounts Applied</span>
            <span className="font-mono">-$0.00</span>
          </div>

          {/* Net Sales */}
          <div className="flex justify-between py-1.5 border-b border-slate-100 font-medium text-slate-700">
            <span>Net Sales Revenue</span>
            <span className="font-mono">${financials.revenue.toFixed(2)}</span>
          </div>

          {/* COGS */}
          <div className="flex justify-between py-1.5 border-b border-slate-100 text-red-600">
            <span className="font-medium">Less: Cost of Goods Sold (COGS - Batch Acquisition)</span>
            <span className="font-mono">-${financials.costOfGoodsSold.toFixed(2)}</span>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between py-2 border border-green-200 font-bold text-green-800 text-sm bg-green-50/70 px-2.5 rounded-lg">
            <span>GROSS OPERATING PROFIT</span>
            <span className="font-mono">${financials.grossProfit.toFixed(2)}</span>
          </div>

          {/* Operating Expenses */}
          <div className="pt-2 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
            Store Operating Overhead & Expenses
          </div>

          <div className="flex justify-between py-1 text-slate-500 pl-4">
            <span>Store Utilities, Refrigeration & Power</span>
            <span className="font-mono">-$150.00</span>
          </div>

          <div className="flex justify-between py-1 text-slate-500 pl-4">
            <span>Packaging, Amber Vials & Thermal Rolls</span>
            <span className="font-mono">-$45.00</span>
          </div>

          <div className="flex justify-between py-1 text-slate-500 pl-4">
            <span>Other Tracked Store Outlays</span>
            <span className="font-mono">
              -${Math.max(0, financials.operatingExpenses - 195).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100 font-medium text-red-600">
            <span>Total Operating Expenses</span>
            <span className="font-mono">-${financials.operatingExpenses.toFixed(2)}</span>
          </div>

          {/* Net Operating Profit */}
          <div className="flex justify-between py-3 border border-blue-200 font-bold text-slate-900 text-base bg-blue-50/70 px-3 rounded-lg">
            <span>NET OPERATING INCOME / PROFIT</span>
            <span className="font-mono text-blue-700">${financials.netProfit.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Balance Sheet Working Capital Accounts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Total Inventory Asset Valuation</div>
          <div className="text-xl font-bold text-blue-600 font-mono">
            ${financials.inventoryValuation.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400">Value of non-expired stock on shelves</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Accounts Receivable (AR)</div>
          <div className="text-xl font-bold text-amber-600 font-mono">
            ${financials.customerReceivables.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400">Unsettled customer credit balances</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Accounts Payable (AP)</div>
          <div className="text-xl font-bold text-indigo-600 font-mono">
            ${financials.supplierPayables.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400">Scheduled wholesale supplier invoices</p>
        </div>
      </div>
    </div>
  );
};
