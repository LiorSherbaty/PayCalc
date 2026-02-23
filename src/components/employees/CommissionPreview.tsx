import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { formatRate } from "@/utils/formatters";
import { calculateCommission } from "@/utils/calculations";
import type { IEmployee } from "@/types";
import { ECommissionType } from "@/types";

interface ICommissionPreviewProps {
  employee: IEmployee;
}

export function CommissionPreview({ employee }: ICommissionPreviewProps) {
  const [previewSales, setPreviewSales] = useState("1000");

  const salesAmount = parseFloat(previewSales) || 0;
  const result = calculateCommission(employee, [salesAmount]);

  return (
    <div className="rounded-md border border-dashed border-border bg-muted/50 p-3 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Label className="whitespace-nowrap text-xs">Preview: if sales =</Label>
        <Input
          type="number"
          min="0"
          step="100"
          value={previewSales}
          onChange={(e) => setPreviewSales(e.target.value)}
          className="w-24 sm:w-32 h-8 text-sm"
        />
        <span className="text-sm">
          earns{" "}
          <CurrencyDisplay
            amount={result.commissionAmount}
            className="font-semibold"
            colorCode
          />
        </span>
      </div>

      {result.breakdown.length > 0 && employee.commissionType === ECommissionType.TIERED && (
        <div className="space-y-1">
          {result.breakdown.map((tier, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 text-center">{i > 0 ? "+" : ""}</span>
              <span>
                <CurrencyDisplay amount={tier.rangeEnd - tier.rangeStart} /> at{" "}
                {formatRate(tier.rate)} ={" "}
                <CurrencyDisplay amount={tier.amount} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
