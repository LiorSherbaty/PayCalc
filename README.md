# PayCalc - Payment Calculator

A static React app that replaces Excel for small business payment calculations: supplier costs and employee commissions.

## What It Does

- **Supplier Payments:** Calculate how much to pay each supplier based on products sold (quantity x cost per unit)
- **Employee Commissions:** Calculate commissions using flat rate, tiered flat, or tiered marginal (tax-bracket style) structures
- **Dashboard:** At-a-glance summary with charts showing revenue, costs, commissions, and profit
- **What-If Simulator:** Slide to test "what if sales were X%" and see instant impact on profit
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
| **Sales Entry** | Per-employee monthly sales form with product quantities and running totals |
| **Suppliers** | CRUD for suppliers and their products (name, cost per unit) |
| **Employees** | CRUD for employees with commission editor (flat/tiered/marginal) and live preview |
| **Settings** | Dark mode, currency symbol, JSON import (drag-and-drop), JSON/CSV export, reset |

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppShell (responsive), Sidebar (slide-out on mobile)
│   ├── dashboard/       # Summary cards, charts, What-If simulator
│   ├── sales/           # Monthly sales entry form
│   ├── suppliers/       # Supplier/product CRUD
│   ├── employees/       # Employee/commission CRUD with live preview
│   ├── settings/        # Import, export, preferences
│   ├── shared/          # CurrencyDisplay, ConfirmDialog, PageHeader
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
│   └── default-employees.json
├── App.tsx
└── main.tsx
```

## Commission Types

| Type | Behavior |
|------|----------|
| **Flat** | `totalSales x flatRate` |
| **Tiered Flat** | Entire amount uses the highest qualifying tier rate |
| **Tiered Marginal** | Tax-bracket style: each slice taxed at its own rate |

### Example: $6,000 sales with tiers [0 -> 10%, 500 -> 15%, 5000 -> 20%]

- **Flat mode:** 20% x $6,000 = **$1,200**
- **Marginal mode:** (500 x 10%) + (4,500 x 15%) + (1,000 x 20%) = **$925**

## Responsive Design

- **Desktop (md+):** Fixed 256px sidebar, full content area
- **Mobile (<md):** Sidebar hidden by default, hamburger menu in sticky header, overlay drawer
- Tables use horizontal scroll on narrow screens
- Product quantity columns hidden on mobile where space is tight
- Grids adapt from 4-col (desktop) to 2-col (tablet) to 1-col (phone)
- Dialogs and forms are full-width on mobile

## Data Persistence

All data is stored in localStorage under these keys:
- `paycalc_suppliers` - Supplier and product configuration
- `paycalc_employees` - Employee and commission configuration
- `paycalc_sales` - Current month's sales entries
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
