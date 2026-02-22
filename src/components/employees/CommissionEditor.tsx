import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ECommissionType, ETieredMode } from "@/types";
import type { IEmployee, ICommissionTier } from "@/types";

const DEFAULT_TIER_INCREMENT = 1000;
const DEFAULT_TIER_RATE = 0.1;

interface ICommissionEditorProps {
  employee: IEmployee;
  onChange: (updated: IEmployee) => void;
}

export function CommissionEditor({
  employee,
  onChange,
}: ICommissionEditorProps) {
  function setCommissionType(type: string) {
    if (type === ECommissionType.FLAT) {
      onChange({
        ...employee,
        commissionType: ECommissionType.FLAT,
        flatRate: employee.flatRate ?? DEFAULT_TIER_RATE,
        tieredMode: undefined,
        tiers: undefined,
      });
    } else {
      onChange({
        ...employee,
        commissionType: ECommissionType.TIERED,
        tieredMode: employee.tieredMode ?? ETieredMode.MARGINAL,
        tiers: employee.tiers ?? [{ threshold: 0, rate: DEFAULT_TIER_RATE }],
        flatRate: undefined,
      });
    }
  }

  function setTieredMode(mode: string) {
    if (mode !== ETieredMode.FLAT && mode !== ETieredMode.MARGINAL) return;
    onChange({ ...employee, tieredMode: mode });
  }

  function setFlatRate(value: string) {
    const rate = parseFloat(value);
    if (!Number.isFinite(rate)) return;
    onChange({ ...employee, flatRate: Math.max(0, Math.min(rate, 100)) / 100 });
  }

  function updateTier(
    index: number,
    field: keyof ICommissionTier,
    value: string
  ) {
    const tiers = [...(employee.tiers ?? [])];
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return;

    tiers[index] = {
      ...tiers[index],
      [field]:
        field === "rate"
          ? Math.max(0, Math.min(num, 100)) / 100
          : Math.max(0, num),
    };
    onChange({ ...employee, tiers });
  }

  function addTier() {
    const tiers = [...(employee.tiers ?? [])];
    const lastThreshold =
      tiers.length > 0 ? tiers[tiers.length - 1].threshold : 0;
    tiers.push({
      threshold: lastThreshold + DEFAULT_TIER_INCREMENT,
      rate: DEFAULT_TIER_RATE,
    });
    onChange({ ...employee, tiers });
  }

  function removeTier(index: number) {
    const tiers = (employee.tiers ?? []).filter((_, i) => i !== index);
    onChange({ ...employee, tiers });
  }

  return (
    <div className="space-y-4">
      {/* Commission Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Commission Type</Label>
          <Select
            value={employee.commissionType}
            onValueChange={setCommissionType}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ECommissionType.FLAT}>Flat Rate</SelectItem>
              <SelectItem value={ECommissionType.TIERED}>Tiered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {employee.commissionType === ECommissionType.TIERED && (
          <div className="space-y-2">
            <Label>Tiered Mode</Label>
            <Select
              value={employee.tieredMode ?? ETieredMode.MARGINAL}
              onValueChange={setTieredMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ETieredMode.FLAT}>
                  Flat (entire amount at highest tier)
                </SelectItem>
                <SelectItem value={ETieredMode.MARGINAL}>
                  Marginal (tax-bracket style)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Flat Rate Input */}
      {employee.commissionType === ECommissionType.FLAT && (
        <div className="space-y-2">
          <Label>Commission Rate (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={((employee.flatRate ?? 0) * 100).toFixed(1)}
            onChange={(e) => setFlatRate(e.target.value)}
            className="w-full sm:w-32"
          />
        </div>
      )}

      {/* Tier Editor */}
      {employee.commissionType === ECommissionType.TIERED && (
        <div className="space-y-3">
          <Label>Commission Tiers</Label>
          <div className="space-y-2">
            {(employee.tiers ?? []).map((tier, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border px-3 py-2"
              >
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  From $
                </span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={tier.threshold}
                  onChange={(e) =>
                    updateTier(index, "threshold", e.target.value)
                  }
                  className="w-full sm:w-28"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  at
                </span>
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={(tier.rate * 100).toFixed(1)}
                    onChange={(e) =>
                      updateTier(index, "rate", e.target.value)
                    }
                    className="w-full sm:w-24"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                  {(employee.tiers?.length ?? 0) > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => removeTier(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addTier}>
            <Plus className="mr-2 h-3 w-3" />
            Add Tier
          </Button>
        </div>
      )}
    </div>
  );
}
