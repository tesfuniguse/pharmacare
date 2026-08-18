import {
  Organization,
  Branch,
  User,
  Category,
  Manufacturer,
  Product,
  ProductBatch,
  InventoryTransaction,
  StockTransfer,
  StockAdjustment,
  Supplier,
  PurchaseOrder,
  Customer,
  Prescription,
  Sale,
  CustomerReturn,
  Expense,
  AppNotification,
  AuditLog,
  FinancialSummary,
  AIReorderRecommendation,
  AIExpiryRisk,
} from '../src/types.ts';

export class PharmacyDatabase {
  public organizations: Organization[] = [];
  public branches: Branch[] = [];
  public users: User[] = [];
  public categories: Category[] = [];
  public manufacturers: Manufacturer[] = [];
  public products: Product[] = [];
  public batches: ProductBatch[] = [];
  public transactions: InventoryTransaction[] = [];
  public stockTransfers: StockTransfer[] = [];
  public stockAdjustments: StockAdjustment[] = [];
  public suppliers: Supplier[] = [];
  public purchaseOrders: PurchaseOrder[] = [];
  public customers: Customer[] = [];
  public prescriptions: Prescription[] = [];
  public sales: Sale[] = [];
  public customerReturns: CustomerReturn[] = [];
  public expenses: Expense[] = [];
  public notifications: AppNotification[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const orgId = 'org-1';
    const branch1Id = 'branch-1';
    const branch2Id = 'branch-2';
    const branch3Id = 'branch-3';

    // 1. Organization
    this.organizations.push({
      id: orgId,
      name: 'PharmaCore Health Network',
      code: 'PC-GRP',
      taxId: 'TX-94827104',
      phone: '+1 (800) 555-0199',
      email: 'admin@pharmacore.health',
      address: '742 Evergreen Healthcare Blvd, Suite 400, Metro City',
      currency: 'USD',
      createdAt: '2025-01-10T08:00:00.000Z',
    });

    // 2. Branches
    this.branches.push(
      {
        id: branch1Id,
        organizationId: orgId,
        name: 'Downtown Central Pharmacy & Clinic',
        code: 'BR-DOWNTOWN',
        phone: '+1 (800) 555-0101',
        email: 'downtown@pharmacore.health',
        address: '100 Main St, Downtown District',
        isMainBranch: true,
        isActive: true,
        createdAt: '2025-01-10T08:00:00.000Z',
      },
      {
        id: branch2Id,
        organizationId: orgId,
        name: 'Northside Medical Center Pharmacy',
        code: 'BR-NORTHSIDE',
        phone: '+1 (800) 555-0102',
        email: 'northside@pharmacore.health',
        address: '550 North Highland Ave, Suite 12',
        isMainBranch: false,
        isActive: true,
        createdAt: '2025-02-01T08:00:00.000Z',
      },
      {
        id: branch3Id,
        organizationId: orgId,
        name: 'Westend Community Care Dispensary',
        code: 'BR-WESTEND',
        phone: '+1 (800) 555-0103',
        email: 'westend@pharmacore.health',
        address: '89 West Boulevard, Westgate Plaza',
        isMainBranch: false,
        isActive: true,
        createdAt: '2025-03-15T08:00:00.000Z',
      }
    );

    // 3. Users with RBAC
    this.users.push(
      {
        id: 'usr-1',
        organizationId: orgId,
        branchId: branch1Id,
        name: 'Dr. Sarah Jenkins, PharmD',
        email: 'sarah.jenkins@pharmacore.health',
        role: 'PHARMACY_OWNER',
        phone: '+1 (555) 234-5678',
        active: true,
        createdAt: '2025-01-10T08:00:00.000Z',
      },
      {
        id: 'usr-2',
        organizationId: orgId,
        branchId: branch1Id,
        name: 'Marcus Chen, RPh',
        email: 'marcus.chen@pharmacore.health',
        role: 'PHARMACIST',
        phone: '+1 (555) 345-6789',
        active: true,
        createdAt: '2025-01-12T08:00:00.000Z',
      },
      {
        id: 'usr-3',
        organizationId: orgId,
        branchId: branch1Id,
        name: 'Elena Rostova',
        email: 'elena.rostova@pharmacore.health',
        role: 'CASHIER',
        phone: '+1 (555) 456-7890',
        active: true,
        createdAt: '2025-01-15T08:00:00.000Z',
      },
      {
        id: 'usr-4',
        organizationId: orgId,
        branchId: branch1Id,
        name: 'David Kalu',
        email: 'david.kalu@pharmacore.health',
        role: 'INVENTORY_MANAGER',
        phone: '+1 (555) 567-8901',
        active: true,
        createdAt: '2025-01-15T08:00:00.000Z',
      },
      {
        id: 'usr-5',
        organizationId: orgId,
        branchId: branch1Id,
        name: 'Rachel Adams, CPA',
        email: 'rachel.adams@pharmacore.health',
        role: 'ACCOUNTANT',
        phone: '+1 (555) 678-9012',
        active: true,
        createdAt: '2025-01-15T08:00:00.000Z',
      },
      {
        id: 'usr-6',
        organizationId: orgId,
        branchId: branch2Id,
        name: 'Dr. James Vance',
        email: 'james.vance@pharmacore.health',
        role: 'BRANCH_MANAGER',
        phone: '+1 (555) 789-0123',
        active: true,
        createdAt: '2025-02-01T08:00:00.000Z',
      }
    );

    // 4. Categories
    this.categories.push(
      { id: 'cat-1', organizationId: orgId, name: 'Antibiotics & Antimicrobials', description: 'Bacterial and fungal infection medications' },
      { id: 'cat-2', organizationId: orgId, name: 'Cardiovascular & Hypertension', description: 'Heart, blood pressure and lipid regulators' },
      { id: 'cat-3', organizationId: orgId, name: 'Analgesics & Anti-Inflammatory', description: 'Pain relief, NSAIDs and antipyretics' },
      { id: 'cat-4', organizationId: orgId, name: 'Endocrine & Diabetes Care', description: 'Blood sugar regulation and hormone therapy' },
      { id: 'cat-5', organizationId: orgId, name: 'Respiratory & Anti-Asthma', description: 'Bronchodilators, inhalers, and antihistamines' },
      { id: 'cat-6', organizationId: orgId, name: 'Gastrointestinal', description: 'Antacids, PPIs, antiemetics and laxatives' },
      { id: 'cat-7', organizationId: orgId, name: 'Dermatological & Topical', description: 'Creams, ointments and skin treatments' },
      { id: 'cat-8', organizationId: orgId, name: 'Vitamins & Dietary Supplements', description: 'Nutritional health and wellness' },
      { id: 'cat-9', organizationId: orgId, name: 'Medical Equipment & Diagnostic', description: 'Glucometers, BP monitors, syringes and test strips' }
    );

    // 5. Manufacturers
    this.manufacturers.push(
      { id: 'mfr-1', organizationId: orgId, name: 'Pfizer BioPharma', country: 'United States' },
      { id: 'mfr-2', organizationId: orgId, name: 'Novartis Healthcare', country: 'Switzerland' },
      { id: 'mfr-3', organizationId: orgId, name: 'GlaxoSmithKline (GSK)', country: 'United Kingdom' },
      { id: 'mfr-4', organizationId: orgId, name: 'Sanofi Aventis', country: 'France' },
      { id: 'mfr-5', organizationId: orgId, name: 'AstraZeneca Pharmaceuticals', country: 'United Kingdom' },
      { id: 'mfr-6', organizationId: orgId, name: 'Cipla Therapeutics', country: 'India' },
      { id: 'mfr-7', organizationId: orgId, name: 'Johnson & Johnson Med', country: 'United States' }
    );

    // 6. Suppliers
    this.suppliers.push(
      {
        id: 'sup-1',
        organizationId: orgId,
        name: 'Apex Pharmaceutical Distributors',
        contactPerson: 'Gregory Stone',
        phone: '+1 (800) 992-3841',
        email: 'orders@apexpharma.com',
        address: '400 Logistics Way, Distribution Hub 4, Chicago, IL',
        taxNumber: 'US-88392019',
        paymentTerms: 'Net 30',
        creditLimit: 50000,
        currentBalance: 8450.00,
        status: 'ACTIVE',
        createdAt: '2025-01-10T08:00:00.000Z',
      },
      {
        id: 'sup-2',
        organizationId: orgId,
        name: 'MedSource National Wholesalers',
        contactPerson: 'Valerie Hopkins',
        phone: '+1 (800) 441-2980',
        email: 'sales@medsourcewholesale.com',
        address: '1200 Supply Chain Blvd, Dallas, TX',
        taxNumber: 'US-99120485',
        paymentTerms: 'Net 15',
        creditLimit: 35000,
        currentBalance: 3200.00,
        status: 'ACTIVE',
        createdAt: '2025-01-15T08:00:00.000Z',
      },
      {
        id: 'sup-3',
        organizationId: orgId,
        name: 'Global Generic Supply Corp',
        contactPerson: 'Rajiv Patel',
        phone: '+1 (888) 773-1029',
        email: 'support@globalgeneric.com',
        address: '77 Portside Terminal Road, Newark, NJ',
        taxNumber: 'US-77401928',
        paymentTerms: 'Immediate / Net 7',
        creditLimit: 25000,
        currentBalance: 0.00,
        status: 'ACTIVE',
        createdAt: '2025-01-20T08:00:00.000Z',
      }
    );

    // 7. Products (Medicines)
    const productData: Partial<Product>[] = [
      {
        id: 'prod-1',
        sku: 'MED-AMOX-500',
        barcode: '8901034001121',
        name: 'Amoxicillin Clavulanate 625mg',
        genericName: 'Amoxicillin + Clavulanic Acid',
        brandName: 'Augmentin Duo',
        categoryId: 'cat-1',
        dosageForm: 'Tablet',
        strength: '625mg',
        unit: 'Strip of 10 Tablets',
        manufacturerId: 'mfr-3',
        description: 'Broad-spectrum penicillin antibiotic indicated for respiratory, ENT, and urinary tract infections.',
        prescriptionRequired: true,
        taxRate: 5.0,
        minimumStock: 25,
        reorderLevel: 50,
        sellingPrice: 18.50,
        status: 'ACTIVE',
      },
      {
        id: 'prod-2',
        sku: 'MED-ATOR-20',
        barcode: '8901034002232',
        name: 'Atorvastatin Calcium 20mg',
        genericName: 'Atorvastatin',
        brandName: 'Lipitor',
        categoryId: 'cat-2',
        dosageForm: 'Tablet',
        strength: '20mg',
        unit: 'Box of 30 Tablets',
        manufacturerId: 'mfr-1',
        description: 'HMG-CoA reductase inhibitor for lipid lowering and cardiovascular risk reduction.',
        prescriptionRequired: true,
        taxRate: 5.0,
        minimumStock: 30,
        reorderLevel: 60,
        sellingPrice: 28.00,
        status: 'ACTIVE',
      },
      {
        id: 'prod-3',
        sku: 'MED-METF-500',
        barcode: '8901034003343',
        name: 'Metformin Hydrochloride 500mg SR',
        genericName: 'Metformin HCl',
        brandName: 'Glucophage XR',
        categoryId: 'cat-4',
        dosageForm: 'Tablet',
        strength: '500mg',
        unit: 'Strip of 15 Tablets',
        manufacturerId: 'mfr-4',
        description: 'First-line biguanide oral antihyperglycemic agent for Type 2 Diabetes.',
        prescriptionRequired: true,
        taxRate: 5.0,
        minimumStock: 40,
        reorderLevel: 80,
        sellingPrice: 12.50,
        status: 'ACTIVE',
      },
      {
        id: 'prod-4',
        sku: 'MED-SALB-INH',
        barcode: '8901034004454',
        name: 'Salbutamol HFA Inhaler 100mcg',
        genericName: 'Albuterol / Salbutamol',
        brandName: 'Ventolin Evohaler',
        categoryId: 'cat-5',
        dosageForm: 'Inhaler',
        strength: '100mcg / dose',
        unit: '200 Metered Doses',
        manufacturerId: 'mfr-3',
        description: 'Short-acting beta2-adrenergic agonist for rapid relief of bronchospasm in asthma & COPD.',
        prescriptionRequired: true,
        taxRate: 5.0,
        minimumStock: 15,
        reorderLevel: 35,
        sellingPrice: 22.00,
        status: 'ACTIVE',
      },
      {
        id: 'prod-5',
        sku: 'MED-IBUP-400',
        barcode: '8901034005565',
        name: 'Ibuprofen Rapid Release 400mg',
        genericName: 'Ibuprofen',
        brandName: 'Advil Ultra',
        categoryId: 'cat-3',
        dosageForm: 'Capsule',
        strength: '400mg',
        unit: 'Pack of 20 Softgels',
        manufacturerId: 'mfr-7',
        description: 'Nonsteroidal anti-inflammatory drug (NSAID) for fever, acute pain, and headache.',
        prescriptionRequired: false,
        taxRate: 5.0,
        minimumStock: 50,
        reorderLevel: 100,
        sellingPrice: 9.75,
        status: 'ACTIVE',
      },
      {
        id: 'prod-6',
        sku: 'MED-PARA-500',
        barcode: '8901034006676',
        name: 'Paracetamol Extra Strength 500mg',
        genericName: 'Acetaminophen / Paracetamol',
        brandName: 'Panadol Advance',
        categoryId: 'cat-3',
        dosageForm: 'Tablet',
        strength: '500mg',
        unit: 'Blister of 24 Tablets',
        manufacturerId: 'mfr-3',
        description: 'Analgesic and antipyretic for mild-to-moderate pain and fever reduction.',
        prescriptionRequired: false,
        taxRate: 5.0,
        minimumStock: 60,
        reorderLevel: 120,
        sellingPrice: 6.50,
        status: 'ACTIVE',
      },
      {
        id: 'prod-7',
        sku: 'MED-OMEP-20',
        barcode: '8901034007787',
        name: 'Omeprazole Delayed-Release 20mg',
        genericName: 'Omeprazole',
        brandName: 'Prilosec',
        categoryId: 'cat-6',
        dosageForm: 'Capsule',
        strength: '20mg',
        unit: 'Bottle of 28 Capsules',
        manufacturerId: 'mfr-5',
        description: 'Proton pump inhibitor that reduces stomach acid production for GERD and ulcers.',
        prescriptionRequired: false,
        taxRate: 5.0,
        minimumStock: 20,
        reorderLevel: 45,
        sellingPrice: 19.90,
        status: 'ACTIVE',
      },
      {
        id: 'prod-8',
        sku: 'MED-AZIT-500',
        barcode: '8901034008898',
        name: 'Azithromycin 500mg 3-Day Pack',
        genericName: 'Azithromycin',
        brandName: 'Zithromax Z-Pak',
        categoryId: 'cat-1',
        dosageForm: 'Tablet',
        strength: '500mg',
        unit: 'Blister of 3 Tablets',
        manufacturerId: 'mfr-1',
        description: 'Macrolide antibiotic with extended tissue half-life for bacterial infections.',
        prescriptionRequired: true,
        taxRate: 5.0,
        minimumStock: 20,
        reorderLevel: 40,
        sellingPrice: 16.00,
        status: 'ACTIVE',
      },
      {
        id: 'prod-9',
        sku: 'MED-AMLO-5',
        barcode: '8901034009909',
        name: 'Amlodipine Besylate 5mg',
        genericName: 'Amlodipine',
        brandName: 'Norvasc',
        categoryId: 'cat-2',
        dosageForm: 'Tablet',
        strength: '5mg',
        unit: 'Strip of 30 Tablets',
        manufacturerId: 'mfr-1',
        description: 'Calcium channel blocker for essential hypertension and chronic stable angina.',
        prescriptionRequired: true,
        taxRate: 5.0,
        minimumStock: 30,
        reorderLevel: 60,
        sellingPrice: 14.20,
        status: 'ACTIVE',
      },
      {
        id: 'prod-10',
        sku: 'MED-VITD-50K',
        barcode: '8901034010010',
        name: 'Cholecalciferol Vitamin D3 50,000 IU',
        genericName: 'Cholecalciferol',
        brandName: 'D-Vital High Potency',
        categoryId: 'cat-8',
        dosageForm: 'Capsule',
        strength: '50,000 IU',
        unit: 'Box of 12 Softgels',
        manufacturerId: 'mfr-6',
        description: 'High potency weekly vitamin D supplement for severe deficiency and bone health.',
        prescriptionRequired: false,
        taxRate: 5.0,
        minimumStock: 15,
        reorderLevel: 30,
        sellingPrice: 24.50,
        status: 'ACTIVE',
      },
      {
        id: 'prod-11',
        sku: 'MED-INS-GLAR',
        barcode: '8901034011121',
        name: 'Insulin Glargine Solostar Pen 100 U/ml',
        genericName: 'Insulin Glargine (rDNA origin)',
        brandName: 'Lantus SoloStar',
        categoryId: 'cat-4',
        dosageForm: 'Injection',
        strength: '100 U/ml (3ml)',
        unit: 'Pack of 5 Pre-filled Pens',
        manufacturerId: 'mfr-4',
        description: 'Long-acting basal insulin analog administered once daily for glycemic control.',
        prescriptionRequired: true,
        taxRate: 0.0,
        minimumStock: 8,
        reorderLevel: 20,
        sellingPrice: 85.00,
        status: 'ACTIVE',
      },
      {
        id: 'EQP-GLUC-KIT',
        sku: 'EQP-ACCU-KIT',
        barcode: '8901034012232',
        name: 'Accu-Chek Guide Blood Glucose Monitoring Kit',
        genericName: 'Blood Glucose Meter System',
        brandName: 'Accu-Chek Guide',
        categoryId: 'cat-9',
        dosageForm: 'Medical Equipment',
        strength: 'Complete Kit',
        unit: '1 Meter + 10 Strips + Lancing Device',
        manufacturerId: 'mfr-2',
        description: 'Wireless blood glucose meter with spill-resistant test strip vial.',
        prescriptionRequired: false,
        taxRate: 8.0,
        minimumStock: 5,
        reorderLevel: 12,
        sellingPrice: 45.00,
        status: 'ACTIVE',
      },
      {
        id: 'prod-13',
        sku: 'MED-HYDRO-CRM',
        barcode: '8901034013343',
        name: 'Hydrocortisone 1% Anti-Itch Cream',
        genericName: 'Hydrocortisone',
        brandName: 'Cortizone-10 Max',
        categoryId: 'cat-7',
        dosageForm: 'Cream',
        strength: '1% w/w',
        unit: '30g Tube',
        manufacturerId: 'mfr-7',
        description: 'Topical corticosteroid for relief of eczema, insect bites, and allergic dermatitis.',
        prescriptionRequired: false,
        taxRate: 5.0,
        minimumStock: 20,
        reorderLevel: 40,
        sellingPrice: 8.90,
        status: 'ACTIVE',
      },
      {
        id: 'prod-14',
        sku: 'MED-CEFT-1G',
        barcode: '8901034014454',
        name: 'Ceftriaxone Sodium 1g Vial + Diluent',
        genericName: 'Ceftriaxone Sodium',
        brandName: 'Rocephin',
        categoryId: 'cat-1',
        dosageForm: 'Injection',
        strength: '1g Powder for Injection',
        unit: '1 Vial + 10ml Sterile Water',
        manufacturerId: 'mfr-2',
        description: 'Third-generation cephalosporin antibiotic for severe bacterial infections.',
        prescriptionRequired: true,
        taxRate: 5.0,
        minimumStock: 10,
        reorderLevel: 25,
        sellingPrice: 32.00,
        status: 'ACTIVE',
      }
    ];

    productData.forEach((p) => {
      const cat = this.categories.find((c) => c.id === p.categoryId);
      const mfr = this.manufacturers.find((m) => m.id === p.manufacturerId);
      this.products.push({
        ...p,
        organizationId: orgId,
        categoryName: cat?.name,
        manufacturerName: mfr?.name,
        createdAt: '2025-01-15T08:00:00.000Z',
        updatedAt: '2025-01-15T08:00:00.000Z',
      } as Product);
    });

    // 8. Batches (Critical for FEFO - some near expiry, some expired, some fresh)
    const batchList: Partial<ProductBatch>[] = [
      // Amoxicillin - Batch A (Expires in 25 days - FEFO Priority 1), Batch B (Expires in 18 months)
      {
        id: 'btc-101',
        productId: 'prod-1',
        branchId: branch1Id,
        batchNumber: 'AMX-24E01',
        manufacturingDate: '2024-03-01',
        expiryDate: '2026-09-08', // approx 25 days away
        purchasePrice: 11.20,
        sellingPrice: 18.50,
        quantity: 14,
        reservedQuantity: 0,
        availableQuantity: 14,
        supplierId: 'sup-1',
        status: 'ACTIVE',
      },
      {
        id: 'btc-102',
        productId: 'prod-1',
        branchId: branch1Id,
        batchNumber: 'AMX-25K09',
        manufacturingDate: '2025-06-10',
        expiryDate: '2027-12-31', // Far expiry
        purchasePrice: 11.50,
        sellingPrice: 18.50,
        quantity: 85,
        reservedQuantity: 0,
        availableQuantity: 85,
        supplierId: 'sup-1',
        status: 'ACTIVE',
      },
      {
        id: 'btc-103',
        productId: 'prod-1',
        branchId: branch2Id,
        batchNumber: 'AMX-25N12',
        manufacturingDate: '2025-07-01',
        expiryDate: '2028-01-15',
        purchasePrice: 11.50,
        sellingPrice: 18.50,
        quantity: 40,
        reservedQuantity: 0,
        availableQuantity: 40,
        supplierId: 'sup-2',
        status: 'ACTIVE',
      },

      // Atorvastatin - Batch 1 (Expires in 55 days - FEFO priority), Batch 2 (Fresh)
      {
        id: 'btc-201',
        productId: 'prod-2',
        branchId: branch1Id,
        batchNumber: 'ATV-24H08',
        manufacturingDate: '2024-05-15',
        expiryDate: '2026-10-10', // ~57 days away
        purchasePrice: 16.00,
        sellingPrice: 28.00,
        quantity: 22,
        reservedQuantity: 0,
        availableQuantity: 22,
        supplierId: 'sup-2',
        status: 'ACTIVE',
      },
      {
        id: 'btc-202',
        productId: 'prod-2',
        branchId: branch1Id,
        batchNumber: 'ATV-25B02',
        manufacturingDate: '2025-02-10',
        expiryDate: '2027-08-20',
        purchasePrice: 16.50,
        sellingPrice: 28.00,
        quantity: 90,
        reservedQuantity: 0,
        availableQuantity: 90,
        supplierId: 'sup-2',
        status: 'ACTIVE',
      },

      // Metformin
      {
        id: 'btc-301',
        productId: 'prod-3',
        branchId: branch1Id,
        batchNumber: 'MET-25A19',
        manufacturingDate: '2025-01-10',
        expiryDate: '2027-06-30',
        purchasePrice: 7.20,
        sellingPrice: 12.50,
        quantity: 110,
        reservedQuantity: 0,
        availableQuantity: 110,
        supplierId: 'sup-1',
        status: 'ACTIVE',
      },

      // Salbutamol Inhaler
      {
        id: 'btc-401',
        productId: 'prod-4',
        branchId: branch1Id,
        batchNumber: 'SAL-25C03',
        manufacturingDate: '2025-03-01',
        expiryDate: '2027-03-31',
        purchasePrice: 13.00,
        sellingPrice: 22.00,
        quantity: 45,
        reservedQuantity: 0,
        availableQuantity: 45,
        supplierId: 'sup-3',
        status: 'ACTIVE',
      },

      // Ibuprofen - Low stock item to demonstrate low-stock alerts
      {
        id: 'btc-501',
        productId: 'prod-5',
        branchId: branch1Id,
        batchNumber: 'IBU-24M11',
        manufacturingDate: '2024-08-01',
        expiryDate: '2027-08-01',
        purchasePrice: 5.50,
        sellingPrice: 9.75,
        quantity: 12, // Lower than minimum stock 50!
        reservedQuantity: 0,
        availableQuantity: 12,
        supplierId: 'sup-1',
        status: 'ACTIVE',
      },

      // Paracetamol
      {
        id: 'btc-601',
        productId: 'prod-6',
        branchId: branch1Id,
        batchNumber: 'PAR-25G14',
        manufacturingDate: '2025-05-01',
        expiryDate: '2028-05-01',
        purchasePrice: 3.20,
        sellingPrice: 6.50,
        quantity: 180,
        reservedQuantity: 0,
        availableQuantity: 180,
        supplierId: 'sup-2',
        status: 'ACTIVE',
      },

      // Omeprazole - Expired batch example for Quarantine demo
      {
        id: 'btc-701',
        productId: 'prod-7',
        branchId: branch1Id,
        batchNumber: 'OMP-23Z99',
        manufacturingDate: '2023-01-10',
        expiryDate: '2026-06-15', // Already EXPIRED
        purchasePrice: 10.00,
        sellingPrice: 19.90,
        quantity: 8,
        reservedQuantity: 0,
        availableQuantity: 0,
        supplierId: 'sup-1',
        status: 'EXPIRED',
      },
      {
        id: 'btc-702',
        productId: 'prod-7',
        branchId: branch1Id,
        batchNumber: 'OMP-25F18',
        manufacturingDate: '2025-04-01',
        expiryDate: '2027-10-31',
        purchasePrice: 10.50,
        sellingPrice: 19.90,
        quantity: 50,
        reservedQuantity: 0,
        availableQuantity: 50,
        supplierId: 'sup-1',
        status: 'ACTIVE',
      },

      // Azithromycin
      {
        id: 'btc-801',
        productId: 'prod-8',
        branchId: branch1Id,
        batchNumber: 'AZT-24Y05',
        manufacturingDate: '2024-11-01',
        expiryDate: '2026-11-20', // ~98 days
        purchasePrice: 8.80,
        sellingPrice: 16.00,
        quantity: 32,
        reservedQuantity: 0,
        availableQuantity: 32,
        supplierId: 'sup-1',
        status: 'ACTIVE',
      },

      // Amlodipine
      {
        id: 'btc-901',
        productId: 'prod-9',
        branchId: branch1Id,
        batchNumber: 'AML-25D22',
        manufacturingDate: '2025-02-15',
        expiryDate: '2027-09-30',
        purchasePrice: 7.90,
        sellingPrice: 14.20,
        quantity: 65,
        reservedQuantity: 0,
        availableQuantity: 65,
        supplierId: 'sup-2',
        status: 'ACTIVE',
      },

      // Insulin Glargine
      {
        id: 'btc-1101',
        productId: 'prod-11',
        branchId: branch1Id,
        batchNumber: 'INS-25J04',
        manufacturingDate: '2025-04-10',
        expiryDate: '2027-04-10',
        purchasePrice: 52.00,
        sellingPrice: 85.00,
        quantity: 18,
        reservedQuantity: 0,
        availableQuantity: 18,
        supplierId: 'sup-1',
        status: 'ACTIVE',
      },

      // Glucose Meter Kit
      {
        id: 'btc-1201',
        productId: 'EQP-GLUC-KIT',
        branchId: branch1Id,
        batchNumber: 'ACC-25R88',
        manufacturingDate: '2025-01-01',
        expiryDate: '2029-01-01',
        purchasePrice: 28.00,
        sellingPrice: 45.00,
        quantity: 14,
        reservedQuantity: 0,
        availableQuantity: 14,
        supplierId: 'sup-2',
        status: 'ACTIVE',
      }
    ];

    batchList.forEach((b) => {
      const prod = this.products.find((p) => p.id === b.productId);
      const sup = this.suppliers.find((s) => s.id === b.supplierId);
      this.batches.push({
        ...b,
        organizationId: orgId,
        productName: prod?.name,
        sku: prod?.sku,
        barcode: prod?.barcode,
        supplierName: sup?.name,
        createdAt: '2025-02-01T08:00:00.000Z',
        updatedAt: '2025-02-01T08:00:00.000Z',
      } as ProductBatch);
    });

    // 9. Customers
    this.customers.push(
      {
        id: 'cust-1',
        organizationId: orgId,
        name: 'Eleanor Vance',
        phone: '+1 (555) 912-3847',
        email: 'eleanor.vance@gmail.com',
        address: '42 Maple Street, Apartment 3B, Metro City',
        dateOfBirth: '1968-04-12',
        allergies: ['Penicillin', 'Sulfa drugs'],
        notes: 'Chronic hypertension & Type 2 Diabetes. Request easy-open pill caps.',
        creditLimit: 500.00,
        creditBalance: 45.00,
        totalSpent: 1240.50,
        totalPrescriptions: 8,
        createdAt: '2025-01-20T08:00:00.000Z',
      },
      {
        id: 'cust-2',
        organizationId: orgId,
        name: 'Robert Miller',
        phone: '+1 (555) 438-2910',
        email: 'rmiller.architect@outlook.com',
        address: '159 Oak Ridge Road, Metro City',
        dateOfBirth: '1982-11-03',
        allergies: ['Aspirin'],
        notes: 'Asthma patient. Refills Ventolin regularly.',
        creditLimit: 300.00,
        creditBalance: 0.00,
        totalSpent: 620.00,
        totalPrescriptions: 4,
        createdAt: '2025-02-05T08:00:00.000Z',
      },
      {
        id: 'cust-3',
        organizationId: orgId,
        name: 'Maria Gonzalez',
        phone: '+1 (555) 720-9481',
        email: 'maria.g@healthplus.net',
        address: '73 Willow Lane, Downtown',
        dateOfBirth: '1975-08-25',
        allergies: [],
        notes: 'Family account (2 children).',
        creditLimit: 400.00,
        creditBalance: 120.00,
        totalSpent: 890.00,
        totalPrescriptions: 6,
        createdAt: '2025-02-15T08:00:00.000Z',
      },
      {
        id: 'cust-4',
        organizationId: orgId,
        name: 'Walk-In Customer (Cash)',
        phone: '+1 (555) 000-0000',
        email: 'walkin@pharmacore.health',
        address: 'Counter Direct',
        creditLimit: 0,
        creditBalance: 0,
        totalSpent: 3500.00,
        totalPrescriptions: 0,
        createdAt: '2025-01-10T08:00:00.000Z',
      }
    );

    // 10. Prescriptions
    this.prescriptions.push(
      {
        id: 'rx-101',
        prescriptionNumber: 'RX-2026-8819',
        organizationId: orgId,
        branchId: branch1Id,
        customerId: 'cust-1',
        customerName: 'Eleanor Vance',
        customerPhone: '+1 (555) 912-3847',
        doctorName: 'Dr. Gregory House, MD',
        doctorLicense: 'MD-849201-STATE',
        hospitalClinic: 'Metro City Memorial Hospital',
        prescriptionDate: '2026-08-10',
        expiryDate: '2026-11-10',
        diagnosis: 'Essential Hypertension, Type 2 Diabetes Mellitus',
        items: [
          {
            id: 'rx-item-1',
            productId: 'prod-2',
            productName: 'Atorvastatin Calcium 20mg',
            dosage: '20mg',
            frequency: 'Once daily at bedtime',
            duration: '30 days',
            quantity: 1,
            instructions: 'Take with water before sleep. Monitor lipid levels.',
            dispensedQuantity: 1,
            remainingQuantity: 0,
          },
          {
            id: 'rx-item-2',
            productId: 'prod-3',
            productName: 'Metformin Hydrochloride 500mg SR',
            dosage: '500mg',
            frequency: 'Twice daily with meals',
            duration: '30 days',
            quantity: 2,
            instructions: 'Take with morning and evening meals.',
            dispensedQuantity: 0,
            remainingQuantity: 2,
          },
        ],
        status: 'PARTIALLY_DISPENSED',
        notes: 'Refill 2 of 5 authorized.',
        pharmacistId: 'usr-2',
        pharmacistName: 'Marcus Chen, RPh',
        createdAt: '2026-08-10T09:30:00.000Z',
        updatedAt: '2026-08-12T14:15:00.000Z',
      },
      {
        id: 'rx-102',
        prescriptionNumber: 'RX-2026-9042',
        organizationId: orgId,
        branchId: branch1Id,
        customerId: 'cust-2',
        customerName: 'Robert Miller',
        customerPhone: '+1 (555) 438-2910',
        doctorName: 'Dr. Emily Watson, MD',
        doctorLicense: 'PULM-77192',
        hospitalClinic: 'St. Jude Pulmonary Center',
        prescriptionDate: '2026-08-13',
        expiryDate: '2027-02-13',
        diagnosis: 'Acute Asthma Exacerbation',
        items: [
          {
            id: 'rx-item-3',
            productId: 'prod-4',
            productName: 'Salbutamol HFA Inhaler 100mcg',
            dosage: '2 puffs',
            frequency: 'Every 4-6 hours as needed for wheezing',
            duration: 'PRN',
            quantity: 2,
            instructions: 'Inhale 2 puffs via spacer during acute shortness of breath.',
            dispensedQuantity: 0,
            remainingQuantity: 2,
          },
          {
            id: 'rx-item-4',
            productId: 'prod-8',
            productName: 'Azithromycin 500mg 3-Day Pack',
            dosage: '500mg',
            frequency: 'Once daily for 3 consecutive days',
            duration: '3 days',
            quantity: 1,
            instructions: 'Take 1 hour before or 2 hours after meals.',
            dispensedQuantity: 0,
            remainingQuantity: 1,
          }
        ],
        status: 'PENDING',
        notes: 'Stat urgent dispensing requested by clinic.',
        pharmacistId: 'usr-2',
        pharmacistName: 'Marcus Chen, RPh',
        createdAt: '2026-08-13T16:00:00.000Z',
        updatedAt: '2026-08-13T16:00:00.000Z',
      }
    );

    // 11. Purchase Orders
    this.purchaseOrders.push(
      {
        id: 'po-101',
        poNumber: 'PO-2026-0041',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        supplierId: 'sup-1',
        supplierName: 'Apex Pharmaceutical Distributors',
        items: [
          {
            productId: 'prod-1',
            productName: 'Amoxicillin Clavulanate 625mg',
            sku: 'MED-AMOX-500',
            batchNumber: 'AMX-25K09',
            manufacturingDate: '2025-06-10',
            expiryDate: '2027-12-31',
            quantity: 100,
            unitCost: 11.50,
            taxRate: 5.0,
            discountRate: 0,
            total: 1207.50,
          },
          {
            productId: 'prod-3',
            productName: 'Metformin Hydrochloride 500mg SR',
            sku: 'MED-METF-500',
            batchNumber: 'MET-25A19',
            manufacturingDate: '2025-01-10',
            expiryDate: '2027-06-30',
            quantity: 120,
            unitCost: 7.20,
            taxRate: 5.0,
            discountRate: 0,
            total: 907.20,
          }
        ],
        subtotal: 2014.00,
        taxAmount: 100.70,
        discountAmount: 0.00,
        totalAmount: 2114.70,
        paidAmount: 2114.70,
        status: 'RECEIVED',
        paymentStatus: 'PAID',
        notes: 'Received in full. Cold-chain checked.',
        createdBy: 'usr-4',
        createdByName: 'David Kalu',
        createdAt: '2026-08-01T09:00:00.000Z',
        receivedAt: '2026-08-03T11:20:00.000Z',
      },
      {
        id: 'po-102',
        poNumber: 'PO-2026-0048',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        supplierId: 'sup-2',
        supplierName: 'MedSource National Wholesalers',
        items: [
          {
            productId: 'prod-5',
            productName: 'Ibuprofen Rapid Release 400mg',
            sku: 'MED-IBUP-400',
            batchNumber: 'IBU-26B01',
            manufacturingDate: '2026-02-01',
            expiryDate: '2028-02-01',
            quantity: 200,
            unitCost: 5.50,
            taxRate: 5.0,
            discountRate: 5,
            total: 1097.25,
          }
        ],
        subtotal: 1100.00,
        taxAmount: 52.25,
        discountAmount: 55.00,
        totalAmount: 1097.25,
        paidAmount: 0.00,
        status: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Emergency restock for low Ibuprofen levels.',
        createdBy: 'usr-4',
        createdByName: 'David Kalu',
        createdAt: '2026-08-12T14:00:00.000Z',
      }
    );

    // 12. Completed Sales Records (for Financial Reporting & COGS verification)
    this.sales.push(
      {
        id: 'sale-101',
        invoiceNumber: 'INV-2026-10491',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        customerId: 'cust-1',
        customerName: 'Eleanor Vance',
        customerPhone: '+1 (555) 912-3847',
        prescriptionId: 'rx-101',
        prescriptionNumber: 'RX-2026-8819',
        items: [
          {
            productId: 'prod-2',
            productName: 'Atorvastatin Calcium 20mg',
            genericName: 'Atorvastatin',
            sku: 'MED-ATOR-20',
            quantity: 1,
            unitPrice: 28.00,
            discountPercent: 0,
            taxPercent: 5.0,
            subtotal: 28.00,
            total: 29.40,
            batches: [
              {
                batchId: 'btc-201',
                batchNumber: 'ATV-24H08',
                expiryDate: '2026-10-10',
                quantity: 1,
                unitCost: 16.00,
              }
            ],
          }
        ],
        subtotal: 28.00,
        discountAmount: 0.00,
        taxAmount: 1.40,
        totalAmount: 29.40,
        cogsTotal: 16.00,
        grossProfit: 13.40,
        paymentMethod: 'CARD',
        paymentBreakdown: [{ method: 'CARD', amount: 29.40, reference: 'AUTH-49102' }],
        amountPaid: 29.40,
        changeAmount: 0.00,
        cashierId: 'usr-3',
        cashierName: 'Elena Rostova',
        status: 'COMPLETED',
        createdAt: '2026-08-12T14:15:00.000Z',
      },
      {
        id: 'sale-102',
        invoiceNumber: 'INV-2026-10492',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        customerId: 'cust-4',
        customerName: 'Walk-In Customer (Cash)',
        items: [
          {
            productId: 'prod-6',
            productName: 'Paracetamol Extra Strength 500mg',
            genericName: 'Acetaminophen / Paracetamol',
            sku: 'MED-PARA-500',
            quantity: 2,
            unitPrice: 6.50,
            discountPercent: 0,
            taxPercent: 5.0,
            subtotal: 13.00,
            total: 13.65,
            batches: [
              {
                batchId: 'btc-601',
                batchNumber: 'PAR-25G14',
                expiryDate: '2028-05-01',
                quantity: 2,
                unitCost: 3.20,
              }
            ],
          },
          {
            productId: 'prod-5',
            productName: 'Ibuprofen Rapid Release 400mg',
            genericName: 'Ibuprofen',
            sku: 'MED-IBUP-400',
            quantity: 1,
            unitPrice: 9.75,
            discountPercent: 0,
            taxPercent: 5.0,
            subtotal: 9.75,
            total: 10.24,
            batches: [
              {
                batchId: 'btc-501',
                batchNumber: 'IBU-24M11',
                expiryDate: '2027-08-01',
                quantity: 1,
                unitCost: 5.50,
              }
            ],
          }
        ],
        subtotal: 22.75,
        discountAmount: 0.00,
        taxAmount: 1.14,
        totalAmount: 23.89,
        cogsTotal: 11.90,
        grossProfit: 11.99,
        paymentMethod: 'CASH',
        paymentBreakdown: [{ method: 'CASH', amount: 25.00 }],
        amountPaid: 25.00,
        changeAmount: 1.11,
        cashierId: 'usr-3',
        cashierName: 'Elena Rostova',
        status: 'COMPLETED',
        createdAt: '2026-08-13T10:45:00.000Z',
      },
      {
        id: 'sale-103',
        invoiceNumber: 'INV-2026-10493',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        customerId: 'cust-3',
        customerName: 'Maria Gonzalez',
        customerPhone: '+1 (555) 720-9481',
        items: [
          {
            productId: 'prod-1',
            productName: 'Amoxicillin Clavulanate 625mg',
            genericName: 'Amoxicillin + Clavulanic Acid',
            sku: 'MED-AMOX-500',
            quantity: 2,
            unitPrice: 18.50,
            discountPercent: 0,
            taxPercent: 5.0,
            subtotal: 37.00,
            total: 38.85,
            batches: [
              {
                batchId: 'btc-101',
                batchNumber: 'AMX-24E01', // FEFO selected earliest batch!
                expiryDate: '2026-09-08',
                quantity: 2,
                unitCost: 11.20,
              }
            ],
          }
        ],
        subtotal: 37.00,
        discountAmount: 0.00,
        taxAmount: 1.85,
        totalAmount: 38.85,
        cogsTotal: 22.40,
        grossProfit: 16.45,
        paymentMethod: 'MOBILE_PAYMENT',
        paymentBreakdown: [{ method: 'MOBILE_PAYMENT', amount: 38.85, reference: 'MP-892019' }],
        amountPaid: 38.85,
        changeAmount: 0.00,
        cashierId: 'usr-3',
        cashierName: 'Elena Rostova',
        status: 'COMPLETED',
        createdAt: '2026-08-14T08:20:00.000Z',
      }
    );

    // 13. Expenses
    this.expenses.push(
      {
        id: 'exp-1',
        expenseNumber: 'EXP-2026-018',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        category: 'Rent',
        amount: 3200.00,
        paymentMethod: 'BANK_TRANSFER',
        description: 'Monthly store lease for Downtown Central retail premises',
        date: '2026-08-01',
        createdBy: 'usr-5',
        createdByName: 'Rachel Adams, CPA',
        createdAt: '2026-08-01T10:00:00.000Z',
      },
      {
        id: 'exp-2',
        expenseNumber: 'EXP-2026-019',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        category: 'Electricity',
        amount: 485.50,
        paymentMethod: 'BANK_TRANSFER',
        description: 'HVAC & cold-chain refrigeration electricity bill',
        date: '2026-08-05',
        createdBy: 'usr-5',
        createdByName: 'Rachel Adams, CPA',
        createdAt: '2026-08-05T14:30:00.000Z',
      },
      {
        id: 'exp-3',
        expenseNumber: 'EXP-2026-020',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        category: 'Packaging',
        amount: 140.00,
        paymentMethod: 'CASH',
        description: 'Rx amber bottles, child-resistant caps, and thermal receipt paper rolls',
        date: '2026-08-11',
        createdBy: 'usr-4',
        createdByName: 'David Kalu',
        createdAt: '2026-08-11T16:00:00.000Z',
      }
    );

    // 14. Stock Transfers
    this.stockTransfers.push(
      {
        id: 'trf-101',
        transferNumber: 'TRF-2026-0012',
        organizationId: orgId,
        fromBranchId: branch1Id,
        fromBranchName: 'Downtown Central Pharmacy & Clinic',
        toBranchId: branch2Id,
        toBranchName: 'Northside Medical Center Pharmacy',
        productId: 'prod-1',
        productName: 'Amoxicillin Clavulanate 625mg',
        batchId: 'btc-102',
        batchNumber: 'AMX-25K09',
        quantity: 15,
        status: 'COMPLETED',
        requestedBy: 'Dr. James Vance',
        approvedBy: 'Dr. Sarah Jenkins, PharmD',
        notes: 'Urgent clinic request for pediatric infection surge.',
        createdAt: '2026-08-08T10:00:00.000Z',
        completedAt: '2026-08-08T15:30:00.000Z',
      }
    );

    // 15. Initial Transactions Log
    this.transactions.push(
      {
        id: 'tx-1',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        productId: 'prod-1',
        productName: 'Amoxicillin Clavulanate 625mg',
        batchId: 'btc-101',
        batchNumber: 'AMX-24E01',
        type: 'SALE',
        quantity: -2,
        balanceAfter: 14,
        referenceType: 'SALE',
        referenceId: 'sale-103',
        reason: 'POS Invoice INV-2026-10493 (FEFO Batch Dispense)',
        userId: 'usr-3',
        userName: 'Elena Rostova',
        timestamp: '2026-08-14T08:20:00.000Z',
      },
      {
        id: 'tx-2',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        productId: 'prod-7',
        productName: 'Omeprazole Delayed-Release 20mg',
        batchId: 'btc-701',
        batchNumber: 'OMP-23Z99',
        type: 'EXPIRED',
        quantity: -8,
        balanceAfter: 0,
        reason: 'Automated FEFO expiry quarantine check. Moved to quarantine bay.',
        userId: 'usr-4',
        userName: 'David Kalu',
        timestamp: '2026-08-10T09:00:00.000Z',
      }
    );

    // 16. Notifications
    this.refreshNotifications();

    // 17. Initial Audit Logs
    this.auditLogs.push(
      {
        id: 'aud-1',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        userId: 'usr-1',
        userName: 'Dr. Sarah Jenkins, PharmD',
        userRole: 'PHARMACY_OWNER',
        action: 'SYSTEM_BOOTSTRAP',
        entity: 'ORGANIZATION',
        entityId: orgId,
        details: 'Initial organizational parameters, branch structures and formulary loaded.',
        timestamp: '2025-01-10T08:00:00.000Z',
      },
      {
        id: 'aud-2',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        userId: 'usr-4',
        userName: 'David Kalu',
        userRole: 'INVENTORY_MANAGER',
        action: 'RECEIVE_PURCHASE',
        entity: 'PURCHASE_ORDER',
        entityId: 'po-101',
        details: 'Received PO-2026-0041 from Apex Pharma. Batches added to inventory.',
        timestamp: '2026-08-03T11:20:00.000Z',
      },
      {
        id: 'aud-3',
        organizationId: orgId,
        branchId: branch1Id,
        branchName: 'Downtown Central Pharmacy & Clinic',
        userId: 'usr-3',
        userName: 'Elena Rostova',
        userRole: 'CASHIER',
        action: 'CREATE_SALE',
        entity: 'SALE',
        entityId: 'sale-103',
        details: 'Processed POS Sale INV-2026-10493 ($38.85) for Maria Gonzalez with FEFO batch AMX-24E01.',
        timestamp: '2026-08-14T08:20:00.000Z',
      }
    );
  }

