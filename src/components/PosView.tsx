import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  User,
  FileText,
  CreditCard,
  Banknote,
  DollarSign,
  Smartphone,
  Layers,
  Printer,
  Sparkles,
  Tag,
  ShieldAlert,
  Clock,
  X,
} from 'lucide-react';
import {
  Product,
  CartItem,
  Customer,
  Prescription,
  PaymentMethod,
  Branch,
  User as AppUser,
  Sale,
} from '../types.ts';

interface PosViewProps {
  products: Product[];
  customers: Customer[];
  prescriptions: Prescription[];
  currentBranch: Branch;
  currentUser: AppUser;
  onCompleteSale: (saleData: any) => Promise<Sale | null>;
  onShowReceipt: (sale: Sale) => void;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  customers,
  prescriptions,
  currentBranch,
  currentUser,
  onCompleteSale,
  onShowReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[3] || null); // default walk-in
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [tenderAmount, setTenderAmount] = useState<string>('');
  const [cardRef, setCardRef] = useState('');
  const [mobileRef, setMobileRef] = useState('');
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fefoAllocations, setFefoAllocations] = useState<{ [productId: string]: any[] }>({});

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Filter products for quick POS grid
  const filteredProducts = products.filter((p) => {
    if (p.status !== 'ACTIVE') return false;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.genericName.toLowerCase().includes(term) ||
      p.barcode.includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.brandName && p.brandName.toLowerCase().includes(term))
    );
  });

  // Fetch FEFO batch allocations for product
  const getFefoAllocation = async (product: Product, quantity: number) => {
    try {
      const res = await fetch('/api/v1/batches/fefo-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: currentBranch?.id || 'branch-1',
          productId: product.id,
          quantity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        return data.allocated;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Add product to cart with automatic FEFO allocation
  const addToCart = async (product: Product, quantityToAdd = 1) => {
    setErrorMessage(null);
    const existingIndex = cart.findIndex((i) => i.product.id === product.id);
    const newQty = existingIndex > -1 ? cart[existingIndex].quantity + quantityToAdd : quantityToAdd;

    // Verify FEFO
    const allocation = await getFefoAllocation(product, newQty);
    if (!allocation) {
      setErrorMessage(`Insufficient available stock for ${product.name} (Only non-expired batches can be sold).`);
      return;
    }

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity = newQty;
      newCart[existingIndex].allocatedBatches = allocation;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: newQty,
          unitPrice: product.sellingPrice,
          discountPercent: 0,
          taxPercent: product.taxRate,
          allocatedBatches: allocation,
        },
      ]);
    }
  };

  // Barcode submit handler
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      await addToCart(matched, 1);
      setBarcodeInput('');
    } else {
      setErrorMessage(`No medicine found matching barcode: ${barcodeInput}`);
    }
  };

  // Update item quantity
  const updateQuantity = async (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    const item = cart[index];
    const allocation = await getFefoAllocation(item.product, newQty);
    if (!allocation) {
      setErrorMessage(`Cannot increase ${item.product.name} to ${newQty}. Insufficient valid stock.`);
      return;
    }
    const newCart = [...cart];
    newCart[index].quantity = newQty;
    newCart[index].allocatedBatches = allocation;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discount = (itemTotal * item.discountPercent) / 100;
    return sum + (itemTotal - discount);
  }, 0);

  const discountAmount = (subtotal * overallDiscountPercent) / 100;
  const discountedSubtotal = subtotal - discountAmount;

  const taxAmount = cart.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
    return sum + (itemTotal * item.taxPercent) / 100;
  }, 0);

  const totalAmount = discountedSubtotal + taxAmount;

  const tender = parseFloat(tenderAmount) || (paymentMethod === 'CASH' ? totalAmount : totalAmount);
  const changeAmount = Math.max(0, tender - totalAmount);

  // Link selected prescription items to cart
  const linkPrescription = (rx: Prescription) => {
    setSelectedRx(rx);
    const cust = customers.find((c) => c.id === rx.customerId);
    if (cust) setSelectedCustomer(cust);

    // Auto add prescription items to cart
    rx.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && item.remainingQuantity > 0) {
        addToCart(prod, item.remainingQuantity);
      }
    });
  };

  // Handle Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setErrorMessage(null);

    // Verify Prescription requirement
    const hasRxRequired = cart.some((i) => i.product.prescriptionRequired);
    if (hasRxRequired && !selectedRx && selectedCustomer?.id === 'cust-4') {
      const confirmed = window.confirm(
        'Warning: Cart contains Prescription-Required medicines (Rx Only). Click OK to confirm verified doctor prescription presented at counter.'
      );
      if (!confirmed) return;
    }

    // Verify Credit Limit if paying with Credit
    if (paymentMethod === 'CREDIT') {
      if (!selectedCustomer || selectedCustomer.id === 'cust-4') {
        setErrorMessage('Cannot process credit sale for anonymous Walk-In. Please select a registered customer.');
        return;
      }
      if (selectedCustomer.creditBalance + totalAmount > selectedCustomer.creditLimit) {
        setErrorMessage(
          `Customer credit limit exceeded! Available credit: $${(
            selectedCustomer.creditLimit - selectedCustomer.creditBalance
          ).toFixed(2)}, Sale total: $${totalAmount.toFixed(2)}`
        );
        return;
      }
    }

    setIsProcessing(true);

    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      genericName: item.product.genericName,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      taxPercent: item.taxPercent,
      subtotal: item.quantity * item.unitPrice,
      total: item.quantity * item.unitPrice * (1 - item.discountPercent / 100) * (1 + item.taxPercent / 100),
      batches: item.allocatedBatches.map((b) => ({
        batchId: b.batchId,
        batchNumber: b.batchNumber,
        expiryDate: b.expiryDate,
        quantity: b.quantity,
        unitCost: b.purchasePrice,
      })),
    }));

    const salePayload = {
      organizationId: 'org-1',
      branchId: currentBranch?.id || 'branch-1',
      branchName: currentBranch?.name || 'Downtown Central Pharmacy',
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      prescriptionId: selectedRx?.id,
      prescriptionNumber: selectedRx?.prescriptionNumber,
      items: saleItems,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentBreakdown: [
        {
          method: paymentMethod,
          amount: totalAmount,
          reference: paymentMethod === 'CARD' ? cardRef : paymentMethod === 'MOBILE_PAYMENT' ? mobileRef : undefined,
        },
      ],
      amountPaid: tender,
      changeAmount,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      status: 'COMPLETED',
    };

    try {
      const completedSale = await onCompleteSale(salePayload);
      if (completedSale) {
        setCart([]);
        setSelectedRx(null);
        setTenderAmount('');
        onShowReceipt(completedSale);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Barcode & Product Catalog Selection (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Top Controls: Fast Barcode Scanner & Search */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barcode Scanner Input */}
            <form onSubmit={handleBarcodeScan} className="flex-1 relative">
              <div className="flex items-center">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                  <Barcode className="h-5 w-5" />
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  id="pos-barcode-scanner-input"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or press Enter..."
                  className="w-full rounded-lg border border-blue-200 bg-slate-50 py-2.5 pl-10 pr-20 text-sm font-mono text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  id="pos-scan-submit-button"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  Scan
                </button>
              </div>
            </form>

            {/* Keyword search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                id="pos-product-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, generic, brand..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Active Prescriptions Banner if available */}
          {prescriptions.filter((r) => r.status === 'PENDING').length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>
                  {prescriptions.filter((r) => r.status === 'PENDING').length} Prescriptions Ready for Dispensing
                </span>
              </div>
              <div className="flex items-center gap-2">
                {prescriptions
                  .filter((r) => r.status === 'PENDING')
                  .slice(0, 2)
                  .map((rx) => (
                    <button
                      key={rx.id}
                      id={`load-rx-${rx.id}`}
                      onClick={() => linkPrescription(rx)}
                      className="rounded bg-blue-600 hover:bg-blue-500 px-2 py-0.5 text-[11px] font-semibold text-white transition shadow-xs"
                    >
                      Dispense {rx.prescriptionNumber} ({rx.customerName.split(' ')[0]})
                    </button>
                  ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Product Formulary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredProducts.map((product) => {
            const hasStock = (product.totalStock || 0) > 0;
            return (
              <div
                key={product.id}
                id={`pos-product-card-${product.id}`}
                onClick={() => hasStock && addToCart(product, 1)}
                className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                  hasStock
                    ? 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs cursor-pointer'
                    : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      {product.dosageForm}
                    </span>
                    {product.prescriptionRequired && (
                      <span className="rounded bg-red-50 px-1.5 py-0.2 text-[9px] font-bold text-red-700 border border-red-200">
                        Rx Required
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{product.genericName}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900">${product.sellingPrice.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{product.sku}</div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        hasStock
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {hasStock ? `${product.totalStock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: POS Cart, FEFO Batch Allocations & Checkout (5 cols) */}
      <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        {/* Cart Header & Customer Selector */}
        <div className="space-y-3 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <span>Checkout Cart ({cart.length} items)</span>
            </h2>
            {cart.length > 0 && (
              <button
                id="pos-clear-cart-button"
                onClick={() => setCart([])}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              id="pos-customer-select"
              value={selectedCustomer?.id || 'cust-4'}
              onChange={(e) => {
                const c = customers.find((cust) => cust.id === e.target.value);
                setSelectedCustomer(c || null);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-800">
                  {c.name} {c.phone ? `(${c.phone})` : ''} {c.creditBalance > 0 ? `• Due: $${c.creditBalance.toFixed(2)}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Credit Status pill if customer has balance or allergies */}
          {selectedCustomer && selectedCustomer.id !== 'cust-4' && (
            <div className="rounded-lg bg-slate-50 p-2 text-xs space-y-1 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Credit Limit: ${selectedCustomer.creditLimit.toFixed(2)}</span>
                <span className={selectedCustomer.creditBalance > 0 ? 'text-orange-600 font-semibold' : 'text-slate-500'}>
                  Outstanding: ${selectedCustomer.creditBalance.toFixed(2)}
                </span>
              </div>
              {selectedCustomer.allergies && selectedCustomer.allergies.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-600 font-semibold">
                  <ShieldAlert className="h-3 w-3" />
                  <span>Allergies: {selectedCustomer.allergies.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {selectedRx && (
            <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 p-2 text-xs text-blue-800">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Rx: {selectedRx.prescriptionNumber} ({selectedRx.doctorName})</span>
              </div>
              <button onClick={() => setSelectedRx(null)} className="text-blue-600 hover:text-blue-800">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Cart Item List with FEFO Allocated Batches Breakdown */}
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-slate-600">Cart is empty.</p>
              <p className="text-[11px] text-slate-400 mt-1">Scan a barcode or click a medicine to begin.</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={item.product.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-800">{item.product.name}</div>
                    <div className="text-[11px] text-slate-500">
                      ${item.unitPrice.toFixed(2)} × {item.quantity} = $
                      {(item.quantity * item.unitPrice * (1 - item.discountPercent / 100)).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* FEFO Allocated Batch Tag */}
                {item.allocatedBatches && item.allocatedBatches.length > 0 && (
                  <div className="rounded bg-white px-2 py-1 text-[10px] text-slate-600 border border-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <Clock className="h-3 w-3" />
                      <span>FEFO Batch: {item.allocatedBatches.map((b) => `${b.batchNumber} (${b.quantity}u)`).join(', ')}</span>
                    </span>
                    <span className="text-slate-400">Exp: {item.allocatedBatches[0]?.expiryDate}</span>
                  </div>
                )}

                {/* Quantity adjustments */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="rounded bg-white border border-slate-200 p-1 text-slate-700 hover:bg-slate-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="rounded bg-white border border-slate-200 p-1 text-slate-700 hover:bg-slate-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Tax: {item.taxPercent}%</span>
                    <span className="font-bold text-slate-900">
                      ${(item.quantity * item.unitPrice * (1 - item.discountPercent / 100) * (1 + item.taxPercent / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Discounts Breakdown */}
        {cart.length > 0 && (
          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-700">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount ({overallDiscountPercent}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Tax (GST/VAT):</span>
              <span className="font-medium text-slate-700">+${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="text-blue-600 text-base font-bold">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Payment Methods Picker */}
        {cart.length > 0 && (
          <div className="space-y-3 pt-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'CASH', label: 'Cash', icon: Banknote },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                  { id: 'MOBILE_PAYMENT', label: 'Mobile', icon: Smartphone },
                  { id: 'BANK_TRANSFER', label: 'Transfer', icon: DollarSign },
                  { id: 'CREDIT', label: 'Credit (AR)', icon: User },
                ] as const
              ).map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    id={`payment-method-${method.id.toLowerCase()}`}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      paymentMethod === method.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cash Tender & Change */}
            {paymentMethod === 'CASH' && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">Cash Tendered ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    id="pos-cash-tender-input"
                    value={tenderAmount}
                    onChange={(e) => setTenderAmount(e.target.value)}
                    placeholder={totalAmount.toFixed(2)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-medium">Change Due:</div>
                  <div className="text-sm font-bold text-green-600 font-mono pt-1">
                    ${changeAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div>
                <label className="text-[10px] text-slate-500 font-medium">Card Auth Code / Terminal Ref:</label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. AUTH-92810"
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            )}

            {/* Submit Checkout Button */}
            <button
              id="pos-complete-checkout-button"
              onClick={handleCheckout}
              disabled={isProcessing || cart.length === 0}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isProcessing ? 'Processing Transaction...' : `Complete Sale ($${totalAmount.toFixed(2)})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
