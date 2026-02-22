# PayCalc — Technical Implementation Plan

> A static React app that replaces Excel for small business payment calculations: supplier costs & employee commissions.

---

## 1. Project Overview

**What it is:** A single-user, no-backend React app that calculates how much to pay suppliers (based on product quantities × cost) and employees (based on commission structures). Data loads from JSON, persists in localStorage, and can be exported.

**What it is NOT:** An accounting system, invoicing tool, or payroll system. Think of it as a smart calculator with a dashboard.

---

## 2. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 18 + Vite | Fast dev, zero-config, static build |
| Language | TypeScript | Type safety for financial calculations |
| Styling | Tailwind CSS | Rapid UI, consistent design |
| UI Components | shadcn/ui | Professional look, accessible, lightweight |
| Charts | Recharts | React-native charting, simple API |
| State | React Context + useReducer | No Redux overhead for single-user app |
| Persistence | localStorage | Survives refresh, no backend needed |
| Export | json/csv via `file-saver` | Easy download of results |
| JSON Import | Native FileReader API | Drag-and-drop or file picker |

---

## 3. Data Architecture

### 3.1 JSON Schema — Products & Suppliers

This is the default JSON loaded on site startup (and the format for user imports).

```json
{
  "suppliers": [
    {
      "id": "supplier-1",
      "name": "Acme Parts Ltd.",
      "products": [
        {
          "id": "prod-a",
          "name": "Product A",
          "costPerUnit": 5.00
        },
        {
          "id": "prod-b",
          "name": "Product B",
          "costPerUnit": 12.50
        }
      ]
    }
  ]
}
```

### 3.2 JSON Schema — Employees & Commission Plans

```json
{
  "employees": [
    {
      "id": "emp-1",
      "name": "John Doe",
      "commissionType": "flat",
      "flatRate": 0.30
    },
    {
      "id": "emp-2",
      "name": "Jane Smith",
      "commissionType": "tiered",
      "tieredMode": "marginal",
      "tiers": [
        { "threshold": 0, "rate": 0.10 },
        { "threshold": 500, "rate": 0.15 },
        { "threshold": 5000, "rate": 0.20 }
      ]
    }
  ]
}
```

**Commission types explained:**

| Type | `commissionType` | `tieredMode` | Behavior |
|------|-------------------|--------------|----------|
| Flat | `"flat"` | N/A | Employee gets `flatRate` × total sales |
| Tiered — Flat | `"tiered"` | `"flat"` | Once a threshold is crossed, the **entire** amount uses that rate |
| Tiered — Marginal | `"tiered"` | `"marginal"` | Like tax brackets: each slice taxed at its own rate |

**Example — $6,000 in sales with tiers [0→10%, 500→15%, 5000→20%]:**

- **Flat mode:** 20% × $6,000 = **$1,200** (hit the $5,000 bracket, entire amount at 20%)
- **Marginal mode:** (500 × 10%) + (4,500 × 15%) + (1,000 × 20%) = 50 + 675 + 200 = **$925**

### 3.3 Monthly Sales Data (User Input — Not in JSON)

Entered manually each month via the UI:

```typescript
interface MonthlySalesEntry {
  employeeId: string;
  totalSalesDollars: number;       // for commission calculation
  productSales: {                   // for supplier payment calculation
    productId: string;
    quantitySold: number;
  }[];
}
```

### 3.4 localStorage Structure

```
paycalc_suppliers   → JSON string of suppliers/products config
paycalc_employees   → JSON string of employees/commission config
paycalc_sales       → JSON string of current month's sales entries
paycalc_settings    → JSON string of app settings (currency symbol, etc.)
```

---

## 4. Core Calculation Engine

All financial logic lives in a pure utility module (`src/utils/calculations.ts`) — no side effects, easy to unit test.

### 4.1 Supplier Payment Calculator

```typescript
function calculateSupplierPayment(
  supplier: Supplier,
  productSales: ProductSaleEntry[]
): SupplierPaymentResult {
  // For each product belonging to this supplier:
  //   payment = quantitySold × costPerUnit
  // Return total + breakdown per product
}
```

