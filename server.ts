import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { db } from './server/db.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth & Current Session
app.get('/api/v1/auth/me', (req, res) => {
  const currentUserId = (req.headers['x-user-id'] as string) || 'usr-1';
  const user = db.users.find((u) => u.id === currentUserId) || db.users[0];
  const org = db.organizations.find((o) => o.id === user.organizationId);
  const branch = db.branches.find((b) => b.id === user.branchId) || db.branches[0];
  res.json({ user, organization: org, branch, allUsers: db.users, allBranches: db.branches });
});

app.post('/api/v1/auth/switch-user', (req, res) => {
  const { userId, branchId } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (branchId) {
    user.branchId = branchId;
  }
  res.json({ success: true, user });
});

// Dashboard Summary & KPI
app.get('/api/v1/dashboard/summary', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  const financials = db.getFinancialSummary(branchId);
  const reorderList = db.getReorderRecommendations(branchId);
  const expiryRisks = db.getExpiryRisks(branchId);
  const today = '2026-08-14';

  const todaySales = db.sales.filter(
    (s) => s.status === 'COMPLETED' && s.createdAt.startsWith(today) && (branchId === 'ALL' || s.branchId === branchId)
  );
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const todayProfit = todaySales.reduce((acc, s) => acc + s.grossProfit, 0);

  const todayExpenses = db.expenses
    .filter((e) => e.date === today && (branchId === 'ALL' || e.branchId === branchId))
    .reduce((acc, e) => acc + e.amount, 0);

  const totalMedicines = db.products.filter((p) => p.status === 'ACTIVE').length;

  const lowStockCount = reorderList.filter((r) => r.priority === 'HIGH').length;
  const expiredBatchesCount = db.batches.filter(
    (b) => b.status === 'EXPIRED' || (b.expiryDate < today && b.quantity > 0)
  ).length;
  const expiringSoonCount = expiryRisks.filter((r) => r.daysToExpiry <= 60).length;
  const pendingRxCount = db.prescriptions.filter((r) => r.status === 'PENDING').length;

  // Recent transactions
  const recentSales = db.sales
    .filter((s) => branchId === 'ALL' || s.branchId === branchId)
    .slice(0, 5);

  // Top selling products
  const productSalesMap: { [prodId: string]: { name: string; quantity: number; revenue: number } } = {};
  for (const s of db.sales.filter((s) => s.status === 'COMPLETED')) {
    for (const it of s.items) {
      if (!productSalesMap[it.productId]) {
        productSalesMap[it.productId] = { name: it.productName, quantity: 0, revenue: 0 };
      }
      productSalesMap[it.productId].quantity += it.quantity;
      productSalesMap[it.productId].revenue += it.total;
    }
  }
  const topSelling = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  res.json({
    kpis: {
      todayRevenue,
      todayProfit,
      todayExpenses,
      monthlyRevenue: financials.revenue,
      monthlyGrossProfit: financials.grossProfit,
      monthlyNetProfit: financials.netProfit,
      totalMedicines,
      inventoryValuation: financials.inventoryValuation,
      lowStockCount,
      expiredBatchesCount,
      expiringSoonCount,
      pendingRxCount,
      customerReceivables: financials.customerReceivables,
      supplierPayables: financials.supplierPayables,
      salesCount: financials.salesCount,
      averageBasketValue: financials.averageBasketValue,
    },
    recentSales,
    topSelling,
    notifications: db.notifications.slice(0, 6),
  });
});

// Products
app.get('/api/v1/products', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  const query = (req.query.q as string)?.toLowerCase();
  const categoryId = req.query.category as string;
  const prescriptionRequired = req.query.rxOnly as string;

  let products = db.products.map((p) => {
    const activeBatches = db.batches.filter(
      (b) => b.productId === p.id && b.status === 'ACTIVE' && (branchId === 'ALL' || b.branchId === branchId)
    );
    const totalStock = activeBatches.reduce((acc, b) => acc + b.availableQuantity, 0);
    return {
      ...p,
      totalStock,
      activeBatchesCount: activeBatches.length,
    };
  });

  if (query) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.genericName.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.barcode.includes(query) ||
        (p.brandName && p.brandName.toLowerCase().includes(query)) ||
        (p.manufacturerName && p.manufacturerName.toLowerCase().includes(query))
    );
  }

  if (categoryId && categoryId !== 'ALL') {
    products = products.filter((p) => p.categoryId === categoryId);
  }

  if (prescriptionRequired === 'true') {
    products = products.filter((p) => p.prescriptionRequired);
  }

  res.json({ products, categories: db.categories, manufacturers: db.manufacturers });
});

