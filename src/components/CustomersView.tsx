import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  CreditCard,
  Phone,
  Mail,
  ShieldAlert,
  DollarSign,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { Customer } from '../types.ts';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Partial<Customer>) => Promise<void>;
  onReceiveCreditPayment: (customerId: string, amount: number) => Promise<void>;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddCustomer,
  onReceiveCreditPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // New Customer Form
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    allergies: [],
    chronicConditions: [],
    creditLimit: 200,
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [chronicInput, setChronicInput] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allergies = allergyInput ? allergyInput.split(',').map((s) => s.trim()) : [];
    const chronicConditions = chronicInput ? chronicInput.split(',').map((s) => s.trim()) : [];

    await onAddCustomer({
      ...formData,
      allergies,
      chronicConditions,
    });
    setIsAddModalOpen(false);
  };

  const handleOpenPayment = (c: Customer) => {
    setSelectedCustomer(c);
    setPaymentAmount(c.creditBalance);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && paymentAmount > 0) {
      await onReceiveCreditPayment(selectedCustomer.id, paymentAmount);
      setIsPaymentModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Customer Profiles & Credit Accounts (AR)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Patient history, allergy tracking, chronic medication regimens, and store credit management.
          </p>
        </div>

        <button
          id="add-customer-button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          id="customer-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer name, phone number, or email..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3 relative hover:border-slate-300 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{c.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">ID: {c.id}</p>
              </div>

              {c.creditBalance > 0 && (
                <button
                  id={`receive-payment-${c.id}`}
                  onClick={() => handleOpenPayment(c)}
                  className="rounded bg-blue-600 hover:bg-blue-500 px-2.5 py-1 text-[11px] font-semibold text-white transition flex items-center gap-1 shadow-xs"
                >
                  <DollarSign className="h-3 w-3" /> Settle
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              {c.phone && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="h-3 w-3 text-blue-600" />
                  <span>{c.phone}</span>
                </div>
              )}
              {c.email && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="h-3 w-3 text-blue-500" />
                  <span>{c.email}</span>
                </div>
              )}
            </div>

            {/* Allergies and Chronic Notes */}
            {c.allergies && c.allergies.length > 0 && (
              <div className="rounded-md bg-red-50 border border-red-200 p-2 text-[11px] text-red-700 flex items-center gap-1.5 font-medium">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-red-600" />
                <span>Allergies: {c.allergies.join(', ')}</span>
              </div>
            )}

            {c.chronicConditions && c.chronicConditions.length > 0 && (
              <div className="rounded-md bg-slate-50 p-2 text-[11px] text-slate-700 border border-slate-200">
                <span className="font-semibold text-slate-500">Chronic Care: </span>
                {c.chronicConditions.join(', ')}
              </div>
            )}

            {/* Credit & Financial Status */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">Credit Limit: ${c.creditLimit.toFixed(2)}</div>
                <div
                  className={`font-bold font-mono ${
                    c.creditBalance > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  Due: ${c.creditBalance.toFixed(2)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-slate-400 text-[10px]">Lifetime Spend</div>
                <div className="font-bold text-slate-800 font-mono">${c.totalSpent.toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Register Patient / Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Robert Williams"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 234-5678"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Credit Limit ($)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium">Known Drug Allergies (comma separated)</label>
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs, Aspirin"
                  className="mt-1 w-full rounded-lg border border-red-200 bg-red-50/50 p-2 text-red-800 focus:border-red-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium">Chronic Diagnoses (comma separated)</label>
                <input
                  type="text"
                  value={chronicInput}
                  onChange={(e) => setChronicInput(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-create-customer-button"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Payment Modal */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Receive Credit Settlement</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <div className="text-slate-500">Customer:</div>
                <div className="text-sm font-bold text-slate-800">{selectedCustomer.name}</div>
                <div className="text-amber-600 font-medium mt-1">
                  Current Balance Due: ${selectedCustomer.creditBalance.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium">Payment Received ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-blue-300 bg-slate-50 p-2 text-blue-700 font-mono text-base focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-settlement-payment-button"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
