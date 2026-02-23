import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type {
  IAppState,
  ISupplier,
  IEmployee,
  ILocation,
  IExpenseItem,
  IProductSaleEntry,
  IMonthlySalesEntry,
  IAppSettings,
  IProduct,
  ICommissionTier,
} from "@/types";
import { ECommissionType, ETieredMode } from "@/types";
import defaultSuppliersData from "@/data/default-suppliers.json";
import defaultEmployeesData from "@/data/default-employees.json";
import defaultSalesData from "@/data/default-sales.json";
import defaultProductSalesData from "@/data/default-product-sales.json";

// ─── Storage Keys ────────────────────────────────────────

const STORAGE_KEYS = {
  suppliers: "paycalc_suppliers",
  employees: "paycalc_employees",
  sales: "paycalc_sales",
  productSales: "paycalc_product_sales",
  locations: "paycalc_locations",
  expenses: "paycalc_expenses",
  settings: "paycalc_settings",
} as const;

// ─── Default Values ──────────────────────────────────────

const DEFAULT_SETTINGS: IAppSettings = {
  currencySymbol: "$",
  darkMode: false,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function buildInitialState(): IAppState {
  return {
    suppliers: loadFromStorage<ISupplier[]>(
      STORAGE_KEYS.suppliers,
      defaultSuppliersData.suppliers as ISupplier[]
    ),
    employees: loadFromStorage<IEmployee[]>(
      STORAGE_KEYS.employees,
      defaultEmployeesData.employees as IEmployee[]
    ),
    sales: loadFromStorage<IMonthlySalesEntry[]>(
      STORAGE_KEYS.sales,
      defaultSalesData.sales as IMonthlySalesEntry[]
    ),
    productSales: loadFromStorage<IProductSaleEntry[]>(
      STORAGE_KEYS.productSales,
      defaultProductSalesData.productSales as IProductSaleEntry[]
    ),
    locations: loadFromStorage<ILocation[]>(STORAGE_KEYS.locations, []),
    expenses: loadFromStorage<IExpenseItem[]>(STORAGE_KEYS.expenses, []),
    settings: loadFromStorage<IAppSettings>(
      STORAGE_KEYS.settings,
      DEFAULT_SETTINGS
    ),
  };
}

// ─── Actions ─────────────────────────────────────────────

type AppAction =
  // Suppliers
  | { type: "ADD_SUPPLIER"; payload: ISupplier }
  | { type: "UPDATE_SUPPLIER"; payload: { id: string; name: string } }
  | { type: "DELETE_SUPPLIER"; payload: string }
  | { type: "ADD_PRODUCT"; payload: { supplierId: string; product: IProduct } }
  | {
      type: "UPDATE_PRODUCT";
      payload: { supplierId: string; product: IProduct };
    }
  | {
      type: "DELETE_PRODUCT";
      payload: { supplierId: string; productId: string };
    }
  // Employees
  | { type: "ADD_EMPLOYEE"; payload: IEmployee }
  | { type: "UPDATE_EMPLOYEE"; payload: IEmployee }
  | { type: "DELETE_EMPLOYEE"; payload: string }
  // Sales
  | { type: "SET_SALES"; payload: IMonthlySalesEntry[] }
  | { type: "ADD_SALES_ENTRY"; payload: IMonthlySalesEntry }
  | { type: "UPDATE_SALES_ENTRY"; payload: IMonthlySalesEntry }
  | { type: "DELETE_SALES_ENTRY"; payload: string }
  | { type: "CLEAR_SALES" }
  // Product Sales (business-wide)
  | { type: "SET_PRODUCT_SALES"; payload: IProductSaleEntry[] }
  // Locations
  | { type: "ADD_LOCATION"; payload: ILocation }
  | { type: "UPDATE_LOCATION"; payload: ILocation }
  | { type: "DELETE_LOCATION"; payload: string }
  // Expenses
  | { type: "ADD_EXPENSE"; payload: IExpenseItem }
  | { type: "UPDATE_EXPENSE"; payload: IExpenseItem }
  | { type: "DELETE_EXPENSE"; payload: string }
  // Settings
  | { type: "UPDATE_SETTINGS"; payload: Partial<IAppSettings> }
  // Bulk import
  | { type: "IMPORT_SUPPLIERS"; payload: ISupplier[] }
  | { type: "IMPORT_EMPLOYEES"; payload: IEmployee[] }
  // Reset
  | { type: "RESET_ALL" };

function appReducer(state: IAppState, action: AppAction): IAppState {
  switch (action.type) {
    // ── Suppliers ──
    case "ADD_SUPPLIER":
      return { ...state, suppliers: [...state.suppliers, action.payload] };

    case "UPDATE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.payload.id
            ? { ...s, name: action.payload.name }
            : s
        ),
      };

    case "DELETE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.filter((s) => s.id !== action.payload),
      };

    case "ADD_PRODUCT":
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.payload.supplierId
            ? { ...s, products: [...s.products, action.payload.product] }
            : s
        ),
      };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.payload.supplierId
            ? {
                ...s,
                products: s.products.map((p) =>
                  p.id === action.payload.product.id
                    ? action.payload.product
                    : p
                ),
              }
            : s
        ),
      };

    case "DELETE_PRODUCT":
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.payload.supplierId
            ? {
                ...s,
                products: s.products.filter(
                  (p) => p.id !== action.payload.productId
                ),
              }
            : s
        ),
      };

    // ── Employees ──
    case "ADD_EMPLOYEE":
      return { ...state, employees: [...state.employees, action.payload] };

    case "UPDATE_EMPLOYEE":
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case "DELETE_EMPLOYEE":
      return {
        ...state,
        employees: state.employees.filter((e) => e.id !== action.payload),
        sales: state.sales.filter((s) => s.employeeId !== action.payload),
      };

    // ── Sales ──
    case "SET_SALES":
      return { ...state, sales: action.payload };

    case "ADD_SALES_ENTRY":
      return { ...state, sales: [...state.sales, action.payload] };

    case "UPDATE_SALES_ENTRY":
      return {
        ...state,
        sales: state.sales.map((s) =>
          s.employeeId === action.payload.employeeId ? action.payload : s
        ),
      };

    case "DELETE_SALES_ENTRY":
      return {
        ...state,
        sales: state.sales.filter((s) => s.employeeId !== action.payload),
      };

    case "CLEAR_SALES":
      return { ...state, sales: [] };

    // ── Product Sales ──
    case "SET_PRODUCT_SALES":
      return { ...state, productSales: action.payload };

    // ── Locations ──
    case "ADD_LOCATION":
      return { ...state, locations: [...state.locations, action.payload] };

    case "UPDATE_LOCATION":
      return {
        ...state,
        locations: state.locations.map((l) =>
          l.id === action.payload.id ? action.payload : l
        ),
      };

    case "DELETE_LOCATION":
      return {
        ...state,
        locations: state.locations.filter((l) => l.id !== action.payload),
      };

    // ── Expenses ──
    case "ADD_EXPENSE":
      return { ...state, expenses: [...state.expenses, action.payload] };

    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };

    // ── Settings ──
    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    // ── Import ──
    case "IMPORT_SUPPLIERS":
      return { ...state, suppliers: action.payload };

    case "IMPORT_EMPLOYEES":
      return { ...state, employees: action.payload };

    // ── Reset ──
    case "RESET_ALL": {
      return {
        suppliers: defaultSuppliersData.suppliers as ISupplier[],
        employees: defaultEmployeesData.employees as IEmployee[],
        sales: defaultSalesData.sales as IMonthlySalesEntry[],
        productSales:
          defaultProductSalesData.productSales as IProductSaleEntry[],
        locations: [],
        expenses: [],
        settings: DEFAULT_SETTINGS,
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────

interface IAppContext {
  state: IAppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience helpers
  addSupplier: (name: string) => void;
  updateSupplier: (id: string, name: string) => void;
  deleteSupplier: (id: string) => void;
  addProduct: (supplierId: string, name: string, costPerUnit: number) => void;
  updateProduct: (supplierId: string, product: IProduct) => void;
  deleteProduct: (supplierId: string, productId: string) => void;
  addEmployee: (employee: Omit<IEmployee, "id">) => void;
  updateEmployee: (employee: IEmployee) => void;
  deleteEmployee: (id: string) => void;
  addSalesEntry: (entry: IMonthlySalesEntry) => void;
  updateSalesEntry: (entry: IMonthlySalesEntry) => void;
  deleteSalesEntry: (employeeId: string) => void;
  clearSales: () => void;
  setProductSales: (productSales: IProductSaleEntry[]) => void;
  addLocation: (name: string, monthlyRent: number) => void;
  updateLocation: (location: ILocation) => void;
  deleteLocation: (id: string) => void;
  addExpense: (name: string, amount: number) => void;
  updateExpense: (expense: IExpenseItem) => void;
  deleteExpense: (id: string) => void;
  updateSettings: (settings: Partial<IAppSettings>) => void;
  importSuppliers: (suppliers: ISupplier[]) => void;
  importEmployees: (employees: IEmployee[]) => void;
  resetAll: () => void;
}

const AppContext = createContext<IAppContext | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, buildInitialState);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.suppliers,
        JSON.stringify(state.suppliers)
      );
      localStorage.setItem(
        STORAGE_KEYS.employees,
        JSON.stringify(state.employees)
      );
      localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(state.sales));
      localStorage.setItem(
        STORAGE_KEYS.productSales,
        JSON.stringify(state.productSales)
      );
      localStorage.setItem(
        STORAGE_KEYS.locations,
        JSON.stringify(state.locations)
      );
      localStorage.setItem(
        STORAGE_KEYS.expenses,
        JSON.stringify(state.expenses)
      );
      localStorage.setItem(
        STORAGE_KEYS.settings,
        JSON.stringify(state.settings)
      );
    } catch {
      console.warn("Failed to persist state to localStorage");
    }
  }, [state]);

  // Dark mode sync
  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.settings.darkMode);
  }, [state.settings.darkMode]);

  const ctx: IAppContext = {
    state,
    dispatch,

    addSupplier: (name: string) => {
      dispatch({
        type: "ADD_SUPPLIER",
        payload: { id: crypto.randomUUID(), name, products: [] },
      });
    },

    updateSupplier: (id: string, name: string) => {
      dispatch({ type: "UPDATE_SUPPLIER", payload: { id, name } });
    },

    deleteSupplier: (id: string) => {
      dispatch({ type: "DELETE_SUPPLIER", payload: id });
    },

    addProduct: (supplierId: string, name: string, costPerUnit: number) => {
      dispatch({
        type: "ADD_PRODUCT",
        payload: {
          supplierId,
          product: { id: crypto.randomUUID(), name, costPerUnit },
        },
      });
    },

    updateProduct: (supplierId: string, product: IProduct) => {
      dispatch({ type: "UPDATE_PRODUCT", payload: { supplierId, product } });
    },

    deleteProduct: (supplierId: string, productId: string) => {
      dispatch({
        type: "DELETE_PRODUCT",
        payload: { supplierId, productId },
      });
    },

    addEmployee: (employee: Omit<IEmployee, "id">) => {
      dispatch({
        type: "ADD_EMPLOYEE",
        payload: { ...employee, id: crypto.randomUUID() },
      });
    },

    updateEmployee: (employee: IEmployee) => {
      dispatch({ type: "UPDATE_EMPLOYEE", payload: employee });
    },

    deleteEmployee: (id: string) => {
      dispatch({ type: "DELETE_EMPLOYEE", payload: id });
    },

    addSalesEntry: (entry: IMonthlySalesEntry) => {
      dispatch({ type: "ADD_SALES_ENTRY", payload: entry });
    },

    updateSalesEntry: (entry: IMonthlySalesEntry) => {
      dispatch({ type: "UPDATE_SALES_ENTRY", payload: entry });
    },

    deleteSalesEntry: (employeeId: string) => {
      dispatch({ type: "DELETE_SALES_ENTRY", payload: employeeId });
    },

    clearSales: () => {
      dispatch({ type: "CLEAR_SALES" });
    },

    setProductSales: (productSales: IProductSaleEntry[]) => {
      dispatch({ type: "SET_PRODUCT_SALES", payload: productSales });
    },

    addLocation: (name: string, monthlyRent: number) => {
      dispatch({
        type: "ADD_LOCATION",
        payload: { id: crypto.randomUUID(), name, monthlyRent },
      });
    },

    updateLocation: (location: ILocation) => {
      dispatch({ type: "UPDATE_LOCATION", payload: location });
    },

    deleteLocation: (id: string) => {
      dispatch({ type: "DELETE_LOCATION", payload: id });
    },

    addExpense: (name: string, amount: number) => {
      dispatch({
        type: "ADD_EXPENSE",
        payload: { id: crypto.randomUUID(), name, amount },
      });
    },

    updateExpense: (expense: IExpenseItem) => {
      dispatch({ type: "UPDATE_EXPENSE", payload: expense });
    },

    deleteExpense: (id: string) => {
      dispatch({ type: "DELETE_EXPENSE", payload: id });
    },

    updateSettings: (settings: Partial<IAppSettings>) => {
      dispatch({ type: "UPDATE_SETTINGS", payload: settings });
    },

    importSuppliers: (suppliers: ISupplier[]) => {
      dispatch({ type: "IMPORT_SUPPLIERS", payload: suppliers });
    },

    importEmployees: (employees: IEmployee[]) => {
      dispatch({ type: "IMPORT_EMPLOYEES", payload: employees });
    },

    resetAll: () => {
      dispatch({ type: "RESET_ALL" });
    },
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp(): IAppContext {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}

// Re-export types for convenience
export type { AppAction };
export { ECommissionType, ETieredMode };
export type { ICommissionTier };