app.post('/api/v1/products', (req, res) => {
  const newProduct = {
    ...req.body,
    id: `prod-${Date.now()}`,
    organizationId: 'org-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.products.unshift(newProduct);
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    organizationId: 'org-1',
    userId: req.body.userId || 'usr-1',
    userName: req.body.userName || 'Pharmacist',
    userRole: 'PHARMACY_OWNER',
    action: 'CREATE_PRODUCT',
    entity: 'PRODUCT',
    entityId: newProduct.id,
    details: `Added new medicine: ${newProduct.name} (${newProduct.strength}) - SKU: ${newProduct.sku}`,
    timestamp: new Date().toISOString(),
  });
  db.refreshNotifications();
  res.status(201).json(newProduct);
});

app.put('/api/v1/products/:id', (req, res) => {
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const oldProduct = { ...db.products[index] };
  db.products[index] = {
    ...db.products[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    organizationId: 'org-1',
    userId: req.body.userId || 'usr-1',
    userName: req.body.userName || 'Pharmacist',
    userRole: 'PHARMACY_OWNER',
    action: 'UPDATE_PRODUCT',
    entity: 'PRODUCT',
    entityId: req.params.id,
    details: `Updated product ${db.products[index].name}. Price: $${db.products[index].sellingPrice}`,
    oldValue: oldProduct,
    newValue: db.products[index],
    timestamp: new Date().toISOString(),
  });

  res.json(db.products[index]);
});

// Batches & FEFO Management
app.get('/api/v1/batches', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  const productId = req.query.productId as string;
  const status = req.query.status as string;

  let batches = db.batches;
  if (branchId && branchId !== 'ALL') {
    batches = batches.filter((b) => b.branchId === branchId);
  }
  if (productId) {
    batches = batches.filter((b) => b.productId === productId);
  }
  if (status && status !== 'ALL') {
    batches = batches.filter((b) => b.status === status);
  }

  // Sort FEFO (Earliest expiry first)
  batches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  res.json(batches);
});

app.post('/api/v1/batches', (req, res) => {
  const newBatch = {
    ...req.body,
    id: `btc-${Date.now()}`,
    organizationId: 'org-1',
    status: 'ACTIVE',
    availableQuantity: req.body.quantity,
    reservedQuantity: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.batches.unshift(newBatch);

  // Log inventory transaction
  db.transactions.unshift({
    id: `tx-${Date.now()}`,
    organizationId: 'org-1',
    branchId: newBatch.branchId,
    productId: newBatch.productId,
    productName: newBatch.productName || 'Medicine',
    batchId: newBatch.id,
    batchNumber: newBatch.batchNumber,
    type: 'PURCHASE',
    quantity: newBatch.quantity,
    balanceAfter: newBatch.quantity,
    reason: `Manual Batch Ingestion (${newBatch.batchNumber})`,
    userId: req.body.userId || 'usr-4',
    userName: req.body.userName || 'Inventory Manager',
    timestamp: new Date().toISOString(),
  });

  db.refreshNotifications();
  res.status(201).json(newBatch);
});

// FEFO Preview for POS / Dispensing
app.post('/api/v1/batches/fefo-preview', (req, res) => {
  const { branchId, productId, quantity } = req.body;
  const result = db.allocateBatchesForSale(branchId || 'branch-1', productId, Number(quantity) || 1);
  res.json(result);
});

// Quarantine expired batch
app.post('/api/v1/batches/:id/quarantine', (req, res) => {
  const batch = db.batches.find((b) => b.id === req.params.id);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  batch.status = 'QUARANTINED';
  batch.availableQuantity = 0;
  batch.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    id: `tx-${Date.now()}`,
    organizationId: 'org-1',
    branchId: batch.branchId,
    productId: batch.productId,
    productName: batch.productName || 'Medicine',
    batchId: batch.id,
    batchNumber: batch.batchNumber,
    type: 'EXPIRED',
    quantity: -batch.quantity,
    balanceAfter: 0,
    reason: 'Manual quarantine of compromised / expired batch',
    userId: req.body.userId || 'usr-4',
    userName: req.body.userName || 'Inventory Manager',
    timestamp: new Date().toISOString(),
  });

  db.refreshNotifications();
  res.json({ success: true, batch });
});

