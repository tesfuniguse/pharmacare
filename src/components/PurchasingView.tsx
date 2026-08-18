import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  PackageCheck,
  Building,
  DollarSign,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { Supplier, PurchaseOrder, Product, Branch, User } from '../types.ts';

interface PurchasingViewProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  currentBranch: Branch;
  currentUser: User;
  onAddSupplier: (supplier: Partial<Supplier>) => Promise<void>;
  onCreatePO: (po: Partial<PurchaseOrder>) => Promise<void>;
  onReceivePO: (poId: string) => Promise<void>;
}

export const PurchasingView: React.FC<PurchasingViewProps> = ({
  suppliers,
  purchaseOrders,
  products,
  currentBranch,
  currentUser,
  onAddSupplier,
  onCreatePO,
  onReceivePO,
}) => {
  const [activeTab, setActiveTab] = useState<'POS' | 'SUPPLIERS'>('POS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // New Supplier Form
  const [supplierData, setSupplierData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    paymentTerms: 'NET 30',
  });

  // New PO Form
  const [poForm, setPoForm] = useState({
    supplierId: suppliers[0]?.id || 'sup-1',
    expectedDeliveryDate: '2026-08-25',
    items: [
      {
        productId: products[0]?.id || 'prod-1',
        quantity: 50,
        unitCost: 5.0,
        batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
        manufacturingDate: '2026-01-01',
        expiryDate: '2028-01-01',
      },
    ],
  });

  const handleCreatePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === poForm.supplierId);
    const formattedItems = poForm.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        ...it,
        productName: prod?.name || 'Medicine',
        total: it.quantity * it.unitCost,
      };
    });
    const totalAmount = formattedItems.reduce((sum, it) => sum + it.total, 0);

    await onCreatePO({
      supplierId: poForm.supplierId,
      supplierName: sup?.name || 'Supplier',
      branchId: currentBranch?.id || 'branch-1',
      branchName: currentBranch?.name || 'Central Pharmacy',
      expectedDeliveryDate: poForm.expectedDeliveryDate,
      items: formattedItems,
      totalAmount,
      createdById: currentUser.id,
      createdByName: currentUser.name,
    });
    setIsPOModalOpen(false);
  };

  const handleAddSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddSupplier(supplierData);
    setIsSupplierModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <span>Supplier Management & Purchase Ingestion</span>
          </h1>
          <p className="text-xs text-slate-500">
            Wholesale pharmaceutical procurement, PO tracking, automated batch receipt, and Accounts Payable (AP).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-supplier-modal-button"
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition"
          >
            <Building className="h-4 w-4 text-blue-600" />
            <span>Add Supplier</span>
          </button>

          <button
            id="open-po-modal-button"
            onClick={() => setIsPOModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('POS')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === 'POS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === 'SUPPLIERS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Approved Wholesalers & Suppliers ({suppliers.length})
        </button>
      </div>

      {/* TAB 1: Purchase Orders */}
      {activeTab === 'POS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier Wholesaler</th>
                <th className="py-3 px-4">Items & Batches</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{po.poNumber}</td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{po.supplierName}</div>
                    <div className="text-[10px] text-slate-400">Branch: {po.branchName}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-700 font-medium">{po.items.length} Products Ordered</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      {po.items.map((it) => `${it.productName} (${it.quantity}u)`).join(', ')}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-900">${po.totalAmount.toFixed(2)}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        po.status === 'RECEIVED'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                        po.paymentStatus === 'PAID'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {po.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {po.status !== 'RECEIVED' ? (
                      <button
                        id={`receive-po-${po.id}`}
                        onClick={() => onReceivePO(po.id)}
                        className="rounded bg-blue-600 hover:bg-blue-500 px-3 py-1 text-[11px] font-semibold text-white shadow-xs transition flex items-center gap-1 ml-auto"
                      >
                        <PackageCheck className="h-3.5 w-3.5" />
                        <span>Receive Stock</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-green-600 flex items-center justify-end gap-1 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Stock Ingested
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Suppliers List */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{s.name}</h3>
                  <p className="text-xs text-slate-500">Contact: {s.contactPerson}</p>
                </div>
                <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 border border-green-200">
                  {s.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div>Phone: {s.phone}</div>
                <div>Email: {s.email}</div>
                <div>Terms: {s.paymentTerms}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Accounts Payable (AP):</span>
                <span className="font-bold text-red-600 font-mono">${s.currentBalance.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New PO Modal */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Create Purchase Order (Wholesale Restock)</h3>
              <button onClick={() => setIsPOModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Select Supplier *</label>
                  <select
                    value={poForm.supplierId}
                    onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Terms: {s.paymentTerms})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={poForm.expectedDeliveryDate}
                    onChange={(e) => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Ordered Medicine Lines
                </label>

                {poForm.items.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-600">Medicine *</label>
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[idx].productId = e.target.value;
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="mt-1 w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-600">Quantity (Units) *</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[idx].quantity = parseInt(e.target.value) || 0;
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="mt-1 w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600">Wholesale Unit Cost ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[idx].unitCost = parseFloat(e.target.value) || 0;
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="mt-1 w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-600">Batch / Lot #</label>
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[idx].batchNumber = e.target.value;
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="mt-1 w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600">Mfg Date</label>
                        <input
                          type="date"
                          value={item.manufacturingDate}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[idx].manufacturingDate = e.target.value;
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="mt-1 w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600">Expiry Date (FEFO Key)</label>
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[idx].expiryDate = e.target.value;
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="mt-1 w-full rounded border border-blue-200 bg-white p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPOModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-create-po-button"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Register Wholesaler Supplier</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-medium">Wholesaler / Company Name *</label>
                <input
                  type="text"
                  required
                  value={supplierData.name}
                  onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
                  placeholder="e.g. MedSource National Wholesalers"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={supplierData.contactPerson}
                    onChange={(e) => setSupplierData({ ...supplierData, contactPerson: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Payment Terms</label>
                  <input
                    type="text"
                    value={supplierData.paymentTerms}
                    onChange={(e) => setSupplierData({ ...supplierData, paymentTerms: e.target.value })}
                    placeholder="e.g. NET 30 / 60"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={supplierData.phone}
                    onChange={(e) => setSupplierData({ ...supplierData, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Email</label>
                  <input
                    type="email"
                    value={supplierData.email}
                    onChange={(e) => setSupplierData({ ...supplierData, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-create-supplier-button"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
