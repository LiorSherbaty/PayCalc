# PayCalc - Payment Calculator

A static React app that replaces Excel for small business payment calculations: supplier costs, employee commissions, and operating expenses.

## What It Does

- **Supplier Payments:** Calculate how much to pay each supplier based on business-wide product quantities sold (quantity x cost per unit), entered on a dedicated page
- **Employee Commissions:** Calculate commissions using flat rate, tiered flat, or tiered marginal (tax-bracket style) structures, calculated per-day for accurate tiered results
- **Locations & Expenses:** Track rent per location and named monthly expenses (insurance, utilities, etc.) for accurate profit calculation
- **Dashboard:** At-a-glance summary with charts showing revenue, costs, commissions, fixed costs, and profit
- **What-If Simulator:** Slide to test "what if sales were X%" and see instant impact on profit (fixed costs remain constant)
- **Import/Export:** Load supplier and employee configs from JSON, export results as CSV
- **Dark Mode:** Toggle between light and dark themes
- **Responsive:** Desktop-first with full mobile support (hamburger menu, responsive grids, scrollable tables)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + Vite 7 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Charts | Recharts |
| State | React Context + useReducer |
| Persistence | localStorage |
| Routing | React Router v7 |
| Typography | DM Sans + JetBrains Mono |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Summary cards, pie chart, bar chart, What-If simulator, supplier cost table |
| **Sales Entry** | Per-employee daily sales form with add/remove day rows and running totals |
| **Product Sales** | Business-wide product quantity entry grouped by supplier, with per-supplier cost totals |
| **Suppliers** | CRUD for suppliers and their products (name, cost per unit) |
| **Employees** | CRUD for employees with commission editor (flat/tiered/marginal) and live preview |
| **Expenses** | Manage location rent and named monthly operating expenses |
| **Settings** | Dark mode, currency symbol, JSON import (drag-and-drop), JSON/CSV export, reset |

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppShell (responsive), Sidebar (slide-out on mobile)
│   ├── dashboard/       # Summary cards, charts, What-If simulator
│   ├── sales/           # Employee daily sales entry form
│   ├── product-sales/   # Business-wide product quantity entry
│   ├── suppliers/       # Supplier/product CRUD
│   ├── employees/       # Employee/commission CRUD with live preview
│   ├── expenses/        # Locations & monthly expenses CRUD
│   ├── settings/        # Import, export, preferences
│   ├── shared/          # CurrencyDisplay, ConfirmDialog, PageHeader, NumericInput
│   └── ui/              # shadcn/ui primitives
├── context/
│   └── AppContext.tsx    # Global state (useReducer + localStorage auto-persist)
├── hooks/
│   └── useLocalStorage.ts
├── types/
│   └── index.ts         # All TypeScript interfaces and const-enum types
├── utils/
│   ├── calculations.ts  # Pure calculation functions (supplier payments, commissions)
│   ├── formatters.ts    # Currency/percentage formatting with NaN/Infinity guards
│   └── validators.ts    # JSON import schema validation
├── data/
│   ├── default-suppliers.json
│   ├── default-employees.json
│   ├── default-sales.json
│   └── default-product-sales.json
├── App.tsx
└── main.tsx
```

## Commission Types

Commissions are calculated **per day**, then summed for the monthly total. This ensures tiered thresholds are applied to each day's sales independently.

| Type | Behavior |
|------|----------|
| **Flat** | `daySales x flatRate` per day |
| **Tiered Flat** | Each day's entire amount uses the highest qualifying tier rate |
| **Tiered Marginal** | Tax-bracket style applied per day: each slice taxed at its own rate |

### Example: Employee sells $500 on Day 1, $800 on Day 2, tiers [0 -> 10%, 500 -> 15%]

- **Day 1 (Tiered Flat):** $500 at 10% = **$50**
- **Day 2 (Tiered Flat):** $800 at 15% = **$120**
- **Monthly Total:** **$170** (vs $195 if calculated on monthly aggregate of $1,300)

## Two Independent Data Flows

Employee sales and product sales are **separate, independent** data:

- **Employee Sales** (Sales Entry page): Daily dollar amounts per employee → used to calculate commissions
- **Product Sales** (Product Sales page): Business-wide product quantities → used to calculate supplier payments

These can't be linked because the business doesn't track which employee sold which product. Revenue comes from employee sales totals; supplier costs come from product quantities.

## Profit Calculation

```
Gross Profit = Revenue - Supplier Costs - Commissions - Location Rent - Monthly Expenses
```

Fixed costs (rent, expenses) remain constant regardless of sales volume, providing realistic profit projections in the What-If simulator.

## Responsive Design

- **Desktop (md+):** Fixed 256px sidebar, full content area
- **Mobile (<md):** Sidebar hidden by default, hamburger menu in sticky header, overlay drawer
- Tables use horizontal scroll on narrow screens
- Product quantity columns hidden on mobile where space is tight
- Grids adapt from 5-col (desktop) to 2-col (tablet) to 1-col (phone)
- Dialogs and forms are full-width on mobile

## Data Persistence

All data is stored in localStorage under these keys:
- `paycalc_suppliers` - Supplier and product configuration
- `paycalc_employees` - Employee and commission configuration
- `paycalc_sales` - Current month's employee daily sales entries
- `paycalc_product_sales` - Current month's business-wide product quantities
- `paycalc_locations` - Location names and monthly rent
- `paycalc_expenses` - Named monthly expense items
- `paycalc_settings` - App preferences (currency symbol, dark mode)

## JSON Import Format

### Suppliers
```json
{
  "suppliers": [
    {
      "id": "sup-1",
      "name": "Supplier Name",
      "products": [
        { "id": "prod-1", "name": "Product A", "costPerUnit": 5.00 }
      ]
    }
  ]
}
```

### Employees
```json
{
  "employees": [
    {
      "id": "emp-1",
      "name": "Employee Name",
      "commissionType": "flat",
      "flatRate": 0.30
    },
    {
      "id": "emp-2",
      "name": "Another Employee",
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

Import validates: required fields, data types, duplicate IDs, ascending tier thresholds.
