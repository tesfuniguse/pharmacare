import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  ShoppingCart,
  AlertTriangle,
  X,
  Pill,
} from 'lucide-react';
import { Prescription, Customer, Product, Branch, User as AppUser } from '../types.ts';

interface PrescriptionsViewProps {
  prescriptions: Prescription[];
  customers: Customer[];
  products: Product[];
  currentBranch: Branch;
  currentUser: AppUser;
  onCreatePrescription: (rx: Partial<Prescription>) => Promise<void>;
  onDispenseInPos: (rx: Prescription) => void;
}

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({
  prescriptions,
  customers,
  products,
  currentBranch,
  currentUser,
  onCreatePrescription,
  onDispenseInPos,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingRx, setViewingRx] = useState<Prescription | null>(null);

  // New Rx Form
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || 'cust-1',
    doctorName: 'Dr. Sarah Jenkins, MD',
    doctorClinic: 'St. Jude Medical Center',
    doctorLicense: 'MD-882109',
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    notes: 'Take with food. Complete entire antibiotic course.',
    items: [
      {
        productId: products[0]?.id || 'prod-1',
        dosage: '625mg',
        frequency: 'TID (Every 8 hours)',
        duration: '7 Days',
        quantityPrescribed: 21,
        instructions: 'Take after meals',
      },
    ],
  });

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      rx.prescriptionNumber.toLowerCase().includes(term) ||
      rx.customerName.toLowerCase().includes(term) ||
      rx.doctorName.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'ALL' || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === formData.customerId);
    const formattedItems = formData.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        ...it,
        productName: prod?.name || 'Medicine',
        quantityDispensed: 0,
        remainingQuantity: it.quantityPrescribed,
      };
    });

    await onCreatePrescription({
      ...formData,
      customerName: cust?.name || 'Patient',
      branchId: currentBranch?.id || 'branch-1',
      pharmacistId: currentUser.id,
      pharmacistName: currentUser.name,
      items: formattedItems,
    });
    setIsModalOpen(false);
  };

  const handleAddMedicineRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: products[1]?.id || 'prod-2',
          dosage: '10mg',
          frequency: 'Once Daily at Bedtime',
          duration: '30 Days',
          quantityPrescribed: 30,
          instructions: 'Take at night',
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Clinical Prescriptions & Dispensing Log</span>
          </h1>
          <p className="text-xs text-slate-500">
            Digital prescription intake, allergy cross-referencing, and controlled dispensing tracking.
          </p>
        </div>

        <button
          id="create-prescription-button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Prescription</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="prescription-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Rx number, patient name, or prescribing doctor..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <select
            id="prescription-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Prescription Statuses</option>
            <option value="PENDING">PENDING (Ready to Dispense)</option>
            <option value="PARTIALLY_DISPENSED">PARTIALLY DISPENSED</option>
            <option value="DISPENSED">COMPLETED / DISPENSED</option>
          </select>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPrescriptions.map((rx) => (
          <div
            key={rx.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3 relative hover:border-slate-300 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">{rx.prescriptionNumber}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      rx.status === 'PENDING'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : rx.status === 'PARTIALLY_DISPENSED'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rx.status}
                  </span>
                </div>
                <div className="text-xs text-slate-800 font-semibold mt-1">Patient: {rx.customerName}</div>
              </div>

              {rx.status !== 'DISPENSED' && (
                <button
                  id={`dispense-pos-rx-${rx.id}`}
                  onClick={() => onDispenseInPos(rx)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Load into POS</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <div>Doctor: {rx.doctorName}</div>
              <div>Clinic: {rx.doctorClinic}</div>
              <div className="col-span-2 text-slate-700">Diagnosis: {rx.diagnosis}</div>
            </div>

            {/* Prescribed Items Table */}
            <div className="rounded-lg bg-slate-50 p-2.5 space-y-2 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Prescribed Formulations ({rx.items.length})
              </div>
              {rx.items.map((it, idx) => (
                <div key={idx} className="text-xs flex items-center justify-between text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900">{it.productName}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">
                      ({it.frequency} for {it.duration})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-700">{it.quantityPrescribed} Units</span>
                  </div>
                </div>
              ))}
            </div>

            {rx.notes && <div className="text-[11px] text-slate-500 italic">Instructions: {rx.notes}</div>}
          </div>
        ))}
      </div>

      {/* New Rx Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Create Digital Clinical Prescription</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Select Patient *</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.allergies?.length ? `(Allergies: ${c.allergies.join(',')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Prescribing Physician *</label>
                  <input
                    type="text"
                    required
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Sarah Jenkins, MD"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium">Hospital / Clinic Name</label>
                  <input
                    type="text"
                    value={formData.doctorClinic}
                    onChange={(e) => setFormData({ ...formData, doctorClinic: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Clinical Diagnosis</label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="e.g. Hypertension Stage 1"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Medicine rows */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Prescribed Medicines
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-blue-600 hover:text-blue-500 flex items-center gap-1 text-[11px] font-medium"
                  >
                    <Plus className="h-3 w-3" /> Add Another Medicine
                  </button>
                </div>

                {formData.items.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-600">Medicine *</label>
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].productId = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="mt-1 w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.strength})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-600">Frequency *</label>
                        <input
                          type="text"
                          value={item.frequency}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].frequency = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                          placeholder="e.g. TID / BID / Once Daily"
                          className="mt-1 w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-600">Duration (Days)</label>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].duration = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                          placeholder="e.g. 14 Days"
                          className="mt-1 w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600">Total Quantity to Dispense *</label>
                        <input
                          type="number"
                          value={item.quantityPrescribed}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].quantityPrescribed = parseInt(e.target.value) || 0;
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="mt-1 w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800 font-bold text-blue-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-slate-700 font-medium">Pharmacist Clinical Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  id="confirm-create-prescription-button"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  Create Prescription Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
