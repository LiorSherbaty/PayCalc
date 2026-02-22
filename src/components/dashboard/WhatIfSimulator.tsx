import { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { useApp } from "@/context/AppContext";
import { calculateMonthlySummary } from "@/utils/calculations";
import { formatPercent } from "@/utils/formatters";
import type { IMonthlySalesEntry } from "@/types";

export function WhatIfSimulator() {
  const { state } = useApp();
  const [multiplier, setMultiplier] = useState(100);

  const adjustedSales: IMonthlySalesEntry[] = useMemo(
    () =>
      state.sales.map((entry) => ({
        ...entry,
        totalSalesDollars: entry.totalSalesDollars * (multiplier / 100),
        productSales: entry.productSales.map((ps) => ({
          ...ps,
          quantitySold: Math.round(ps.quantitySold * (multiplier / 100)),
        })),
      })),
    [state.sales, multiplier]
  );

  const baseSummary = useMemo(
    () =>
      calculateMonthlySummary(state.suppliers, state.employees, state.sales),
    [state.suppliers, state.employees, state.sales]
  );

  const whatIfSummary = useMemo(
    () =>
      calculateMonthlySummary(
        state.suppliers,
        state.employees,
        adjustedSales
      ),
    [state.suppliers, state.employees, adjustedSales]
  );

  const profitDelta = whatIfSummary.grossProfit - baseSummary.grossProfit;

  if (state.sales.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4" />
          What-If Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>
            Adjust sales volume: {multiplier}%
            {multiplier !== 100 && (
              <button
                className="ml-2 text-xs text-primary underline"
                onClick={() => setMultiplier(100)}
              >
                Reset
              </button>
            )}
          </Label>
          <Slider
            value={[multiplier]}
            onValueChange={([val]) => setMultiplier(val)}
            min={0}
            max={300}
            step={5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
            <span>200%</span>
            <span>300%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 rounded-md bg-muted p-3 sm:p-4">
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-sm font-semibold">
              <CurrencyDisplay amount={whatIfSummary.totalRevenue} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Supplier Costs</p>
            <p className="text-sm font-semibold">
              <CurrencyDisplay amount={whatIfSummary.totalSupplierCost} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Commissions</p>
            <p className="text-sm font-semibold">
              <CurrencyDisplay amount={whatIfSummary.totalCommissions} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gross Profit</p>
            <p className="text-sm font-semibold">
              <CurrencyDisplay
                amount={whatIfSummary.grossProfit}
                colorCode
              />
            </p>
            <p className="text-xs text-muted-foreground">
              Margin: {formatPercent(whatIfSummary.profitMarginPercent)}
            </p>
          </div>
        </div>

        {multiplier !== 100 && (
          <p className="text-xs text-muted-foreground text-center">
            Profit change:{" "}
            <CurrencyDisplay
              amount={profitDelta}
              colorCode
              className="font-medium"
            />{" "}
            vs current
          </p>
        )}
      </CardContent>
    </Card>
  );
}
