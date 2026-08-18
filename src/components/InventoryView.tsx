import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  Layers,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  History,
  X,
} from 'lucide-react';
import {
  InventoryTransaction,
  StockTransfer,
  Product,
  Batch,
  Branch,
  User,
} from '../types.ts';

interface InventoryViewProps {
  transactions: InventoryTransaction[];
  transfers: StockTransfer[];
  products: Product[];
  batches: Batch[];
  branches: Branch[];
  currentBranch: Branch;
  currentUser: User;
  onInitiateTransfer: (transfer: Partial<StockTransfer>) => Promise<void>;
  onStockAdjustment: (adjustment: any) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  transactions,
  transfers,
  products,
  batches,
  branches,
  currentBranch,
  currentUser,
  onInitiateTransfer,
  onStockAdjustment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'MOVEMENTS' | 'TRANSFERS' | 'ADJUSTMENTS'>('MOVEMENTS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Transfer Form State
  const [transferData, setTransferData] = useState({
    fromBranchId: currentBranch?.id || 'branch-1',
    toBranchId: branches.find((b) => b.id !== currentBranch?.id)?.id || 'branch-2',
    productId: products[0]?.id || 'prod-1',
    batchId: '',
    quantity: 10,
    notes: 'Urgent stock balancing',
  });

  // Adjustment Form State
  const [adjData, setAdjData] = useState({
    branchId: currentBranch?.id || 'branch-1',
    productId: products[0]?.id || 'prod-1',
    batchId: '',
    adjustmentType: 'DAMAGED' as 'COUNT_VARIANCE' | 'DAMAGED' | 'EXPIRED' | 'THEFT' | 'OTHER',
    quantityDelta: -5,
    reason: 'Compromised packaging during shelf restocking',
  });

  const availableBatchesForTransfer = batches.filter(
    (b) => b.productId === transferData.productId && b.branchId === transferData.fromBranchId && b.availableQuantity > 0
  );

  const availableBatchesForAdj = batches.filter(
    (b) => b.productId === adjData.productId && b.branchId === adjData.branchId
  );

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === transferData.productId);
    const batch = batches.find((b) => b.id === transferData.batchId) || availableBatchesForTransfer[0];
    const fromB = branches.find((b) => b.id === transferData.fromBranchId);
    const toB = branches.find((b) => b.id === transferData.toBranchId);

    if (!batch) return;

