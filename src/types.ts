export type UserRole =
  | 'SUPER_ADMIN'
  | 'PHARMACY_OWNER'
  | 'BRANCH_MANAGER'
  | 'PHARMACIST'
  | 'CASHIER'
  | 'INVENTORY_MANAGER'
  | 'ACCOUNTANT';

export interface Permission {
  id: string;
  name: string;
  category: 'INVENTORY' | 'POS' | 'PRESCRIPTIONS' | 'FINANCE' | 'REPORTS' | 'USERS' | 'SETTINGS';
  description: string;
}

export interface User {
  id: string;
  organizationId: string;
  branchId?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  taxId?: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  logoUrl?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  isMainBranch: boolean;
  isActive: boolean;
  createdAt: string;
}

export type DosageForm =
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Injection'
  | 'Cream'
  | 'Ointment'
  | 'Drops'
  | 'Suppository'
  | 'Inhaler'
  | 'Powder'
  | 'Medical Equipment'
  | 'Other';

export interface Category {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
}

export interface Manufacturer {
  id: string;
  organizationId: string;
  name: string;
  country?: string;
}

export interface Product {
  id: string;
  organizationId: string;
  sku: string;
  barcode: string;
  name: string;
  genericName: string;
  brandName?: string;
  categoryId: string;
  categoryName?: string;
  dosageForm: DosageForm;
  strength: string;
  unit: string; // e.g. "strip of 10", "100ml bottle", "box", "vial"
  manufacturerId: string;
  manufacturerName?: string;
  description?: string;
  prescriptionRequired: boolean;
  taxRate: number; // percentage, e.g. 5, 10
  minimumStock: number;
  reorderLevel: number;
  sellingPrice: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  createdAt: string;
  updatedAt: string;
  // Computed aggregations per branch
  totalStock?: number;
  activeBatchesCount?: number;
}

export interface ProductBatch {
  id: string;
  organizationId: string;
  branchId: string;
  productId: string;
  productName?: string;
  sku?: string;
  barcode?: string;
  batchNumber: string;
  manufacturingDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  supplierId?: string;
  supplierName?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED' | 'QUARANTINED';
  createdAt: string;
  updatedAt: string;
}

export type InventoryTransactionType =
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'EXPIRED'
  | 'DAMAGED'
  | 'LOSS';

export interface InventoryTransaction {
  id: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  type: InventoryTransactionType;
  quantity: number; // positive for addition, negative for deduction
  balanceAfter: number;
  referenceType?: 'SALE' | 'PURCHASE_ORDER' | 'STOCK_TRANSFER' | 'MANUAL_ADJUSTMENT' | 'CUSTOMER_RETURN' | 'SUPPLIER_RETURN';
  referenceId?: string;
  reason?: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  organizationId: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StockAdjustment {
  id: string;
  organizationId: string;
  branchId: string;
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  adjustmentType: 'DAMAGED' | 'EXPIRED' | 'PHYSICAL_COUNT' | 'THEFT_LOSS' | 'OTHER';
  quantityDelta: number; // can be negative or positive
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxNumber?: string;
  paymentTerms: string; // e.g. "Net 30", "Immediate"
  creditLimit: number;
  currentBalance: number; // payable
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  discountRate: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  notes?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  receivedAt?: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  allergies?: string[];
  notes?: string;
  creditLimit: number;
  creditBalance: number;
  totalSpent: number;
  totalPrescriptions: number;
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  productId: string;
  productName: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "3 times daily"
  duration: string; // e.g. "7 days"
  quantity: number;
  instructions: string; // e.g. "Take with food"
  dispensedQuantity: number;
  remainingQuantity: number;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  organizationId: string;
  branchId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  doctorName: string;
  doctorLicense?: string;
  hospitalClinic?: string;
  prescriptionDate: string;
  expiryDate?: string;
  diagnosis?: string;
  items: PrescriptionItem[];
  status: 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED' | 'CANCELLED';
  notes?: string;
  pharmacistId?: string;
  pharmacistName?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  // Selected batches for FEFO dispensing
  allocatedBatches: {
    batchId: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    purchasePrice: number;
  }[];
}

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'MOBILE_PAYMENT'
  | 'CREDIT'
  | 'MIXED';

export interface PaymentBreakdown {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  genericName?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  subtotal: number;
  total: number;
  batches: {
    batchId: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitCost: number;
  }[];
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  prescriptionId?: string;
  prescriptionNumber?: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  cogsTotal: number; // Cost of goods sold for profit calculation
  grossProfit: number; // totalAmount - cogsTotal
  paymentMethod: PaymentMethod;
  paymentBreakdown: PaymentBreakdown[];
  amountPaid: number;
  changeAmount: number;
  cashierId: string;
  cashierName: string;
  status: 'COMPLETED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'VOIDED';
  notes?: string;
  createdAt: string;
}

export interface CustomerReturnItem {
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  restockable: boolean;
  reason: string;
}

export interface CustomerReturn {
  id: string;
  returnNumber: string;
  organizationId: string;
  branchId: string;
  saleId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  items: CustomerReturnItem[];
  totalRefundAmount: number;
  refundMethod: 'CASH' | 'STORE_CREDIT' | 'ORIGINAL_PAYMENT';
  processedBy: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Internet'
  | 'Salary'
  | 'Transportation'
  | 'Maintenance'
  | 'Packaging'
  | 'Marketing'
  | 'Licenses & Taxes'
  | 'Other'
  | 'RENT'
  | 'UTILITIES'
  | 'SALARIES'
  | 'PACKAGING'
  | 'MAINTENANCE'
  | 'MARKETING'
  | 'LICENSES'
  | 'OTHER';

export type Batch = ProductBatch;
export type BatchStatus = 'ACTIVE' | 'EXPIRED' | 'DEPLETED' | 'QUARANTINED';

export type ReorderRecommendation = AIReorderRecommendation & {
  sku?: string;
  dailyVelocity?: number;
  suggestedOrderQuantity?: number;
};

export type ExpiryRisk = AIExpiryRisk & {
  quantity?: number;
  potentialLoss?: number;
  recommendedAction?: string;
};

export interface Expense {
  id: string;
  expenseNumber: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  receiptUrl?: string;
  date: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export type NotificationType =
  | 'LOW_STOCK'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'PENDING_PRESCRIPTION'
  | 'SUPPLIER_PAYMENT_DUE'
  | 'CUSTOMER_CREDIT_DUE'
  | 'PURCHASE_ORDER_PENDING';

export interface AppNotification {
  id: string;
  organizationId: string;
  branchId?: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  read: boolean;
  linkTo?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  branchId?: string;
  branchName?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  timestamp: string;
}

export interface FinancialSummary {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  totalDiscounts: number;
  totalTax: number;
  customerReceivables: number;
  supplierPayables: number;
  inventoryValuation: number;
  salesCount: number;
  averageBasketValue: number;
}

export interface AIReorderRecommendation {
  productId: string;
  productName: string;
  genericName: string;
  currentStock: number;
  reorderLevel: number;
  avgDailySales: number;
  daysOfStockLeft: number;
  recommendedQuantity: number;
  estimatedCost: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
}

export interface AIExpiryRisk {
  batchId: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  daysToExpiry: number;
  currentStock: number;
  projectedSalesBeforeExpiry: number;
  riskQuantity: number;
  estimatedFinancialLoss: number;
  recommendation: string;
}