// POS & Sales Processing
app.get('/api/v1/sales', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  let sales = db.sales;
  if (branchId && branchId !== 'ALL') {
    sales = sales.filter((s) => s.branchId === branchId);
  }
  res.json(sales);
});

app.post('/api/v1/sales/checkout', (req, res) => {
  try {
    const sale = db.processSale(req.body);
    res.status(201).json({ success: true, sale });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Prescriptions & Dispensing
app.get('/api/v1/prescriptions', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  const status = req.query.status as string;
  let rxs = db.prescriptions;
  if (branchId && branchId !== 'ALL') {
    rxs = rxs.filter((r) => r.branchId === branchId);
  }
  if (status && status !== 'ALL') {
    rxs = rxs.filter((r) => r.status === status);
  }
  res.json(rxs);
});

app.post('/api/v1/prescriptions', (req, res) => {
  const newRx = {
    ...req.body,
    id: `rx-${Date.now()}`,
    prescriptionNumber: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    organizationId: 'org-1',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.prescriptions.unshift(newRx);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    organizationId: 'org-1',
    branchId: newRx.branchId,
    userId: req.body.pharmacistId || 'usr-2',
    userName: req.body.pharmacistName || 'Marcus Chen, RPh',
    userRole: 'PHARMACIST',
    action: 'CREATE_PRESCRIPTION',
    entity: 'PRESCRIPTION',
    entityId: newRx.id,
    details: `Created prescription ${newRx.prescriptionNumber} for patient ${newRx.customerName} (${newRx.items.length} items).`,
    timestamp: new Date().toISOString(),
  });

  db.refreshNotifications();
  res.status(201).json(newRx);
});

// Customers & Credit
app.get('/api/v1/customers', (req, res) => {
  res.json(db.customers);
});

app.post('/api/v1/customers', (req, res) => {
  const newCust = {
    ...req.body,
    id: `cust-${Date.now()}`,
    organizationId: 'org-1',
    creditBalance: 0,
    totalSpent: 0,
    totalPrescriptions: 0,
    createdAt: new Date().toISOString(),
  };
  db.customers.unshift(newCust);
  res.status(201).json(newCust);
});

app.post('/api/v1/customers/:id/payment', (req, res) => {
  const customer = db.customers.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const paymentAmount = Number(req.body.amount) || 0;
  customer.creditBalance = Math.max(0, customer.creditBalance - paymentAmount);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    organizationId: 'org-1',
    userId: req.body.userId || 'usr-3',
    userName: req.body.userName || 'Elena Rostova',
    userRole: 'CASHIER',
    action: 'CUSTOMER_CREDIT_PAYMENT',
    entity: 'CUSTOMER',
    entityId: customer.id,
    details: `Received credit settlement of $${paymentAmount.toFixed(2)} from ${customer.name}. New balance: $${customer.creditBalance.toFixed(2)}.`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, customer });
});

// Suppliers & Purchase Orders
app.get('/api/v1/suppliers', (req, res) => {
  res.json(db.suppliers);
});

app.post('/api/v1/suppliers', (req, res) => {
  const newSupplier = {
    ...req.body,
    id: `sup-${Date.now()}`,
    organizationId: 'org-1',
    currentBalance: 0,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };
  db.suppliers.unshift(newSupplier);
  res.status(201).json(newSupplier);
});

app.get('/api/v1/purchases', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  let pos = db.purchaseOrders;
  if (branchId && branchId !== 'ALL') {
    pos = pos.filter((p) => p.branchId === branchId);
  }
  res.json(pos);
});

app.post('/api/v1/purchases', (req, res) => {
  const newPO = {
    ...req.body,
    id: `po-${Date.now()}`,
    poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    organizationId: 'org-1',
    status: 'SUBMITTED',
    paymentStatus: 'UNPAID',
    paidAmount: 0,
    createdAt: new Date().toISOString(),
  };
  db.purchaseOrders.unshift(newPO);
  res.status(201).json(newPO);
});

