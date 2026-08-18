import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  ShieldAlert,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  Calendar,
  X,
  Store,
} from 'lucide-react';
import { Batch, Product, Branch, BatchStatus } from '../types.ts';

interface BatchesViewProps {
  batches: Batch[];
  products: Product[];
  currentBranch: Branch;
  allBranches: Branch[];
  onAddBatch: (batch: Partial<Batch>) => Promise<void>;
  onQuarantineBatch: (batchId: string) => Promise<void>;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  batches,
  products,
  currentBranch,
  allBranches,
  onAddBatch,
  onQuarantineBatch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Batch>>({
    productId: products[0]?.id || 'prod-1',
    batchNumber: '',
    manufacturingDate: '2025-01-15',
    expiryDate: '2027-01-15',
    quantity: 100,
    purchasePrice: 5.0,
    sellingPrice: 10.0,
    branchId: currentBranch?.id || 'branch-1',
  });

  const today = '2026-08-14';

  const getDaysUntilExpiry = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date(today).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredBatches = batches.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(term) ||
      (b.productName && b.productName.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === formData.productId);
    await onAddBatch({
      ...formData,
      productName: prod?.name || 'Medicine',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            <span>Batches & FEFO Expiry Tracking</span>
          </h1>
          <p className="text-xs text-slate-500">
            Strict First-Expired-First-Out (FEFO) dispensing order, expiry monitoring, and quarantine controls.
          </p>
        </div>

        <button
          id="add-batch-button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>Ingest New Batch</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="batch-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by batch number or medicine name..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <select
            id="batch-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Batch Statuses</option>
            <option value="ACTIVE">ACTIVE (In Dispensing Order)</option>
            <option value="EXPIRING_SOON">EXPIRING SOON (&lt;90 Days)</option>
            <option value="EXPIRED">EXPIRED (Blocked)</option>
            <option value="QUARANTINED">QUARANTINED (Locked)</option>
          </select>
        </div>
      </div>

      {/* Batches Table with Expiry Countdown */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4">Batch Number</th>
              <th className="py-3 px-4">Medicine Name</th>
              <th className="py-3 px-4">Expiry Date & Timeline</th>
              <th className="py-3 px-4">Available Units</th>
              <th className="py-3 px-4">Cost vs Selling</th>
              <th className="py-3 px-4">Compliance Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBatches.map((b) => {
              const daysLeft = getDaysUntilExpiry(b.expiryDate);
              const isExpired = daysLeft <= 0 || b.status === 'EXPIRED';
              const isExpiringSoon = daysLeft > 0 && daysLeft <= 90;

              return (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                    <span>{b.batchNumber}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{b.productName}</div>
                    <div className="text-[10px] text-slate-400">
                      Branch: {allBranches.find((br) => br.id === b.branchId)?.name || b.branchId}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{b.expiryDate}</div>
                    <div className="text-[10px]">
                      {isExpired ? (
                        <span className="text-red-600 font-bold">Expired {Math.abs(daysLeft)} days ago</span>
                      ) : isExpiringSoon ? (
                        <span className="text-orange-600 font-semibold">{daysLeft} days remaining</span>
                      ) : (
                        <span className="text-green-600 font-medium">{daysLeft} days remaining</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{b.availableQuantity} units</div>
                    <div className="text-[10px] text-slate-400">Initial: {b.quantity}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-600">
                      Cost: <span className="font-medium text-slate-800">${b.purchasePrice.toFixed(2)}</span>
                    </div>
                    <div className="text-blue-600 text-[11px] font-semibold">
                      Sell: ${b.sellingPrice.toFixed(2)}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {b.status === 'QUARANTINED' ? (
                      <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                        QUARANTINED
                      </span>
                    ) : isExpired ? (
                      <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                        EXPIRED (BLOCKED)
                      </span>
                    ) : isExpiringSoon ? (
                      <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200">
                        EXPIRING SOON
                      </span>
                    ) : (
                      <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200">
                        ACTIVE (FEFO #1)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {b.status !== 'QUARANTINED' && (
                      <button
                        id={`quarantine-batch-${b.id}`}
                        onClick={() => onQuarantineBatch(b.id)}
                        className="rounded bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-700 transition"
                        title="Quarantine and block batch from sale"
                      >
                        Quarantine
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Ingest New Medicine Batch</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-medium">Select Medicine *</label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.strength}) - SKU: {p.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Batch Number / Lot *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AMX-25A12"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Quantity Ingested *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Manufacturing Date</label>
                  <input
                    type="date"
                    required
                    value={formData.manufacturingDate}
                    onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Expiry Date (FEFO Key) *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-blue-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Purchase Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Selling Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
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
                  id="save-batch-button"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  Ingest Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