### 4.2 Employee Commission Calculator

```typescript
function calculateCommission(
  employee: Employee,
  totalSales: number
): CommissionResult {
  if (employee.commissionType === 'flat') {
    return { amount: totalSales * employee.flatRate, breakdown: [...] };
  }

  if (employee.tieredMode === 'flat') {
    // Find highest threshold crossed, apply that rate to entire amount
  }

  if (employee.tieredMode === 'marginal') {
    // Walk through tiers, apply each rate to its slice
  }
}
```

### 4.3 Summary Aggregator

```typescript
function calculateMonthlySummary(
  suppliers: Supplier[],
  employees: Employee[],
  sales: MonthlySalesEntry[]
): MonthlySummary {
  return {
    totalRevenue,            // sum of all employee sales
    totalSupplierCost,       // sum of all supplier payments
    totalCommissions,        // sum of all employee commissions
    grossProfit,             // revenue - supplierCost - commissions
    perSupplierBreakdown,
    perEmployeeBreakdown,
  };
}
```

---

## 5. Application Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx            # Main layout with sidebar nav
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx       # Summary cards + charts
│   │   ├── SummaryCards.tsx         # Revenue, costs, profit cards
│   │   ├── PaymentPieChart.tsx     # Where the money goes
│   │   └── EmployeeBarChart.tsx    # Commission comparison
│   ├── suppliers/
│   │   ├── SuppliersPage.tsx       # Supplier list + payment results
│   │   ├── SupplierCard.tsx
│   │   └── ProductTable.tsx
│   ├── employees/
│   │   ├── EmployeesPage.tsx       # Employee list + commission results
│   │   ├── EmployeeCard.tsx
│   │   ├── CommissionConfig.tsx    # Flat/tiered/marginal toggle + tier editor
│   │   └── CommissionBreakdown.tsx # Visual breakdown of calculation
│   ├── sales/
│   │   ├── SalesEntryPage.tsx      # Monthly data input form
│   │   ├── EmployeeSalesForm.tsx   # Per-employee sales input
│   │   └── ProductSalesForm.tsx    # Per-product quantity input
│   ├── settings/
│   │   ├── SettingsPage.tsx
│   │   ├── JsonImportExport.tsx    # Load/save JSON configs
│   │   └── DataReset.tsx
│   └── shared/
│       ├── CurrencyDisplay.tsx
│       ├── PercentageInput.tsx
│       └── ConfirmDialog.tsx
├── context/
│   └── AppContext.tsx              # Global state via useReducer
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useCalculations.ts
│   └── useJsonImport.ts
├── utils/
│   ├── calculations.ts            # Pure calculation functions
│   ├── validators.ts              # JSON schema validation
│   └── formatters.ts              # Currency, percentage formatting
├── types/
│   └── index.ts                   # All TypeScript interfaces
├── data/
│   ├── default-suppliers.json     # Ships with the app
│   └── default-employees.json     # Ships with the app
├── App.tsx
└── main.tsx
```

---

## 6. Page-by-Page Breakdown

### 6.1 Dashboard (Home)

**Purpose:** At-a-glance snapshot of the current month.

**Elements:**
- **Summary Cards:** Total Revenue, Total Supplier Costs, Total Commissions, Gross Profit (color-coded: green if positive, red if negative)
- **Pie Chart:** Payment distribution — how much goes to suppliers vs employees vs profit
- **Bar Chart:** Per-employee commission comparison
- **Table:** Per-supplier cost breakdown
- **Alert Banner:** Shows if no sales data has been entered yet

### 6.2 Sales Entry

**Purpose:** The main input page. User enters this month's numbers.

**UX Flow:**
1. Select an employee from a dropdown
2. Enter their total sales in dollars (for commission)
3. For each product, enter quantity sold (for supplier payment)
4. Click "Add" → entry appears in a table below
5. Repeat for each employee
6. "Calculate All" button triggers calculations and updates dashboard

**Key UX Details:**
- Auto-complete product names
- Running total shown as user enters data
- "Clear Month" button with confirmation dialog
- Inline validation (no negative numbers, no empty fields)

### 6.3 Suppliers Management

**Purpose:** View/edit supplier and product configurations.

**Elements:**
- List of suppliers as expandable cards
- Each card shows products with cost per unit
- Add/edit/delete suppliers and products
- Payment results shown inline after calculation
- Per-product breakdown: quantity × cost = total

### 6.4 Employees Management

**Purpose:** View/edit employee commission structures.

**Elements:**
- List of employees as cards
- Each card shows commission type and rates
- **Commission editor:**
  - Toggle: Flat vs Tiered
  - If Tiered: toggle Flat-rate vs Marginal (tax-style)
  - Tier editor: add/remove thresholds with rates
  - Live preview: "If this employee sells $X, they earn $Y"
- Commission results shown inline after calculation

### 6.5 Settings

**Purpose:** Import/export configs, app preferences.

**Elements:**
- Import JSON (file picker + drag-and-drop zone)
- Export current config as JSON
- Export results as CSV
- Currency symbol selector (default $)
- "Reset to defaults" button with confirmation
- Dark/light mode toggle

---

## 7. Additional Features (Small Business Owner QoL)

These are extras beyond the core requirements — low effort, high value.

| Feature | Description | Priority |
|---------|-------------|----------|
| **What-If Simulator** | Slider to test "what if sales were X?" — instantly see commission and profit impact | High |
| **Profit Margin Display** | Show profit margin % alongside gross profit | High |
| **Export to CSV** | Download supplier payments and employee commissions as CSV for bookkeeping | High |
| **Print View** | Clean, printer-friendly payment summary (CSS `@media print`) | Medium |
| **Commission Comparison** | Side-by-side: show what an employee would earn under flat vs tiered vs marginal | Medium |
| **Per-Product Commission** | Future-ready: optional per-product commission rates per employee | Low (scaffolded) |
| **Quick Totals Bar** | Sticky footer showing running totals as you navigate pages | Medium |
| **Data Validation on Import** | Validate JSON schema on import, show clear error messages for malformed files | High |
| **Undo/Redo for Sales Entry** | Simple state history for the sales entry form | Low |
| **Multi-Currency Display** | Show amounts in a second currency using a fixed exchange rate | Low |

---

## 8. UI/UX Guidelines

**Design Principles:**
- **Excel familiarity:** Tables, grids, and inline editing feel natural to the target user
- **Calculate, don't navigate:** Minimize page switches. Ideally: enter data → see results on the same page
- **No jargon:** Labels say "How much to pay" not "Accounts Payable Reconciliation"
- **Color coding:** Green = income/profit, Red = expense/payment, Blue = neutral/info
- **Mobile-friendly but desktop-first:** This is primarily a laptop tool

**Layout:**
- Fixed sidebar navigation (Dashboard, Sales Entry, Suppliers, Employees, Settings)
- Main content area with max-width for readability
- Sticky header with current month indicator
- Toast notifications for save/export actions

---

## 9. JSON Import/Export Flow

### Loading Priority
```
1. Check localStorage for saved data
2. If empty → load default JSON files from /src/data/
3. User can import custom JSON at any time (overwrites localStorage)
```

### Import Validation
```typescript
function validateImportedJson(data: unknown): ValidationResult {
  // Check required fields exist
  // Check data types (numbers are numbers, etc.)
  // Check no duplicate IDs
  // Check tier thresholds are ascending
  // Return { valid: boolean, errors: string[] }
}
```

### Export Options
- **Config Export:** Suppliers + Employees JSON (for reloading next month)
- **Results Export:** CSV with columns: Name, Type, Amount, Breakdown
- **Full Export:** Everything in one JSON blob

---

## 10. Implementation Phases

### Phase 1 — Foundation (Day 1-2)
- [ ] Project setup: Vite + React + TypeScript + Tailwind + shadcn/ui
- [ ] TypeScript interfaces and types
- [ ] Calculation engine with unit tests
- [ ] AppContext with useReducer
- [ ] localStorage hook
- [ ] Default JSON data files

### Phase 2 — Core Pages (Day 3-5)
- [ ] App shell layout with sidebar navigation
- [ ] Suppliers page: list, add, edit, delete
- [ ] Employees page: list, commission editor (flat/tiered/marginal)
- [ ] Sales Entry page: form with per-employee and per-product input

### Phase 3 — Calculations & Results (Day 6-7)
- [ ] Wire calculations to UI
- [ ] Supplier payment results display
- [ ] Employee commission results with breakdown visualization
- [ ] Summary aggregation

### Phase 4 — Dashboard & Polish (Day 8-9)
- [ ] Dashboard with summary cards
- [ ] Pie chart (payment distribution)
- [ ] Bar chart (employee commissions)
- [ ] Supplier cost breakdown table

### Phase 5 — Import/Export & Extras (Day 10)
- [ ] JSON import with validation + drag-and-drop
- [ ] JSON config export
- [ ] CSV results export
- [ ] Print-friendly CSS
- [ ] What-If simulator
- [ ] Final testing and edge cases

---

## 11. Key Edge Cases to Handle

| Scenario | Expected Behavior |
|----------|-------------------|
| Employee has $0 in sales | Show $0 commission, no errors |
| Product has 0 quantity sold | Skip from supplier total, still show in list |
| Tiered employee with sales below first threshold | Apply first tier rate |
| Import JSON with missing fields | Show specific error: "Product X missing costPerUnit" |
| localStorage is full/disabled | Graceful fallback, warn user, still function in-memory |
| Very large numbers (>$1M) | Format with commas, no overflow in UI |
| Decimal precision in commissions | Round to 2 decimal places, use `toFixed(2)` at display layer only |
| Duplicate supplier/employee IDs in import | Reject import, show error |
| Tiers with equal thresholds | Reject in validation |

---

## 12. Sample Default Data

### default-suppliers.json
```json
{
  "suppliers": [
    {
      "id": "sup-1",
      "name": "Alpha Supplies",
      "products": [
        { "id": "prod-1", "name": "Widget A", "costPerUnit": 5.00 },
        { "id": "prod-2", "name": "Widget B", "costPerUnit": 8.50 }
      ]
    },
    {
      "id": "sup-2",
      "name": "Beta Materials",
      "products": [
        { "id": "prod-3", "name": "Component X", "costPerUnit": 15.00 },
        { "id": "prod-4", "name": "Component Y", "costPerUnit": 3.25 }
      ]
    }
  ]
}
```

### default-employees.json
```json
{
  "employees": [
    {
      "id": "emp-1",
      "name": "Alice Cohen",
      "commissionType": "flat",
      "flatRate": 0.30
    },
    {
      "id": "emp-2",
      "name": "Bob Levy",
      "commissionType": "tiered",
      "tieredMode": "marginal",
      "tiers": [
        { "threshold": 0, "rate": 0.10 },
        { "threshold": 500, "rate": 0.15 },
        { "threshold": 5000, "rate": 0.20 }
      ]
    },
    {
      "id": "emp-3",
      "name": "Carol Dahan",
      "commissionType": "tiered",
      "tieredMode": "flat",
      "tiers": [
        { "threshold": 0, "rate": 0.10 },
        { "threshold": 1000, "rate": 0.15 },
        { "threshold": 10000, "rate": 0.20 }
      ]
    }
  ]
}
```

---

## 13. Non-Goals (Explicitly Out of Scope)

- No user authentication or multi-user support
- No server, database, or API calls
- No invoice generation or PDF receipts
- No tax calculation (beyond commission tiers)
- No payroll integration
- No historical month-over-month tracking (snapshot only)
- No real-time currency conversion

---

*This plan is designed to be implemented in ~10 focused development days by a single developer. Each phase builds on the previous one, and the app is usable after Phase 3.*