  // Refresh dynamic alerts based on stock, expiry, and payment thresholds
  public refreshNotifications() {
    const today = new Date('2026-08-14');
    const orgId = 'org-1';
    const alerts: AppNotification[] = [];

    // Low stock alerts
    for (const p of this.products) {
      const activeBatches = this.batches.filter((b) => b.productId === p.id && b.status === 'ACTIVE');
      const totalStock = activeBatches.reduce((sum, b) => sum + b.availableQuantity, 0);
      if (totalStock <= p.minimumStock) {
        alerts.push({
          id: `notif-stock-${p.id}`,
          organizationId: orgId,
          type: 'LOW_STOCK',
          title: `Low Stock Alert: ${p.name}`,
          message: `Current stock is ${totalStock} ${p.unit} (Minimum: ${p.minimumStock}, Reorder: ${p.reorderLevel}). Order urgently.`,
          severity: totalStock === 0 ? 'CRITICAL' : 'WARNING',
          read: false,
          linkTo: '/inventory',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Expiry alerts (Expired, <30 days, <90 days)
    for (const b of this.batches) {
      if (b.quantity <= 0) continue;
      const expDate = new Date(b.expiryDate);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        alerts.push({
          id: `notif-exp-${b.id}`,
          organizationId: orgId,
          type: 'EXPIRED',
          title: `Batch Expired: ${b.productName} (${b.batchNumber})`,
          message: `Batch ${b.batchNumber} expired on ${b.expiryDate}. Stock is automatically blocked from POS.`,
          severity: 'CRITICAL',
          read: false,
          linkTo: '/batches',
          createdAt: new Date().toISOString(),
        });
      } else if (diffDays <= 30) {
        alerts.push({
          id: `notif-exp-30-${b.id}`,
          organizationId: orgId,
          type: 'EXPIRING_SOON',
          title: `Critical Expiry (${diffDays} days): ${b.productName}`,
          message: `Batch ${b.batchNumber} (${b.availableQuantity} units) expires on ${b.expiryDate}. FEFO prioritizing.`,
          severity: 'WARNING',
          read: false,
          linkTo: '/batches',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Pending Prescriptions
    const pendingRx = this.prescriptions.filter((rx) => rx.status === 'PENDING');
    if (pendingRx.length > 0) {
      alerts.push({
        id: 'notif-rx-pending',
        organizationId: orgId,
        type: 'PENDING_PRESCRIPTION',
        title: `${pendingRx.length} Prescription(s) Awaiting Dispensing`,
        message: `High priority clinical prescriptions are waiting for verification and pharmacist dispensing.`,
        severity: 'INFO',
        read: false,
        linkTo: '/prescriptions',
        createdAt: new Date().toISOString(),
      });
    }

    // Supplier balances due
    const totalSupplierPayable = this.suppliers.reduce((sum, s) => sum + s.currentBalance, 0);
    if (totalSupplierPayable > 0) {
      alerts.push({
        id: 'notif-sup-payable',
        organizationId: orgId,
        type: 'SUPPLIER_PAYMENT_DUE',
        title: `Supplier Payables Due: $${totalSupplierPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        message: `Outstanding invoices awaiting scheduled accounting disbursements.`,
        severity: 'INFO',
        read: false,
        linkTo: '/suppliers',
        createdAt: new Date().toISOString(),
      });
    }

    this.notifications = alerts;
  }

  // FEFO Allocation Algorithm
  public allocateBatchesForSale(
    branchId: string,
    productId: string,
    requestedQty: number
  ): {
    success: boolean;
    allocated: { batchId: string; batchNumber: string; expiryDate: string; quantity: number; purchasePrice: number }[];
    error?: string;
  } {
    const todayStr = '2026-08-14';

    // Filter valid batches for this branch & product:
    // 1. ACTIVE status
    // 2. availableQuantity > 0
    // 3. Expiry date > today (FEFO Rule: Never sell expired batches)
    const validBatches = this.batches
      .filter(
        (b) =>
          b.branchId === branchId &&
          b.productId === productId &&
          b.status === 'ACTIVE' &&
          b.availableQuantity > 0 &&
          b.expiryDate >= todayStr
      )
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    const totalAvailable = validBatches.reduce((acc, b) => acc + b.availableQuantity, 0);
    if (totalAvailable < requestedQty) {
      return {
        success: false,
        allocated: [],
        error: `Insufficient stock for product. Available: ${totalAvailable}, Requested: ${requestedQty}`,
      };
    }

    let remainingToAllocate = requestedQty;
    const allocated: { batchId: string; batchNumber: string; expiryDate: string; quantity: number; purchasePrice: number }[] = [];

    for (const batch of validBatches) {
      if (remainingToAllocate <= 0) break;
      const take = Math.min(remainingToAllocate, batch.availableQuantity);
      allocated.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: take,
        purchasePrice: batch.purchasePrice,
      });
      remainingToAllocate -= take;
    }

    return { success: true, allocated };
  }

  // Complete a Sale with FEFO deduction & transaction logging
  public processSale(saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'createdAt' | 'grossProfit' | 'cogsTotal'>): Sale {
    const saleId = `sale-${Date.now()}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const timestamp = new Date().toISOString();

    let cogsTotal = 0;

    // Deduct batch quantities and log transactions
    for (const item of saleData.items) {
      for (const bAlloc of item.batches) {
        const batch = this.batches.find((b) => b.id === bAlloc.batchId);
        if (batch) {
          batch.quantity -= bAlloc.quantity;
          batch.availableQuantity -= bAlloc.quantity;
          if (batch.quantity <= 0) {
            batch.status = 'DEPLETED';
          }
          batch.updatedAt = timestamp;

          cogsTotal += bAlloc.quantity * bAlloc.unitCost;

          // Inventory Transaction Record
          this.transactions.unshift({
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            organizationId: saleData.organizationId,
            branchId: saleData.branchId,
            branchName: saleData.branchName,
            productId: item.productId,
            productName: item.productName,
            batchId: batch.id,
            batchNumber: batch.batchNumber,
            type: 'SALE',
            quantity: -bAlloc.quantity,
            balanceAfter: batch.availableQuantity,
            referenceType: 'SALE',
            referenceId: saleId,
            reason: `POS Sale ${invoiceNumber} (Batch ${batch.batchNumber}, Exp: ${batch.expiryDate})`,
            userId: saleData.cashierId,
            userName: saleData.cashierName,
            timestamp,
          });
        }
      }
    }

    // Update Customer records if applicable
    if (saleData.customerId && saleData.customerId !== 'cust-4') {
      const customer = this.customers.find((c) => c.id === saleData.customerId);
      if (customer) {
        customer.totalSpent += saleData.totalAmount;
        if (saleData.paymentMethod === 'CREDIT') {
          customer.creditBalance += saleData.totalAmount;
        }
      }
    }

    // Update Prescription if dispensing
    if (saleData.prescriptionId) {
      const rx = this.prescriptions.find((r) => r.id === saleData.prescriptionId);
      if (rx) {
        for (const item of saleData.items) {
          const rxItem = rx.items.find((i) => i.productId === item.productId);
          if (rxItem) {
            rxItem.dispensedQuantity += item.quantity;
            rxItem.remainingQuantity = Math.max(0, rxItem.remainingQuantity - item.quantity);
          }
        }
        const allDone = rx.items.every((i) => i.remainingQuantity === 0);
        rx.status = allDone ? 'DISPENSED' : 'PARTIALLY_DISPENSED';
        rx.updatedAt = timestamp;
      }
    }

    const grossProfit = saleData.totalAmount - cogsTotal;

    const newSale: Sale = {
      ...saleData,
      id: saleId,
      invoiceNumber,
      cogsTotal,
      grossProfit,
      createdAt: timestamp,
    };

    this.sales.unshift(newSale);

    // Audit log
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      organizationId: saleData.organizationId,
      branchId: saleData.branchId,
      branchName: saleData.branchName,
      userId: saleData.cashierId,
      userName: saleData.cashierName,
      userRole: 'CASHIER',
      action: 'CREATE_SALE',
      entity: 'SALE',
      entityId: saleId,
      details: `Generated Invoice ${invoiceNumber} for $${newSale.totalAmount.toFixed(2)} (${newSale.items.length} items). FEFO allocated.`,
      newValue: { invoiceNumber, total: newSale.totalAmount, grossProfit },
      timestamp,
    });

    this.refreshNotifications();
    return newSale;
  }

  // Receive a Purchase Order and add fresh Batches
  public receivePurchaseOrder(poId: string, receivedByUserId: string, receivedByUserName: string): PurchaseOrder {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error('Purchase Order not found');

    const timestamp = new Date().toISOString();

    for (const item of po.items) {
      const existingBatch = this.batches.find(
        (b) => b.productId === item.productId && b.batchNumber === item.batchNumber && b.branchId === po.branchId
      );

      const prod = this.products.find((p) => p.id === item.productId);

      if (existingBatch) {
        existingBatch.quantity += item.quantity;
        existingBatch.availableQuantity += item.quantity;
        existingBatch.purchasePrice = item.unitCost;
        existingBatch.status = 'ACTIVE';
        existingBatch.updatedAt = timestamp;

        this.transactions.unshift({
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          organizationId: po.organizationId,
          branchId: po.branchId,
          branchName: po.branchName,
          productId: item.productId,
          productName: item.productName,
          batchId: existingBatch.id,
          batchNumber: existingBatch.batchNumber,
          type: 'PURCHASE',
          quantity: item.quantity,
          balanceAfter: existingBatch.availableQuantity,
          referenceType: 'PURCHASE_ORDER',
          referenceId: po.id,
          reason: `PO ${po.poNumber} Receiving (Supplier: ${po.supplierName})`,
          userId: receivedByUserId,
          userName: receivedByUserName,
          timestamp,
        });
      } else {
        const newBatchId = `btc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newBatch: ProductBatch = {
          id: newBatchId,
          organizationId: po.organizationId,
          branchId: po.branchId,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          barcode: prod?.barcode,
          batchNumber: item.batchNumber,
          manufacturingDate: item.manufacturingDate,
          expiryDate: item.expiryDate,
          purchasePrice: item.unitCost,
          sellingPrice: prod?.sellingPrice || item.unitCost * 1.5,
          quantity: item.quantity,
          reservedQuantity: 0,
          availableQuantity: item.quantity,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          status: 'ACTIVE',
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        this.batches.push(newBatch);

        this.transactions.unshift({
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          organizationId: po.organizationId,
          branchId: po.branchId,
          branchName: po.branchName,
          productId: item.productId,
          productName: item.productName,
          batchId: newBatch.id,
          batchNumber: newBatch.batchNumber,
          type: 'PURCHASE',
          quantity: item.quantity,
          balanceAfter: newBatch.availableQuantity,
          referenceType: 'PURCHASE_ORDER',
          referenceId: po.id,
          reason: `PO ${po.poNumber} New Batch Received (Supplier: ${po.supplierName})`,
          userId: receivedByUserId,
          userName: receivedByUserName,
          timestamp,
        });
      }
    }

    po.status = 'RECEIVED';
    po.receivedAt = timestamp;

    // Adjust supplier payable
    const supplier = this.suppliers.find((s) => s.id === po.supplierId);
    if (supplier) {
      supplier.currentBalance += po.totalAmount - po.paidAmount;
    }

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      organizationId: po.organizationId,
      branchId: po.branchId,
      branchName: po.branchName,
      userId: receivedByUserId,
      userName: receivedByUserName,
      userRole: 'INVENTORY_MANAGER',
      action: 'RECEIVE_PURCHASE',
      entity: 'PURCHASE_ORDER',
      entityId: po.id,
      details: `Received PO ${po.poNumber} totaling $${po.totalAmount.toFixed(2)}. Inventory replenished.`,
      timestamp,
    });

    this.refreshNotifications();
    return po;
  }

  // Calculate Financials (COGS, Gross Profit, Operating Expenses, Net Profit, Balances)
  public getFinancialSummary(branchId?: string, startDate?: string, endDate?: string): FinancialSummary {
    let sales = this.sales.filter((s) => s.status === 'COMPLETED');
    let expenses = this.expenses;

    if (branchId && branchId !== 'ALL') {
      sales = sales.filter((s) => s.branchId === branchId);
      expenses = expenses.filter((e) => e.branchId === branchId);
    }

    if (startDate) {
      sales = sales.filter((s) => s.createdAt >= startDate);
      expenses = expenses.filter((e) => e.date >= startDate.slice(0, 10));
    }
    if (endDate) {
      sales = sales.filter((s) => s.createdAt <= endDate);
      expenses = expenses.filter((e) => e.date <= endDate.slice(0, 10));
    }

    const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const costOfGoodsSold = sales.reduce((sum, s) => sum + s.cogsTotal, 0);
    const grossProfit = revenue - costOfGoodsSold;
    const operatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - operatingExpenses;
    const totalDiscounts = sales.reduce((sum, s) => sum + s.discountAmount, 0);
    const totalTax = sales.reduce((sum, s) => sum + s.taxAmount, 0);

    const customerReceivables = this.customers.reduce((sum, c) => sum + c.creditBalance, 0);
    const supplierPayables = this.suppliers.reduce((sum, s) => sum + s.currentBalance, 0);

    const activeBatches = branchId && branchId !== 'ALL'
      ? this.batches.filter((b) => b.branchId === branchId && b.status === 'ACTIVE')
      : this.batches.filter((b) => b.status === 'ACTIVE');

    const inventoryValuation = activeBatches.reduce((sum, b) => sum + b.availableQuantity * b.purchasePrice, 0);

    return {
      revenue,
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      netProfit,
      totalDiscounts,
      totalTax,
      customerReceivables,
      supplierPayables,
      inventoryValuation,
      salesCount: sales.length,
      averageBasketValue: sales.length > 0 ? revenue / sales.length : 0,
    };
  }

  // AI Demand Forecasting & Smart Reorder Engine
  public getReorderRecommendations(branchId?: string): AIReorderRecommendation[] {
    const list: AIReorderRecommendation[] = [];

    for (const p of this.products) {
      const batches = this.batches.filter(
        (b) => b.productId === p.id && b.status === 'ACTIVE' && (!branchId || branchId === 'ALL' || b.branchId === branchId)
      );
      const currentStock = batches.reduce((sum, b) => sum + b.availableQuantity, 0);

      // Estimate avg daily sales based on historical transactions / seed velocity
      let avgDailySales = 3.5;
      if (p.name.includes('Amoxicillin')) avgDailySales = 4.2;
      else if (p.name.includes('Atorvastatin')) avgDailySales = 3.8;
      else if (p.name.includes('Ibuprofen')) avgDailySales = 6.0;
      else if (p.name.includes('Paracetamol')) avgDailySales = 7.5;
      else if (p.name.includes('Metformin')) avgDailySales = 4.0;
      else if (p.name.includes('Insulin')) avgDailySales = 1.2;

      const daysOfStockLeft = avgDailySales > 0 ? Math.round(currentStock / avgDailySales) : 999;

      if (currentStock <= p.reorderLevel) {
        const targetStock = p.reorderLevel * 2.5;
        const recommendedQuantity = Math.max(20, Math.ceil(targetStock - currentStock));
        const estimatedUnitCost = p.sellingPrice * 0.6;
        const estimatedCost = recommendedQuantity * estimatedUnitCost;

        let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (currentStock <= p.minimumStock) priority = 'HIGH';
        else if (daysOfStockLeft <= 7) priority = 'HIGH';
        else if (daysOfStockLeft <= 14) priority = 'MEDIUM';

        list.push({
          productId: p.id,
          productName: p.name,
          genericName: p.genericName,
          currentStock,
          reorderLevel: p.reorderLevel,
          avgDailySales: Number(avgDailySales.toFixed(1)),
          daysOfStockLeft,
          recommendedQuantity,
          estimatedCost,
          priority,
          rationale: `Stock (${currentStock}) is below reorder threshold (${p.reorderLevel}). At current velocity of ${avgDailySales.toFixed(1)}/day, stock out in ~${daysOfStockLeft} days.`,
        });
      }
    }

    return list.sort((a, b) => (a.priority === 'HIGH' ? -1 : 1));
  }

  // AI Expiry Risk Predictor
  public getExpiryRisks(branchId?: string): AIExpiryRisk[] {
    const today = new Date('2026-08-14');
    const risks: AIExpiryRisk[] = [];

    const activeBatches = this.batches.filter(
      (b) => b.status === 'ACTIVE' && b.availableQuantity > 0 && (!branchId || branchId === 'ALL' || b.branchId === branchId)
    );

    for (const b of activeBatches) {
      const expDate = new Date(b.expiryDate);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 120) {
        // Evaluate daily sales velocity
        const avgDaily = b.productName?.includes('Amoxicillin') ? 2.5 : b.productName?.includes('Atorvastatin') ? 1.5 : 1.0;
        const projectedSales = Math.floor(avgDaily * diffDays);
        const riskQty = Math.max(0, b.availableQuantity - projectedSales);
        const estimatedLoss = riskQty * b.purchasePrice;

        let recommendation = 'FEFO Priority active: System auto-selecting this batch for all POS and Rx sales.';
        if (riskQty > 0) {
          recommendation = `Projected ${riskQty} excess units at expiry. Suggest running 15% discount promotion or initiating supplier return / branch transfer.`;
        }

        risks.push({
          batchId: b.id,
          productName: b.productName || 'Medicine',
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          daysToExpiry: diffDays,
          currentStock: b.availableQuantity,
          projectedSalesBeforeExpiry: projectedSales,
          riskQuantity: riskQty,
          estimatedFinancialLoss: estimatedLoss,
          recommendation,
        });
      }
    }

    return risks.sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }
}

export const db = new PharmacyDatabase();
