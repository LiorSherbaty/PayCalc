import type {
  ISupplier,
  IEmployee,
  ILocation,
  IExpenseItem,
  IProductSaleEntry,
  IMonthlySalesEntry,
  ISupplierPaymentResult,
  IProductPaymentLine,
  ICommissionResult,
  ICommissionTierBreakdown,
  IMonthlySummary,
} from "@/types";
import { ECommissionType, ETieredMode } from "@/types";

// ─── Supplier Payment ────────────────────────────────────

export function calculateSupplierPayment(
  supplier: ISupplier,
  productSales: IProductSaleEntry[]
): ISupplierPaymentResult {
  const salesMap = new Map(
    productSales.map((ps) => [ps.productId, ps.quantitySold])
  );

  const lines: IProductPaymentLine[] = (supplier.products ?? []).map((product) => {
    const qty = salesMap.get(product.id) ?? 0;
    return {
      productId: product.id,
      productName: product.name,
      quantitySold: qty,
      costPerUnit: product.costPerUnit,
      lineTotal: qty * product.costPerUnit,
    };
  });

  return {
    supplierId: supplier.id,
    supplierName: supplier.name,
    lines,
    total: lines.reduce((sum, l) => sum + l.lineTotal, 0),
  };
}

// ─── Commission Calculation ──────────────────────────────

function calculateFlatCommission(
  totalSales: number,
  flatRate: number
): { amount: number; breakdown: ICommissionTierBreakdown[] } {
  return {
    amount: totalSales * flatRate,
    breakdown: [
      {
        rangeStart: 0,
        rangeEnd: totalSales,
        rate: flatRate,
        amount: totalSales * flatRate,
      },
    ],
  };
}

function calculateTieredFlatCommission(
  totalSales: number,
  tiers: { threshold: number; rate: number }[]
): { amount: number; breakdown: ICommissionTierBreakdown[] } {
  if (tiers.length === 0) {
    return { amount: 0, breakdown: [] };
  }

  const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);

  // Find the highest tier the sales amount qualifies for
  let applicableRate = sorted[0].rate;
  for (const tier of sorted) {
    if (totalSales >= tier.threshold) {
      applicableRate = tier.rate;
    }
  }

  return {
    amount: totalSales * applicableRate,
    breakdown: [
      {
        rangeStart: 0,
        rangeEnd: totalSales,
        rate: applicableRate,
        amount: totalSales * applicableRate,
      },
    ],
  };
}

function calculateTieredMarginalCommission(
  totalSales: number,
  tiers: { threshold: number; rate: number }[]
): { amount: number; breakdown: ICommissionTierBreakdown[] } {
  if (tiers.length === 0) {
    return { amount: 0, breakdown: [] };
  }

  const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);
  const breakdown: ICommissionTierBreakdown[] = [];
  let totalCommission = 0;

  for (let i = 0; i < sorted.length; i++) {
    const rangeStart = sorted[i].threshold;
    const rangeEnd =
      i + 1 < sorted.length
        ? Math.min(totalSales, sorted[i + 1].threshold)
        : totalSales;

    if (totalSales <= rangeStart) break;

    const taxableAmount = rangeEnd - rangeStart;
    const amount = taxableAmount * sorted[i].rate;

    breakdown.push({
      rangeStart,
      rangeEnd,
      rate: sorted[i].rate,
      amount,
    });

    totalCommission += amount;
  }

  return { amount: totalCommission, breakdown };
}

function calculateDayCommission(
  employee: IEmployee,
  daySales: number
): { amount: number; breakdown: ICommissionTierBreakdown[] } {
  if (employee.commissionType === ECommissionType.FLAT) {
    return calculateFlatCommission(daySales, employee.flatRate ?? 0);
  } else if (employee.tieredMode === ETieredMode.FLAT) {
    return calculateTieredFlatCommission(daySales, employee.tiers ?? []);
  } else {
    return calculateTieredMarginalCommission(daySales, employee.tiers ?? []);
  }
}

export function calculateCommission(
  employee: IEmployee,
  dailySales: number[]
): ICommissionResult {
  const totalSales = dailySales.reduce((sum, d) => sum + d, 0);
  let totalCommission = 0;
  const aggregatedBreakdown: ICommissionTierBreakdown[] = [];

  for (const daySale of dailySales) {
    if (daySale <= 0) continue;
    const dayResult = calculateDayCommission(employee, daySale);
    totalCommission += dayResult.amount;

    for (const tier of dayResult.breakdown) {
      const existing = aggregatedBreakdown.find(
        (b) => b.rate === tier.rate
      );
      if (existing) {
        existing.rangeEnd += tier.rangeEnd - tier.rangeStart;
        existing.amount += tier.amount;
      } else {
        aggregatedBreakdown.push({ ...tier });
      }
    }
  }

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    totalSales,
    commissionAmount: totalCommission,
    commissionType: employee.commissionType,
    tieredMode: employee.tieredMode,
    breakdown: aggregatedBreakdown,
  };
}

// ─── Monthly Summary ─────────────────────────────────────

export function calculateMonthlySummary(
  suppliers: ISupplier[],
  employees: IEmployee[],
  sales: IMonthlySalesEntry[],
  productSales: IProductSaleEntry[] = [],
  locations: ILocation[] = [],
  expenses: IExpenseItem[] = []
): IMonthlySummary {
  // Supplier breakdown (from business-wide product sales)
  const supplierBreakdown = suppliers.map((supplier) =>
    calculateSupplierPayment(supplier, productSales)
  );

  // Employee breakdown
  const employeeBreakdown = employees.map((employee) => {
    const salesEntry = sales.find((s) => s.employeeId === employee.id);
    return calculateCommission(employee, salesEntry?.dailySales ?? []);
  });

  const totalRevenue = employeeBreakdown.reduce(
    (sum, e) => sum + e.totalSales,
    0
  );
  const totalSupplierCost = supplierBreakdown.reduce(
    (sum, s) => sum + s.total,
    0
  );
  const totalCommissions = employeeBreakdown.reduce(
    (sum, e) => sum + e.commissionAmount,
    0
  );
  const totalLocationCosts = locations.reduce(
    (sum, l) => sum + l.monthlyRent,
    0
  );
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const grossProfit =
    totalRevenue -
    totalSupplierCost -
    totalCommissions -
    totalLocationCosts -
    totalExpenses;
  const profitMarginPercent =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalSupplierCost,
    totalCommissions,
    totalLocationCosts,
    totalExpenses,
    grossProfit,
    profitMarginPercent,
    supplierBreakdown,
    employeeBreakdown,
  };
}
