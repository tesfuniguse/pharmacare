import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { PosView } from './components/PosView.tsx';
import { MedicinesView } from './components/MedicinesView.tsx';
import { BatchesView } from './components/BatchesView.tsx';
import { InventoryView } from './components/InventoryView.tsx';
import { PurchasingView } from './components/PurchasingView.tsx';
import { PrescriptionsView } from './components/PrescriptionsView.tsx';
import { CustomersView } from './components/CustomersView.tsx';
import { ExpensesView } from './components/ExpensesView.tsx';
import { FinancialReportsView } from './components/FinancialReportsView.tsx';
import { AuditLogsView } from './components/AuditLogsView.tsx';
import { NotificationsCenter } from './components/NotificationsCenter.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { AiCopilotModal } from './components/AiCopilotModal.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import {
  User,
  Organization,
  Branch,
  Product,
  Category,
  Manufacturer,
  Batch,
  Sale,
  Prescription,
  Customer,
  Supplier,
  PurchaseOrder,
  InventoryTransaction,
  StockTransfer,
  Expense,
  FinancialSummary,
  AppNotification,
  AuditLog,
} from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Core Data States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [dashboardData, setDashboardData] = useState<{
    kpis: any;
    recentSales: Sale[];
    topSelling: { name: string; quantity: number; revenue: number }[];
    notifications: AppNotification[];
  }>({
    kpis: {
      todayRevenue: 2650,
      todayProfit: 1260,
      todayExpenses: 195,
      monthlyRevenue: 13876.5,
      monthlyGrossProfit: 7123.5,
      monthlyNetProfit: 6928.5,
      totalMedicines: 10,
      inventoryValuation: 16905,
      lowStockCount: 2,
      expiredBatchesCount: 1,
      expiringSoonCount: 2,
      pendingRxCount: 1,
      customerReceivables: 110,
      supplierPayables: 685,
      salesCount: 4,
      averageBasketValue: 47.92,
    },
    recentSales: [],
    topSelling: [],
    notifications: [],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financials, setFinancials] = useState<FinancialSummary>({
    revenue: 13876.5,
    costOfGoodsSold: 6753.0,
    grossProfit: 7123.5,
    operatingExpenses: 195.0,
    netProfit: 6928.5,
    inventoryValuation: 16905.0,
    customerReceivables: 110.0,
    supplierPayables: 685.0,
    salesCount: 4,
    averageBasketValue: 47.92,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Initial Data Fetching
  const fetchAllData = async (branchId?: string, userId?: string) => {
    setIsRefreshing(true);
    try {
      const activeBranch = branchId || currentBranch?.id || 'branch-1';
      const activeUserId = userId || currentUser?.id || 'usr-1';

      const [
        authRes,
        dashRes,
        productsRes,
        batchesRes,
        salesRes,
        prescriptionsRes,
        customersRes,
        suppliersRes,
        purchasesRes,
        movementsRes,
        transfersRes,
        expensesRes,
        financialsRes,
        auditRes,
        notifRes,
      ] = await Promise.all([
        fetch('/api/v1/auth/me', { headers: { 'x-user-id': activeUserId } }),
        fetch(`/api/v1/dashboard/summary?branchId=${activeBranch}`),
        fetch(`/api/v1/products?branchId=${activeBranch}`),
        fetch(`/api/v1/batches?branchId=${activeBranch}`),
        fetch(`/api/v1/sales?branchId=${activeBranch}`),
        fetch(`/api/v1/prescriptions?branchId=${activeBranch}`),
        fetch('/api/v1/customers'),
        fetch('/api/v1/suppliers'),
        fetch(`/api/v1/purchases?branchId=${activeBranch}`),
        fetch(`/api/v1/inventory/movements?branchId=${activeBranch}`),
        fetch('/api/v1/inventory/transfers'),
        fetch(`/api/v1/expenses?branchId=${activeBranch}`),
        fetch(`/api/v1/reports/financials?branchId=${activeBranch}`),
        fetch('/api/v1/audit-logs'),
        fetch('/api/v1/notifications'),
      ]);

      const authData = await authRes.json();
      setCurrentUser(authData.user);
      setOrganization(authData.organization);
      if (!currentBranch || branchId) {
        setCurrentBranch(authData.branch);
      }
      setAllBranches(authData.allBranches || []);
      setAllUsers(authData.allUsers || []);

      const dashData = await dashRes.json();
      setDashboardData(dashData);

      const prodData = await productsRes.json();
      setProducts(prodData.products || []);
      setCategories(prodData.categories || []);
      setManufacturers(prodData.manufacturers || []);

      setBatches(await batchesRes.json());
      setSales(await salesRes.json());
      setPrescriptions(await prescriptionsRes.json());
      setCustomers(await customersRes.json());
      setSuppliers(await suppliersRes.json());
      setPurchaseOrders(await purchasesRes.json());
      setTransactions(await movementsRes.json());
      setTransfers(await transfersRes.json());
      setExpenses(await expensesRes.json());
      setFinancials(await financialsRes.json());
      setAuditLogs(await auditRes.json());
      setNotifications(await notifRes.json());
    } catch (error) {
      console.error('Error syncing store data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers for switching User & Branch
  const handleSwitchUser = async (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      await fetchAllData(currentBranch?.id, userId);
    }
  };

  const handleSwitchBranch = async (branchId: string) => {
    const branch = allBranches.find((b) => b.id === branchId) || {
      id: 'ALL',
      name: 'All Branches (Consolidated)',
      organizationId: 'org-1',
      code: 'ALL',
      address: 'Network-wide',
      status: 'ACTIVE' as const,
      createdAt: '',
    };
    setCurrentBranch(branch);
    await fetchAllData(branchId, currentUser?.id);
  };

  // Actions
  const handleCompleteSale = async (salePayload: any): Promise<Sale | null> => {
    try {
      const res = await fetch('/api/v1/sales/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salePayload),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData(currentBranch?.id, currentUser?.id);
        return data.sale;
      } else {
        throw new Error(data.error || 'Sale processing failed');
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
      return null;
    }
  };

  const handleAddProduct = async (productData: Partial<Product>) => {
    try {
      const cat = categories.find((c) => c.id === productData.categoryId);
      const mfr = manufacturers.find((m) => m.id === productData.manufacturerId);
      await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productData,
          categoryName: cat?.name,
          manufacturerName: mfr?.name,
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await fetch(`/api/v1/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productData,
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBatch = async (batchData: Partial<Batch>) => {
    try {
      await fetch('/api/v1/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batchData,
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuarantineBatch = async (batchId: string) => {
    try {
      await fetch(`/api/v1/batches/${batchId}/quarantine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInitiateTransfer = async (transferData: Partial<StockTransfer>) => {
    try {
      await fetch('/api/v1/inventory/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStockAdjustment = async (adjData: any) => {
    try {
      await fetch('/api/v1/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjData),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSupplier = async (supplierData: Partial<Supplier>) => {
    try {
      await fetch('/api/v1/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePO = async (poData: Partial<PurchaseOrder>) => {
    try {
      await fetch('/api/v1/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReceivePO = async (poId: string) => {
    try {
      await fetch(`/api/v1/purchases/${poId}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePrescription = async (rxData: Partial<Prescription>) => {
    try {
      await fetch('/api/v1/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rxData),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomer = async (custData: Partial<Customer>) => {
    try {
      await fetch('/api/v1/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReceiveCreditPayment = async (customerId: string, amount: number) => {
    try {
      await fetch(`/api/v1/customers/${customerId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddExpense = async (expData: Partial<Expense>) => {
    try {
      await fetch('/api/v1/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expData),
      });
      await fetchAllData(currentBranch?.id, currentUser?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser || !organization || !currentBranch) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F1F5F9] text-blue-600">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <div className="text-sm font-semibold tracking-wide text-slate-800">Initializing PharmaCore ERP...</div>
        </div>
      </div>
    );
  }

  const badgeCounts = {
    lowStock: dashboardData.kpis.lowStockCount || 0,
    expiringSoon: dashboardData.kpis.expiringSoonCount || 0,
    pendingRx: dashboardData.kpis.pendingRxCount || 0,
    notifications: notifications.filter((n) => !n.read).length,
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F1F5F9] text-slate-800 antialiased">
      {/* Top Navbar with Branch Switcher, RBAC, AI trigger, Search */}
      <Navbar
        currentUser={currentUser}
        organization={organization}
        currentBranch={currentBranch}
        allBranches={allBranches}
        allUsers={allUsers}
        notifications={notifications}
        onSwitchUser={handleSwitchUser}
        onSwitchBranch={handleSwitchBranch}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        onOpenNotifications={() => setActiveTab('NOTIFICATIONS')}
        onQuickSearch={(q) => {
          setGlobalSearchQuery(q);
          if (q && activeTab !== 'MEDICINES' && activeTab !== 'POS') {
            setActiveTab('MEDICINES');
          }
        }}
        onRefreshData={() => fetchAllData(currentBranch.id, currentUser.id)}
        isRefreshing={isRefreshing}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser.role}
          badgeCounts={badgeCounts}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F1F5F9]">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'DASHBOARD' && (
              <DashboardView
                kpis={dashboardData.kpis}
                recentSales={dashboardData.recentSales}
                topSelling={dashboardData.topSelling}
                notifications={dashboardData.notifications}
                currentBranch={currentBranch}
                userRole={currentUser.role}
                onNavigateTab={setActiveTab}
                onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
              />
            )}

            {activeTab === 'POS' && (
              <PosView
                products={products}
                customers={customers}
                prescriptions={prescriptions}
                currentBranch={currentBranch}
                currentUser={currentUser}
                onCompleteSale={handleCompleteSale}
                onShowReceipt={setActiveReceiptSale}
              />
            )}

            {activeTab === 'MEDICINES' && (
              <MedicinesView
                products={products}
                categories={categories}
                manufacturers={manufacturers}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
              />
            )}

            {activeTab === 'BATCHES' && (
              <BatchesView
                batches={batches}
                products={products}
                currentBranch={currentBranch}
                allBranches={allBranches}
                onAddBatch={handleAddBatch}
                onQuarantineBatch={handleQuarantineBatch}
              />
            )}

            {activeTab === 'INVENTORY' && (
              <InventoryView
                transactions={transactions}
                transfers={transfers}
                products={products}
                batches={batches}
                branches={allBranches}
                currentBranch={currentBranch}
                currentUser={currentUser}
                onInitiateTransfer={handleInitiateTransfer}
                onStockAdjustment={handleStockAdjustment}
              />
            )}

            {activeTab === 'PURCHASING' && (
              <PurchasingView
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
                products={products}
                currentBranch={currentBranch}
                currentUser={currentUser}
                onAddSupplier={handleAddSupplier}
                onCreatePO={handleCreatePO}
                onReceivePO={handleReceivePO}
              />
            )}

            {activeTab === 'PRESCRIPTIONS' && (
              <PrescriptionsView
                prescriptions={prescriptions}
                customers={customers}
                products={products}
                currentBranch={currentBranch}
                currentUser={currentUser}
                onCreatePrescription={handleCreatePrescription}
                onDispenseInPos={(rx) => {
                  setActiveTab('POS');
                }}
              />
            )}

            {activeTab === 'CUSTOMERS' && (
              <CustomersView
                customers={customers}
                onAddCustomer={handleAddCustomer}
                onReceiveCreditPayment={handleReceiveCreditPayment}
              />
            )}

            {activeTab === 'EXPENSES' && (
              <ExpensesView
                expenses={expenses}
                currentBranch={currentBranch}
                currentUser={currentUser}
                onAddExpense={handleAddExpense}
              />
            )}

            {activeTab === 'REPORTS' && (
              <FinancialReportsView
                financials={financials}
                currentBranch={currentBranch}
              />
            )}

            {activeTab === 'AUDIT_LOGS' && <AuditLogsView auditLogs={auditLogs} />}

            {activeTab === 'NOTIFICATIONS' && (
              <NotificationsCenter
                notifications={notifications}
                onDismiss={handleDismissNotification}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'SETTINGS' && (
              <SettingsView
                organization={organization}
                branches={allBranches}
                allUsers={allUsers}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global AI Analytics Copilot Modal */}
      <AiCopilotModal
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        currentBranch={currentBranch}
      />

      {/* Printable Receipt & A4 Invoice Dialog */}
      <ReceiptModal
        sale={activeReceiptSale}
        organization={organization}
        onClose={() => setActiveReceiptSale(null)}
      />
    </div>
  );
}