    await onInitiateTransfer({
      ...transferData,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      productName: prod?.name || 'Medicine',
      fromBranchName: fromB?.name || 'Branch A',
      toBranchName: toB?.name || 'Branch B',
      requestedBy: currentUser.name,
    });
    setIsTransferModalOpen(false);
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === adjData.productId);
    const batch = batches.find((b) => b.id === adjData.batchId) || availableBatchesForAdj[0];
    if (!batch) return;

    await onStockAdjustment({
      ...adjData,
      batchId: batch.id,
      productName: prod?.name || 'Medicine',
      adjustedBy: currentUser.id,
    });
    setIsAdjustmentModalOpen(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.productName.toLowerCase().includes(term) ||
      t.batchNumber?.toLowerCase().includes(term) ||
      t.type.toLowerCase().includes(term) ||
      (t.reason && t.reason.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            <span>Stock Movements & Inter-Branch Transfers</span>
          </h1>
          <p className="text-xs text-slate-500">
            Immutable inventory transaction logs, multi-branch stock transfers, and reconciliation adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-adjustment-modal-button"
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition"
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Stock Adjustment</span>
          </button>

          <button
            id="open-transfer-modal-button"
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Branch Transfer</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('MOVEMENTS')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeSubTab === 'MOVEMENTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Transaction Ledger ({transactions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('TRANSFERS')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeSubTab === 'TRANSFERS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Branch Transfers ({transfers.length})
        </button>
      </div>

      {/* Search toolbar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter movements by medicine, batch, or transaction reason..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* TAB 1: Transaction Ledger */}
      {activeSubTab === 'MOVEMENTS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Medicine & Batch</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Quantity Change</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                    {tx.timestamp.replace('T', ' ').substring(0, 16)}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{tx.productName}</div>
                    <div className="text-[10px] font-mono text-slate-400">Batch: {tx.batchNumber || 'N/A'}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        tx.type === 'SALE' || tx.type === 'DISPENSED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : tx.type === 'PURCHASE'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : tx.type === 'EXPIRED' || tx.type === 'DAMAGED'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={tx.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-700">{tx.balanceAfter} units</td>

                  <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate">{tx.reason || 'Standard operation'}</td>

                  <td className="py-3 px-4 text-[11px] text-slate-500">{tx.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Inter-Branch Transfers */}
      {activeSubTab === 'TRANSFERS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Transfer Number</th>
                <th className="py-3 px-4">Medicine & Batch</th>
                <th className="py-3 px-4">From → To Branch</th>
                <th className="py-3 px-4">Transferred Units</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((trf) => (
                <tr key={trf.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{trf.transferNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{trf.productName}</div>
                    <div className="text-[10px] font-mono text-slate-400">Batch: {trf.batchNumber}</div>
                  </td>
                  <td className="py-3 px-4 text-[11px]">
                    <div className="text-red-700 font-medium">From: {trf.fromBranchName}</div>
                    <div className="text-green-700 font-medium">To: {trf.toBranchName}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{trf.quantity} units</td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200">
                      {trf.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{trf.requestedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Create Inter-Branch Stock Transfer</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">From Origin Branch *</label>
                  <select
                    value={transferData.fromBranchId}
                    onChange={(e) => setTransferData({ ...transferData, fromBranchId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium">To Destination Branch *</label>
                  <select
                    value={transferData.toBranchId}
                    onChange={(e) => setTransferData({ ...transferData, toBranchId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {branches
                      .filter((b) => b.id !== transferData.fromBranchId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium">Select Medicine *</label>
                <select
                  value={transferData.productId}
                  onChange={(e) => setTransferData({ ...transferData, productId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - SKU: {p.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Select Available Batch *</label>
                  <select
                    value={transferData.batchId || (availableBatchesForTransfer[0]?.id || '')}
                    onChange={(e) => setTransferData({ ...transferData, batchId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {availableBatchesForTransfer.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} (Avail: {b.availableQuantity}u, Exp: {b.expiryDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Quantity to Transfer *</label>
                  <input
                    type="number"
                    required
                    value={transferData.quantity}
                    onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium">Transfer Notes / Reason</label>
                <input
                  type="text"
                  value={transferData.notes}
                  onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-transfer-button"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Stock Adjustment & Reconciliation</h3>
              <button onClick={() => setIsAdjustmentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-medium">Select Medicine *</label>
                <select
                  value={adjData.productId}
                  onChange={(e) => setAdjData({ ...adjData, productId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - SKU: {p.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Adjustment Type *</label>
                  <select
                    value={adjData.adjustmentType}
                    onChange={(e) => setAdjData({ ...adjData, adjustmentType: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DAMAGED">Damaged / Broken</option>
                    <option value="EXPIRED">Expired on Shelf</option>
                    <option value="COUNT_VARIANCE">Count Variance (Audit)</option>
                    <option value="THEFT">Theft / Unaccounted</option>
                    <option value="OTHER">Other Correction</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Quantity Delta (e.g. -5 or +10) *</label>
                  <input
                    type="number"
                    required
                    value={adjData.quantityDelta}
                    onChange={(e) => setAdjData({ ...adjData, quantityDelta: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium">Reason / Clinical Explanation *</label>
                <input
                  type="text"
                  required
                  value={adjData.reason}
                  onChange={(e) => setAdjData({ ...adjData, reason: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-adjustment-button"
                  className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-500 shadow-xs"
                >
                  Post Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