app.post('/api/v1/purchases/:id/receive', (req, res) => {
  try {
    const po = db.receivePurchaseOrder(
      req.params.id,
      req.body.userId || 'usr-4',
      req.body.userName || 'David Kalu'
    );
    res.json({ success: true, po });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Inventory Movements, Transfers, Adjustments
app.get('/api/v1/inventory/movements', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  let txs = db.transactions;
  if (branchId && branchId !== 'ALL') {
    txs = txs.filter((t) => t.branchId === branchId);
  }
  res.json(txs);
});

app.get('/api/v1/inventory/transfers', (req, res) => {
  res.json(db.stockTransfers);
});

app.post('/api/v1/inventory/transfers', (req, res) => {
  const transfer = {
    ...req.body,
    id: `trf-${Date.now()}`,
    transferNumber: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    organizationId: 'org-1',
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  // Deduct from origin batch & add to destination branch
  const originBatch = db.batches.find((b) => b.id === transfer.batchId);
  if (originBatch) {
    originBatch.quantity -= transfer.quantity;
    originBatch.availableQuantity -= transfer.quantity;
  }

  // Create or add to dest batch
  const destBatch = db.batches.find(
    (b) => b.productId === transfer.productId && b.batchNumber === transfer.batchNumber && b.branchId === transfer.toBranchId
  );
  if (destBatch) {
    destBatch.quantity += transfer.quantity;
    destBatch.availableQuantity += transfer.quantity;
  } else if (originBatch) {
    db.batches.push({
      ...originBatch,
      id: `btc-${Date.now()}-dest`,
      branchId: transfer.toBranchId,
      quantity: transfer.quantity,
      availableQuantity: transfer.quantity,
      reservedQuantity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  db.stockTransfers.unshift(transfer);
  db.refreshNotifications();
  res.status(201).json(transfer);
});

app.post('/api/v1/inventory/adjustments', (req, res) => {
  const adj = {
    ...req.body,
    id: `adj-${Date.now()}`,
    organizationId: 'org-1',
    createdAt: new Date().toISOString(),
  };

  const batch = db.batches.find((b) => b.id === adj.batchId);
  if (batch) {
    batch.quantity += adj.quantityDelta;
    batch.availableQuantity += adj.quantityDelta;
    if (batch.quantity <= 0) batch.status = 'DEPLETED';

    db.transactions.unshift({
      id: `tx-${Date.now()}`,
      organizationId: 'org-1',
      branchId: adj.branchId,
      productId: adj.productId,
      productName: adj.productName,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      type: adj.adjustmentType === 'DAMAGED' ? 'DAMAGED' : adj.adjustmentType === 'EXPIRED' ? 'EXPIRED' : 'ADJUSTMENT',
      quantity: adj.quantityDelta,
      balanceAfter: batch.availableQuantity,
      reason: `Stock Adjustment: ${adj.reason} (${adj.adjustmentType})`,
      userId: adj.adjustedBy,
      userName: 'Inventory Officer',
      timestamp: new Date().toISOString(),
    });
  }

  db.stockAdjustments.unshift(adj);
  db.refreshNotifications();
  res.status(201).json(adj);
});

// Expenses
app.get('/api/v1/expenses', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  let exps = db.expenses;
  if (branchId && branchId !== 'ALL') {
    exps = exps.filter((e) => e.branchId === branchId);
  }
  res.json(exps);
});

app.post('/api/v1/expenses', (req, res) => {
  const newExp = {
    ...req.body,
    id: `exp-${Date.now()}`,
    expenseNumber: `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    organizationId: 'org-1',
    createdAt: new Date().toISOString(),
  };
  db.expenses.unshift(newExp);
  res.status(201).json(newExp);
});

// Reports & Financial Statement
app.get('/api/v1/reports/financials', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const summary = db.getFinancialSummary(branchId, startDate, endDate);
  res.json(summary);
});

// Audit Logs
app.get('/api/v1/audit-logs', (req, res) => {
  res.json(db.auditLogs);
});

// Notifications
app.get('/api/v1/notifications', (req, res) => {
  db.refreshNotifications();
  res.json(db.notifications);
});

app.post('/api/v1/notifications/:id/read', (req, res) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// ---------------- AI COPILOT & ANALYTICS ----------------

app.get('/api/v1/ai/reorder-recommendations', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  const recs = db.getReorderRecommendations(branchId);
  res.json(recs);
});

app.get('/api/v1/ai/expiry-risks', (req, res) => {
  const branchId = (req.query.branchId as string) || 'branch-1';
  const risks = db.getExpiryRisks(branchId);
  res.json(risks);
});

// Natural Language AI Analytics Query
app.post('/api/v1/ai/ask-analytics', async (req, res) => {
  const { query, branchId } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const ai = getGenAI();
  const financials = db.getFinancialSummary(branchId || 'branch-1');
  const products = db.products.slice(0, 15);
  const batches = db.batches.slice(0, 20);
  const reorders = db.getReorderRecommendations(branchId || 'branch-1');
  const expiry = db.getExpiryRisks(branchId || 'branch-1');

  const contextData = {
    financials,
    topProducts: products.map((p) => ({ name: p.name, price: p.sellingPrice, minStock: p.minimumStock })),
    batches: batches.map((b) => ({ product: b.productName, batch: b.batchNumber, exp: b.expiryDate, qty: b.availableQuantity, status: b.status })),
    reorderAlerts: reorders,
    expiryRisks: expiry,
  };

  if (ai) {
    try {
      const prompt = `You are PharmaCore AI, an executive clinical pharmacy analytics expert and ERP business advisor.
Current Pharmacy Live Context Data:
${JSON.stringify(contextData, null, 2)}

User Question: "${query}"

Provide a concise, highly insightful, professional executive answer formatted with clear bullet points, monetary figures, and actionable recommendations for the pharmacy owner and clinical director. Always adhere to strict pharmaceutical best practices (e.g. FEFO compliance, cold chain safety, antibiotic stewardship).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({
        answer: response.text,
        source: 'gemini-3.7-flash',
      });
    } catch (err: any) {
      console.error('Gemini error:', err);
    }
  }

  // Fallback intelligent heuristic generator if API key is not yet configured
  let fallbackAnswer = `**PharmaCore AI Intelligence Summary**\n\n`;
  const qLower = query.toLowerCase();

  if (qLower.includes('profit') || qLower.includes('revenue') || qLower.includes('cogs') || qLower.includes('financial')) {
    fallbackAnswer += `* **Total Gross Revenue**: $${financials.revenue.toFixed(2)}\n* **Cost of Goods Sold (COGS)**: $${financials.costOfGoodsSold.toFixed(2)}\n* **Gross Profit**: $${financials.grossProfit.toFixed(2)} (${((financials.grossProfit / (financials.revenue || 1)) * 100).toFixed(1)}% margin)\n* **Operating Expenses**: $${financials.operatingExpenses.toFixed(2)}\n* **Net Operating Profit**: $${financials.netProfit.toFixed(2)}\n* **Total Inventory Asset Valuation**: $${financials.inventoryValuation.toFixed(2)}\n\n**Strategic Recommendation**: Margins are healthiest on OTC and chronic maintenance medications. Reinvest surplus cash flow into fast-turning cardiovascular lines.`;
  } else if (qLower.includes('expire') || qLower.includes('expiry') || qLower.includes('batch')) {
    fallbackAnswer += `* **Active Expiry Monitoring**: The FEFO algorithm is currently prioritizing earlier batches.\n* **Critical Batches (<60 Days)**: Batch AMX-24E01 (Amoxicillin) expiring 2026-09-08 and Batch ATV-24H08 (Atorvastatin) expiring 2026-10-10.\n* **Quarantine Status**: Omeprazole batch OMP-23Z99 has been automatically blocked and quarantined from POS.\n\n**Action**: Apply a 15% promotional discount or transfer surplus units to high-volume branches before 30-day threshold.`;
  } else if (qLower.includes('reorder') || qLower.includes('stock') || qLower.includes('low')) {
    fallbackAnswer += `* **Critical Restock Needed**: Ibuprofen Rapid Release 400mg is below minimum threshold (12 units in stock vs 50 minimum).\n* **Recommended Purchase Volume**: 200 packs from MedSource National Wholesalers.\n* **Estimated PO Investment**: $1,097.25 with expected ROI in 14 days.`;
  } else {
    fallbackAnswer += `* **Operational Snapshot**: Total ${products.length} active formulary lines under management.\n* **Inventory Value**: $${financials.inventoryValuation.toFixed(2)} across ${db.branches.length} branches.\n* **Prescription Flow**: ${db.prescriptions.length} prescriptions processed with 100% FEFO dispensing audit compliance.\n\nAsk specifically about profit margins, expiry forecasts, or supplier reorders for granular metrics!`;
  }

  res.json({
    answer: fallbackAnswer,
    source: 'rule-based-engine',
  });
});

// Vite Middleware for SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PharmaCore Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
