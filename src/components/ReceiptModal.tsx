import React, { useState } from 'react';
import {
  Printer,
  FileText,
  CheckCircle2,
  X,
  Pill,
  Download,
  Building,
  QrCode,
} from 'lucide-react';
import { Sale, Organization, Branch } from '../types.ts';

interface ReceiptModalProps {
  sale: Sale | null;
  organization: Organization;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  organization,
  onClose,
}) => {
  const [layout, setLayout] = useState<'THERMAL' | 'A4'>('THERMAL');

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="flex flex-col w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Sales Invoice & Receipt</span>
            <div className="flex items-center rounded-lg bg-slate-200/70 border border-slate-300 p-0.5 text-[11px]">
              <button
                onClick={() => setLayout('THERMAL')}
                className={`rounded px-2 py-0.5 font-medium ${
                  layout === 'THERMAL' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setLayout('A4')}
                className={`rounded px-2 py-0.5 font-medium ${
                  layout === 'A4' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                A4 Tax Invoice
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Receipt</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-slate-100/60 overflow-y-auto max-h-[75vh] flex justify-center">
          <div
            id="printable-receipt"
            className={`${
              layout === 'THERMAL' ? 'w-[320px] p-4 text-[11px]' : 'w-full max-w-md p-6 text-xs'
            } bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200 font-mono space-y-3`}
          >
            {/* Header */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
              <div className="text-sm font-bold tracking-tight uppercase">
                {organization?.name || 'PharmaCore Network'}
              </div>
              <div className="text-[10px] text-slate-600 font-sans">{sale.branchName}</div>
              <div className="text-[10px] text-slate-500">Tax / GST Reg: {organization?.taxNumber || 'GST-8899210-A'}</div>
              <div className="text-[10px] text-slate-500">License: {organization?.licenseNumber || 'DL-2024-PH-991'}</div>
            </div>

            {/* Metadata */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date/Time:</span>
                <span>{sale.createdAt.replace('T', ' ').substring(0, 16)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier:</span>
                <span>{sale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient / Cust:</span>
                <span className="font-semibold">{sale.customerName || 'Walk-In'}</span>
              </div>
              {sale.prescriptionNumber && (
                <div className="flex justify-between text-blue-700 font-bold">
                  <span>Rx Number:</span>
                  <span>{sale.prescriptionNumber}</span>
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-[10px]">
                <span>ITEM / BATCH</span>
                <span>QTY × PRICE = TOTAL</span>
              </div>
              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5 text-[10px]">
                  <div className="font-bold">{item.productName}</div>
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Batch: {item.batches?.map((b) => b.batchNumber).join(',') || 'DEF'} (Exp:{' '}
                      {item.batches?.[0]?.expiryDate || '2027'})
                    </span>
                    <span>
                      {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount:</span>
                  <span>-${sale.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax (GST/VAT):</span>
                <span>+${sale.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-800 pt-1">
                <span>TOTAL AMOUNT:</span>
                <span>${sale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Paid via {sale.paymentMethod}:</span>
                <span>${sale.amountPaid.toFixed(2)}</span>
              </div>
              {sale.changeAmount > 0 && (
                <div className="flex justify-between font-semibold">
                  <span>Change Given:</span>
                  <span>${sale.changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Footer & Compliance Policy */}
            <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-1 text-[9px] text-slate-500 font-sans leading-tight">
              <div className="font-bold text-slate-800">FEFO Certified • Quality Assured</div>
              <p>Medicines once sold can only be returned within 48 hours in original intact packaging with valid doctor approval.</p>
              <p className="font-bold text-slate-700">Thank you for trusting PharmaCore Healthcare!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
