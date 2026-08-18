import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Calendar,
  Building,
  Tag,
  CreditCard,
  X,
  PieChart as PieIcon,
} from 'lucide-react';
import { Expense, Branch, User, ExpenseCategory } from '../types.ts';

interface ExpensesViewProps {
  expenses: Expense[];
  currentBranch: Branch;
  currentUser: User;
  onAddExpense: (expense: Partial<Expense>) => Promise<void>;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  currentBranch,
  currentUser,
  onAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Expense>>({
    category: 'UTILITIES',
    amount: 150.0,
    date: '2026-08-14',
    paymentMethod: 'CASH',
    notes: 'Electricity and air conditioning bill',
    branchId: currentBranch?.id || 'branch-1',
  });

  const categories: ExpenseCategory[] = [
    'RENT',
    'UTILITIES',
    'SALARIES',
    'PACKAGING',
    'MAINTENANCE',
    'MARKETING',
    'LICENSES',
    'OTHER',
  ];

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddExpense({
      ...formData,
      branchName: currentBranch?.name || 'Pharmacy Branch',
      recordedById: currentUser.id,
      recordedByName: currentUser.name,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span>Store Operating Expenses</span>
          </h1>
          <p className="text-xs text-slate-500">
            Log overhead, utilities, packaging, refrigeration power, and operational outlays for net profit calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-right shadow-xs">
            <div className="text-[10px] text-slate-500 font-medium">Total Tracked Expenses</div>
            <div className="text-sm font-bold text-slate-900 font-mono">${totalExpenseAmount.toFixed(2)}</div>
          </div>

          <button
            id="add-expense-button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="expense-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expense description or voucher #..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <select
            id="expense-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4">Voucher Number</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Description / Purpose</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4">Logged By</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-mono font-semibold text-slate-900">{exp.expenseNumber}</td>

                <td className="py-3 px-4">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
                    {exp.category}
                  </span>
                </td>

                <td className="py-3 px-4 text-slate-800 font-medium">{exp.notes || 'Operating Overhead'}</td>

                <td className="py-3 px-4 text-slate-500">{exp.date}</td>

                <td className="py-3 px-4 text-slate-700">{exp.paymentMethod}</td>

                <td className="py-3 px-4 text-slate-500">{exp.recordedByName}</td>

                <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                  ${exp.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Record Operating Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Expense Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Expense Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Debit / Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium">Description / Reason *</label>
                <input
                  type="text"
                  required
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Monthly medical cold storage electricity"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-save-expense-button"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
