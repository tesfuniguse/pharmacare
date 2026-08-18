import React, { useState } from 'react';
import {
  Pill,
  Search,
  Plus,
  Filter,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Building,
  Layers,
  FileText,
  X,
  Barcode,
  Printer,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Product, Category, Manufacturer, DosageForm } from '../types.ts';
import { BarcodeGeneratorModal, BarcodeSourceField } from './BarcodeGeneratorModal.tsx';

interface MedicinesViewProps {
  products: Product[];
  categories: Category[];
  manufacturers: Manufacturer[];
  onAddProduct: (product: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void>;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({
  products,
  categories,
  manufacturers,
  onAddProduct,
  onUpdateProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [rxOnlyFilter, setRxOnlyFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Barcode Label Generation States
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [selectedForBarcode, setSelectedForBarcode] = useState<Product[]>([]);
  const [barcodeSourceField, setBarcodeSourceField] = useState<BarcodeSourceField>('SKU');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    genericName: '',
    brandName: '',
    sku: '',
    barcode: '',
    categoryId: categories[0]?.id || 'cat-1',
    dosageForm: 'Tablet',
    strength: '500mg',
    unit: 'Strip of 10 Tablets',
    manufacturerId: manufacturers[0]?.id || 'mfr-1',
    description: '',
    prescriptionRequired: false,
    taxRate: 5.0,
    minimumStock: 20,
    reorderLevel: 50,
    sellingPrice: 10.0,
    status: 'ACTIVE',
  });

  const dosageForms: DosageForm[] = [
    'Tablet',
    'Capsule',
    'Syrup',
    'Injection',
    'Cream',
    'Ointment',
    'Drops',
    'Suppository',
    'Inhaler',
    'Powder',
    'Medical Equipment',
    'Other',
  ];

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      p.genericName.toLowerCase().includes(term) ||
      (p.brandName && p.brandName.toLowerCase().includes(term)) ||
      p.barcode.includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.manufacturerName && p.manufacturerName.toLowerCase().includes(term));

    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesRx = !rxOnlyFilter || p.prescriptionRequired;

    return matchesSearch && matchesCategory && matchesRx;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      genericName: '',
      brandName: '',
      sku: `MED-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      barcode: `8901${Math.floor(100000000 + Math.random() * 900000000)}`,
      categoryId: categories[0]?.id || 'cat-1',
      dosageForm: 'Tablet',
      strength: '',
      unit: 'Box / Pack',
      manufacturerId: manufacturers[0]?.id || 'mfr-1',
      description: '',
      prescriptionRequired: false,
      taxRate: 5.0,
      minimumStock: 20,
      reorderLevel: 50,
      sellingPrice: 15.0,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, formData);
    } else {
      await onAddProduct(formData);
    }
    setIsModalOpen(false);
  };

  const handleOpenBarcodeModal = (productsToPrint?: Product[], source: BarcodeSourceField = 'SKU') => {
    if (productsToPrint && productsToPrint.length > 0) {
      setSelectedForBarcode(productsToPrint);
    } else if (selectedProductIds.length > 0) {
      const selected = products.filter((p) => selectedProductIds.includes(p.id));
      setSelectedForBarcode(selected);
    } else {
      setSelectedForBarcode(products.slice(0, 5));
    }
    setBarcodeSourceField(source);
    setIsBarcodeModalOpen(true);
  };

  const handleToggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleProductSelection = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            <span>Medicines & Formulary Catalog</span>
          </h1>
          <p className="text-xs text-slate-500">
            Manage pharmaceutical products, dosages, prescription regulations, and safety levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="generate-barcode-stickers-btn"
            onClick={() => handleOpenBarcodeModal()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 shadow-xs transition"
          >
            <Barcode className="h-4 w-4 text-blue-600" />
            <span>Barcode & Sticker Studio</span>
          </button>

          <button
            id="add-medicine-button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Medicine</span>
          </button>
        </div>
      </div>

      {/* Batch Action Toolbar (When items selected) */}
      {selectedProductIds.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-xs text-blue-900 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            <span>
              <strong>{selectedProductIds.length}</strong> medicine(s) selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenBarcodeModal(undefined, 'SKU')}
              className="flex items-center gap-1 bg-blue-600 text-white font-semibold px-3 py-1 rounded-lg hover:bg-blue-500 transition shadow-xs"
            >
              <Barcode className="h-3.5 w-3.5" />
              <span>Print Barcode Stickers (SKU)</span>
            </button>

            <button
              onClick={() => handleOpenBarcodeModal(undefined, 'ID')}
              className="flex items-center gap-1 bg-white border border-blue-300 text-blue-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-50 transition shadow-xs"
            >
              <span>Print Barcodes (Unique ID)</span>
            </button>

            <button
              onClick={() => setSelectedProductIds([])}
              className="text-slate-500 hover:text-slate-700 px-2 py-1 text-xs"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="medicine-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, generic, brand, SKU, barcode..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <select
            id="category-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              id="rx-only-filter-checkbox"
              checked={rxOnlyFilter}
              onChange={(e) => setRxOnlyFilter(e.target.checked)}
              className="rounded border-slate-300 bg-slate-50 text-blue-600 focus:ring-blue-500"
            />
            <span>Rx Only (Prescription)</span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  id="select-all-medicines-checkbox"
                  checked={
                    selectedProductIds.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                  title="Select all medicines for batch barcode printing"
                />
              </th>
              <th className="py-3 px-4">Medicine & Generic</th>
              <th className="py-3 px-4">Dosage / Unit</th>
              <th className="py-3 px-4">SKU / Barcode</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Stock & Batches</th>
              <th className="py-3 px-4">Selling Price</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((p) => {
              const isSelected = selectedProductIds.includes(p.id);
              return (
                <tr
                  key={p.id}
                  className={`transition ${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                >
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      id={`select-product-${p.id}`}
                      checked={isSelected}
                      onChange={() => handleToggleProductSelection(p.id)}
                      className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.prescriptionRequired && (
                        <span className="rounded bg-red-50 px-1.5 py-0.2 text-[9px] font-bold text-red-700 border border-red-200">
                          Rx
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Generic: <span className="text-slate-700">{p.genericName}</span>
                      {p.brandName && ` • Brand: ${p.brandName}`}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>SKU: {p.sku}</span>
                      <button
                        onClick={() => handleOpenBarcodeModal([p], 'SKU')}
                        className="text-[10px] text-blue-600 hover:underline flex items-center"
                        title="Print SKU Barcode"
                      >
                        (print)
                      </button>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <span>{p.barcode}</span>
                      <button
                        onClick={() => handleOpenBarcodeModal([p], 'BARCODE')}
                        className="text-[10px] text-slate-500 hover:text-blue-600 hover:underline"
                        title="Print EAN/UPC Barcode"
                      >
                        (print)
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-slate-600">{p.categoryName || 'General'}</td>

                  <td className="py-3 px-4">
                    <div
                      className={`font-semibold ${
                        (p.totalStock || 0) <= p.minimumStock ? 'text-red-600' : 'text-green-700'
                      }`}
                    >
                      {p.totalStock || 0} units
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {p.activeBatchesCount || 0} active batches • Min: {p.minimumStock}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">${p.sellingPrice.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400">Tax: {p.taxRate}%</div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        id={`print-barcode-${p.id}`}
                        onClick={() => handleOpenBarcodeModal([p], 'SKU')}
                        className="rounded p-1.5 text-blue-600 hover:bg-blue-50 transition"
                        title="Generate & Print Barcode Label (SKU / ID / EAN)"
                      >
                        <Barcode className="h-4 w-4" />
                      </button>

                      <button
                        id={`edit-medicine-${p.id}`}
                        onClick={() => handleOpenEdit(p)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                        title="Edit Medicine"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {editingProduct ? 'Edit Medicine Formulary Entry' : 'Add New Medicine to Formulary'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-medium">Medicine Commercial Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Amoxicillin Clavulanate 625mg"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Generic / Chemical Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.genericName || ''}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder="e.g. Amoxicillin + Clavulanic Acid"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Brand Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.brandName || ''}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="e.g. Augmentin Duo"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Therapeutic Category *</label>
                  <select
                    value={formData.categoryId || categories[0]?.id}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Dosage Form *</label>
                  <select
                    value={formData.dosageForm || 'Tablet'}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value as DosageForm })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {dosageForms.map((df) => (
                      <option key={df} value={df}>
                        {df}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Strength *</label>
                  <input
                    type="text"
                    required
                    value={formData.strength || ''}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g. 625mg, 100mcg/dose, 1%"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Barcode (EAN/UPC) *</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice || 0}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.taxRate || 0}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Minimum Stock Threshold</label>
                  <input
                    type="number"
                    value={formData.minimumStock || 0}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium">Reorder Alert Level</label>
                  <input
                    type="number"
                    value={formData.reorderLevel || 0}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal-rx-required"
                  checked={formData.prescriptionRequired || false}
                  onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                  className="rounded border-slate-300 bg-slate-50 text-blue-600"
                />
                <label htmlFor="modal-rx-required" className="text-slate-700 font-medium cursor-pointer">
                  Prescription Required (Schedule / Rx Control)
                </label>
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
                  id="save-medicine-button"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Create Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode & Label Sticker Generator Studio Modal */}
      <BarcodeGeneratorModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        selectedProducts={selectedForBarcode}
        allProducts={products}
        initialField={barcodeSourceField}
      />
    </div>
  );
};
