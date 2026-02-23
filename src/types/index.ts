// ─── Enums (as const objects for erasableSyntaxOnly) ─────

export const ECommissionType = {
  FLAT: "flat",
  TIERED: "tiered",
} as const;
export type ECommissionType =
  (typeof ECommissionType)[keyof typeof ECommissionType];

export const ETieredMode = {
  FLAT: "flat",
  MARGINAL: "marginal",
} as const;
export type ETieredMode = (typeof ETieredMode)[keyof typeof ETieredMode];

export const EPage = {
  DASHBOARD: "dashboard",
  SALES_ENTRY: "sales-entry",
  SUPPLIERS: "suppliers",
  EMPLOYEES: "employees",
  SETTINGS: "settings",
} as const;
export type EPage = (typeof EPage)[keyof typeof EPage];

// ─── Core Models ─────────────────────────────────────────

export interface IProduct {
  id: string;
  name: string;
  costPerUnit: number;
}

export interface ISupplier {
  id: string;
  name: string;
  products: IProduct[];
}

export interface ICommissionTier {
  threshold: number;
  rate: number;
}

export interface IEmployee {
  id: string;
  name: string;
  commissionType: ECommissionType;
  flatRate?: number;
  tieredMode?: ETieredMode;
  tiers?: ICommissionTier[];
}

// ─── Sales Entry ─────────────────────────────────────────

export interface IProductSaleEntry {
  productId: string;
  quantitySold: number;
}

export interface IMonthlySalesEntry {
  employeeId: string;
  dailySales: number[];
}

// ─── Calculation Results ─────────────────────────────────

export interface IProductPaymentLine {
  productId: string;
  productName: string;
  quantitySold: number;
  costPerUnit: number;
  lineTotal: number;
}

export interface ISupplierPaymentResult {
  supplierId: string;
  supplierName: string;
  lines: IProductPaymentLine[];
  total: number;
}

export interface ICommissionTierBreakdown {
  rangeStart: number;
  rangeEnd: number;
  rate: number;
  amount: number;
}

export interface ICommissionResult {
  employeeId: string;
  employeeName: string;
  totalSales: number;
  commissionAmount: number;
  commissionType: ECommissionType;
  tieredMode?: ETieredMode;
  breakdown: ICommissionTierBreakdown[];
}

export interface IMonthlySummary {
  totalRevenue: number;
  totalSupplierCost: number;
  totalCommissions: number;
  totalLocationCosts: number;
  totalExpenses: number;
  grossProfit: number;
  profitMarginPercent: number;
  supplierBreakdown: ISupplierPaymentResult[];
  employeeBreakdown: ICommissionResult[];
}

// ─── Locations & Expenses ────────────────────────────────

export interface ILocation {
  id: string;
  name: string;
  monthlyRent: number;
}

export interface IExpenseItem {
  id: string;
  name: string;
  amount: number;
}

// ─── App Settings ────────────────────────────────────────

export interface IAppSettings {
  currencySymbol: string;
  darkMode: boolean;
}

// ─── App State ───────────────────────────────────────────

export interface IAppState {
  suppliers: ISupplier[];
  employees: IEmployee[];
  sales: IMonthlySalesEntry[];
  productSales: IProductSaleEntry[];
  locations: ILocation[];
  expenses: IExpenseItem[];
  settings: IAppSettings;
}

// ─── JSON Import Schemas ─────────────────────────────────

export interface ISuppliersImport {
  suppliers: ISupplier[];
}

export interface IEmployeesImport {
  employees: IEmployee[];
}

// ─── Validation ──────────────────────────────────────────

export interface IValidationResult {
  valid: boolean;
  errors: string[];
}
