import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  Printer,
  Download,
  X,
  Copy,
  Layers,
  Settings2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { Product } from '../types.ts';

export type BarcodeSourceField = 'SKU' | 'ID' | 'BARCODE';
export type LabelPreset = 'STANDARD_TAG' | 'VIAL_LABEL' | 'THERMAL_ROLL' | 'A4_SHEET';

interface BarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  allProducts: Product[];
  initialField?: BarcodeSourceField;
}

interface ProductLabelConfig {
  productId: string;
  copies: number;
}

// Single Barcode SVG Component with JsBarcode
const BarcodeSvg: React.FC<{
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
}> = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 36,
  displayValue = true,
  fontSize = 11,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      setHasError(false);
      JsBarcode(svgRef.current, value, {
        format: format === 'EAN13' && !/^\d{12,13}$/.test(value) ? 'CODE128' : format,
        width,
        height,
        displayValue,
        fontSize,
        font: 'monospace',
        margin: 2,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch (e) {
      console.warn('Failed to render barcode with format:', format, e);
      try {
        // Fallback to CODE128
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          font: 'monospace',
          margin: 2,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (err) {
        setHasError(true);
      }
    }
  }, [value, format, width, height, displayValue, fontSize]);

  if (hasError) {
    return (
      <div className="text-[10px] text-red-500 font-mono p-1 border border-dashed border-red-300 rounded">
        Invalid barcode text: {value}
      </div>
    );
  }

  return <svg ref={svgRef} className="max-w-full h-auto mx-auto" />;
};

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  allProducts,
  initialField = 'SKU',
}) => {
  const [sourceField, setSourceField] = useState<BarcodeSourceField>(initialField);
  const [labelPreset, setLabelPreset] = useState<LabelPreset>('STANDARD_TAG');
  const [barcodeFormat, setBarcodeFormat] = useState<string>('CODE128');
  const [showPrice, setShowPrice] = useState(true);
  const [showGenericName, setShowGenericName] = useState(true);
  const [showDosageForm, setShowDosageForm] = useState(true);
  const [showRxWarning, setShowRxWarning] = useState(true);
  const [showStoreHeader, setShowStoreHeader] = useState(true);
  const [storeName, setStoreName] = useState('PharmaCore Health');
  const [defaultCopies, setDefaultCopies] = useState(2);
  const [activeProducts, setActiveProducts] = useState<Product[]>(selectedProducts);
  const [copiesMap, setCopiesMap] = useState<Record<string, number>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Initialize copies map when activeProducts change
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setActiveProducts(selectedProducts);
      const initialMap: Record<string, number> = {};
      selectedProducts.forEach((p) => {
        initialMap[p.id] = defaultCopies;
      });
      setCopiesMap(initialMap);
    } else if (allProducts.length > 0) {
      // Default to first product if none selected
      const firstOne = [allProducts[0]];
      setActiveProducts(firstOne);
      setCopiesMap({ [allProducts[0].id]: defaultCopies });
    }
  }, [selectedProducts, allProducts, defaultCopies]);

  if (!isOpen) return null;

  const handleUpdateCopies = (productId: string, delta: number) => {
    setCopiesMap((prev) => {
      const current = prev[productId] || defaultCopies;
      const next = Math.max(1, Math.min(50, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleSelectAllProducts = () => {
    setActiveProducts(allProducts);
    const initialMap: Record<string, number> = {};
    allProducts.forEach((p) => {
      initialMap[p.id] = copiesMap[p.id] || defaultCopies;
    });
    setCopiesMap(initialMap);
  };

  const handleRemoveProduct = (productId: string) => {
    setActiveProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddProductToBatch = (productId: string) => {
    const p = allProducts.find((item) => item.id === productId);
    if (p && !activeProducts.some((item) => item.id === productId)) {
      setActiveProducts((prev) => [...prev, p]);
      setCopiesMap((prev) => ({ ...prev, [productId]: defaultCopies }));
    }
  };

  const getBarcodeValue = (p: Product): string => {
    if (sourceField === 'SKU') return p.sku || `SKU-${p.id}`;
    if (sourceField === 'ID') return p.id;
    return p.barcode || p.sku || p.id;
  };

  const totalLabelsToPrint = activeProducts.reduce(
    (sum, p) => sum + (copiesMap[p.id] || defaultCopies),
    0
  );

  const handlePrint = () => {
    const printContent = document.getElementById('printable-barcode-sheet');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print barcode stickers');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PharmaCore - Barcode Sticker Labels (${labelPreset})</title>
          <style>
            @page {
              size: ${
                labelPreset === 'A4_SHEET'
                  ? 'A4 portrait'
                  : labelPreset === 'VIAL_LABEL'
                  ? '38mm 25mm'
                  : labelPreset === 'THERMAL_ROLL'
                  ? '58mm 40mm'
                  : '50mm 30mm'
              };
              margin: ${labelPreset === 'A4_SHEET' ? '10mm' : '2mm'};
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: ${labelPreset === 'A4_SHEET' ? '10px' : '0'};
              background: #ffffff;
              color: #000000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .grid-container {
              display: ${labelPreset === 'A4_SHEET' ? 'grid' : 'flex'};
              grid-template-columns: ${labelPreset === 'A4_SHEET' ? 'repeat(3, 1fr)' : 'none'};
              gap: ${labelPreset === 'A4_SHEET' ? '8px' : '6px'};
              flex-wrap: wrap;
            }
            .sticker-card {
              box-sizing: border-box;
              border: 1px dashed #cccccc;
              padding: 4px 6px;
              page-break-inside: avoid;
              background: #ffffff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              border-radius: 4px;
              width: ${
                labelPreset === 'A4_SHEET'
                  ? 'auto'
                  : labelPreset === 'VIAL_LABEL'
                  ? '36mm'
                  : labelPreset === 'THERMAL_ROLL'
                  ? '54mm'
                  : '48mm'
              };
              min-height: ${
                labelPreset === 'VIAL_LABEL' ? '23mm' : labelPreset === 'THERMAL_ROLL' ? '36mm' : '28mm'
              };
            }
            .store-header {
              font-size: 8px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #eeeeee;
              padding-bottom: 2px;
              margin-bottom: 2px;
              color: #333333;
            }
            .prod-name {
              font-size: 10px;
              font-weight: 700;
              line-height: 1.1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .prod-generic {
              font-size: 8px;
              color: #555555;
              line-height: 1;
            }
            .price-tag {
              font-size: 11px;
              font-weight: 800;
              font-family: monospace;
            }
            .rx-badge {
              display: inline-block;
              font-size: 7px;
              font-weight: 800;
              color: #b91c1c;
              border: 1px solid #b91c1c;
              border-radius: 2px;
              padding: 0 2px;
              margin-left: 3px;
            }
            svg {
              max-width: 100%;
              height: auto;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="grid-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportSinglePNG = (product: Product) => {
    const value = getBarcodeValue(product);
    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, value, {
        format: barcodeFormat === 'EAN13' && !/^\d{12,13}$/.test(value) ? 'CODE128' : barcodeFormat,
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        font: 'monospace',
        margin: 10,
        background: '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Barcode_${sourceField}_${product.sku || product.id}.png`;
      link.click();
    } catch (e) {
      alert('Error generating barcode image.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Barcode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">Pharmacy Barcode & Label Sticker Studio</h2>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                  {totalLabelsToPrint} Labels Scheduled
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate high-density scannable barcode tags for shelves, amber vials, and inventory packaging.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="print-barcode-stickers-button"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Stickers ({totalLabelsToPrint})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Controls & Settings Sidebar */}
          <div className="w-80 border-r border-slate-200 bg-slate-50/70 p-4 space-y-4 overflow-y-auto text-xs">
            {/* Barcode Encoding Source */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Barcode Value Source</span>
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setSourceField('SKU')}
                  className={`py-1 rounded text-[11px] font-medium transition ${
                    sourceField === 'SKU'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  SKU
                </button>
                <button
                  onClick={() => setSourceField('BARCODE')}
                  className={`py-1 rounded text-[11px] font-medium transition ${
                    sourceField === 'BARCODE'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Barcode
                </button>
                <button
                  onClick={() => setSourceField('ID')}
                  className={`py-1 rounded text-[11px] font-medium transition ${
                    sourceField === 'ID'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Item ID
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {sourceField === 'SKU' && 'Encodes alphanumeric SKU code (e.g. MED-625MG).'}
                {sourceField === 'BARCODE' && 'Encodes the registered commercial EAN/UPC bar numbers.'}
                {sourceField === 'ID' && 'Encodes unique internal system ID for database indexing.'}
              </p>
            </div>

            {/* Sticker Preset / Layout */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-600" />
                <span>Label Paper & Size Preset</span>
              </label>
              <select
                value={labelPreset}
                onChange={(e) => setLabelPreset(e.target.value as LabelPreset)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="STANDARD_TAG">Standard Shelf Tag (50mm x 30mm)</option>
                <option value="VIAL_LABEL">Amber Bottle / Vial Sticker (38mm x 25mm)</option>
                <option value="THERMAL_ROLL">Continuous Thermal Roll (58mm)</option>
                <option value="A4_SHEET">A4 Sheet Label Grid (3 × 8 per page)</option>
              </select>

              <div className="pt-1">
                <label className="text-[11px] text-slate-600 font-medium">Barcode Symbology</label>
                <select
                  value={barcodeFormat}
                  onChange={(e) => setBarcodeFormat(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="CODE128">Code 128 (Alphanumeric, Auto)</option>
                  <option value="CODE39">Code 39</option>
                  <option value="EAN13">EAN-13 (Standard Retail)</option>
                  <option value="ITF">ITF (Interleaved 2 of 5)</option>
                </select>
              </div>
            </div>

            {/* Sticker Elements Toggle */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2">
              <label className="font-bold text-slate-800">Label Print Elements</label>
              <div className="space-y-1.5 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStoreHeader}
                    onChange={(e) => setShowStoreHeader(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Store Header Banner</span>
                </label>

                {showStoreHeader && (
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Store banner text"
                    className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-800"
                  />
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Selling Retail Price ($)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGenericName}
                    onChange={(e) => setShowGenericName(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Generic Name & Active Salts</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDosageForm}
                    onChange={(e) => setShowDosageForm(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Dosage Form & Strength</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRxWarning}
                    onChange={(e) => setShowRxWarning(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Rx Prescription Indicator</span>
                </label>
              </div>
            </div>

            {/* Batch Item Selector */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">Medicines in Queue ({activeProducts.length})</label>
                <button
                  onClick={handleSelectAllProducts}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Select All ({allProducts.length})
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto divide-y divide-slate-100">
                {activeProducts.map((p) => (
                  <div key={p.id} className="pt-1 flex items-center justify-between gap-1">
                    <div className="truncate text-[11px] font-medium text-slate-800 pr-1">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleUpdateCopies(p.id, -1)}
                        className="h-5 w-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-slate-900 text-xs">
                        {copiesMap[p.id] || defaultCopies}
                      </span>
                      <button
                        onClick={() => handleUpdateCopies(p.id, 1)}
                        className="h-5 w-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveProduct(p.id)}
                        className="ml-1 text-slate-400 hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add other product dropdown */}
              <div className="pt-2 border-t border-slate-100">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddProductToBatch(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 text-[11px] text-slate-700 focus:border-blue-500"
                >
                  <option value="">+ Add another medicine to queue...</option>
                  {allProducts
                    .filter((p) => !activeProducts.some((a) => a.id === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Live Sticker Preview Canvas */}
          <div className="flex-1 bg-slate-100/70 p-6 overflow-y-auto flex flex-col items-center">
            <div className="w-full max-w-3xl flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <span>Sticker Sheet Live Preview</span>
                <span className="text-slate-400 font-normal">
                  ({labelPreset.replace('_', ' ')}) • {totalLabelsToPrint} total stickers
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeProducts[0]) handleExportSinglePNG(activeProducts[0]);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs transition"
                  title="Download single sticker PNG"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600" />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>

            {/* Printable Container */}
            <div
              id="printable-barcode-sheet"
              className={`w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm min-h-[420px] ${
                labelPreset === 'A4_SHEET'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'
                  : 'flex flex-wrap gap-4 justify-center'
              }`}
            >
              {activeProducts.map((p) => {
                const count = copiesMap[p.id] || defaultCopies;
                const barcodeVal = getBarcodeValue(p);

                return Array.from({ length: count }).map((_, idx) => (
                  <div
                    key={`${p.id}-${idx}`}
                    className={`sticker-card border border-dashed border-slate-300 rounded-lg p-3 bg-white flex flex-col justify-between text-center transition hover:border-blue-400 ${
                      labelPreset === 'VIAL_LABEL'
                        ? 'w-44 min-h-[120px] p-2'
                        : labelPreset === 'THERMAL_ROLL'
                        ? 'w-56 min-h-[150px]'
                        : labelPreset === 'A4_SHEET'
                        ? 'w-full min-h-[140px]'
                        : 'w-52 min-h-[145px]'
                    }`}
                  >
                    {/* Header */}
                    {showStoreHeader && (
                      <div className="store-header text-[9px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-1 mb-1">
                        {storeName}
                      </div>
                    )}

                    {/* Product Name & Rx */}
                    <div className="space-y-0.5">
                      <div className="prod-name text-xs font-bold text-slate-900 truncate">
                        {p.name}
                        {showRxWarning && p.prescriptionRequired && (
                          <span className="rx-badge ml-1 rounded bg-red-50 text-red-700 px-1 py-0.2 text-[8px] font-bold border border-red-200">
                            Rx
                          </span>
                        )}
                      </div>

                      {showGenericName && (
                        <div className="prod-generic text-[9px] text-slate-500 truncate">
                          {p.genericName}
                        </div>
                      )}

                      {showDosageForm && (
                        <div className="text-[9px] text-slate-600 font-medium">
                          {p.dosageForm} • {p.strength}
                        </div>
                      )}
                    </div>

                    {/* Barcode Graphic */}
                    <div className="py-1 flex justify-center">
                      <BarcodeSvg
                        value={barcodeVal}
                        format={barcodeFormat}
                        width={labelPreset === 'VIAL_LABEL' ? 1.3 : 1.5}
                        height={labelPreset === 'VIAL_LABEL' ? 26 : 34}
                        fontSize={10}
                        displayValue={true}
                      />
                    </div>

                    {/* Footer Info & Price */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-1 text-[10px]">
                      <span className="font-mono text-slate-500 text-[9px]">
                        {sourceField}: {barcodeVal}
                      </span>
                      {showPrice && (
                        <span className="price-tag font-bold text-slate-900 text-xs font-mono">
                          ${p.sellingPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ));
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
