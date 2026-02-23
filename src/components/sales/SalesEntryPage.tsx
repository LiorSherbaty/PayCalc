import { useState, useMemo } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useApp } from "@/context/AppContext";
import { calculateMonthlySummary } from "@/utils/calculations";
import { ECommissionType } from "@/types";
import type { IMonthlySalesEntry } from "@/types";

export function SalesEntryPage() {
  const {
    state,
    addSalesEntry,
    updateSalesEntry,
    deleteSalesEntry,
    clearSales,
  } = useApp();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [dailySalesInputs, setDailySalesInputs] = useState<string[]>([""]);
  const [dailyHoursInputs, setDailyHoursInputs] = useState<string[]>([""]);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const selectedEmployee = state.employees.find(
    (e) => e.id === selectedEmployeeId
  );
  const isSelectedHourly =
    selectedEmployee?.commissionType === ECommissionType.HOURLY;

  const availableEmployees = state.employees.filter(
    (emp) => !state.sales.some((s) => s.employeeId === emp.id)
  );

  const summary = useMemo(
    () =>
      calculateMonthlySummary(
        state.suppliers,
        state.employees,
        state.sales,
        state.productSales,
        state.locations,
        state.expenses
      ),
    [state.suppliers, state.employees, state.sales, state.productSales, state.locations, state.expenses]
  );

  const dailyTotal = dailySalesInputs.reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  function handleAddDay() {
    setDailySalesInputs((prev) => [...prev, ""]);
    setDailyHoursInputs((prev) => [...prev, ""]);
  }

  function handleRemoveDay(index: number) {
    setDailySalesInputs((prev) => prev.filter((_, i) => i !== index));
    setDailyHoursInputs((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDaySalesChange(index: number, value: string) {
    setDailySalesInputs((prev) =>
      prev.map((v, i) => (i === index ? value : v))
    );
  }

  function handleDayHoursChange(index: number, value: string) {
    setDailyHoursInputs((prev) =>
      prev.map((v, i) => (i === index ? value : v))
    );
  }

  function handleAddEntry() {
    if (!selectedEmployeeId) return;

    const dailySales = dailySalesInputs.map((val) => parseFloat(val) || 0);
    const dailyHours = isSelectedHourly
      ? dailyHoursInputs.map((val) => parseFloat(val) || 0)
      : undefined;

    const hasData = isSelectedHourly
      ? dailyHours!.some((h) => h > 0) || dailySales.some((s) => s > 0)
      : dailySales.some((s) => s > 0);

    if (!hasData) return;

    const entry: IMonthlySalesEntry = {
      employeeId: selectedEmployeeId,
      dailySales,
      dailyHours,
    };

    const existing = state.sales.find(
      (s) => s.employeeId === selectedEmployeeId
    );
    if (existing) {
      updateSalesEntry(entry);
    } else {
      addSalesEntry(entry);
    }

    setSelectedEmployeeId("");
    setDailySalesInputs([""]);
    setDailyHoursInputs([""]);
  }

  function handleEditEntry(entry: IMonthlySalesEntry) {
    setSelectedEmployeeId(entry.employeeId);
    setDailySalesInputs(entry.dailySales.map(String));
    setDailyHoursInputs(
      entry.dailyHours?.map(String) ??
        entry.dailySales.map(() => "")
    );
    deleteSalesEntry(entry.employeeId);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Entry"
        description="Enter this month's daily sales data for each employee"
        action={
          state.sales.length > 0 ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowClearDialog(true)}
            >
              Clear All
            </Button>
          ) : undefined
        }
      />

      {/* Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Sales Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Daily Sales Rows */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Label>Daily Sales ($)</Label>
              {isSelectedHourly && (
                <Label className="text-muted-foreground">Hours</Label>
              )}
            </div>
            <div className="space-y-2">
              {dailySalesInputs.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12 shrink-0">
                    Day {index + 1}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) =>
                      handleDaySalesChange(index, e.target.value)
                    }
                    className="w-full sm:w-40"
                  />
                  {isSelectedHourly && (
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="0"
                      value={dailyHoursInputs[index] ?? ""}
                      onChange={(e) =>
                        handleDayHoursChange(index, e.target.value)
                      }
                      className="w-full sm:w-28"
                    />
                  )}
                  {dailySalesInputs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => handleRemoveDay(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDay}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add Day
              </Button>
              <span className="text-sm text-muted-foreground">
                Total:{" "}
                <CurrencyDisplay
                  amount={dailyTotal}
                  className="font-semibold text-foreground"
                />
                {isSelectedHourly && (
                  <span className="ml-3">
                    Hours:{" "}
                    <span className="font-semibold text-foreground">
                      {dailyHoursInputs
                        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
                        .toFixed(1)}
                    </span>
                  </span>
                )}
              </span>
            </div>
          </div>

          <Button
            onClick={handleAddEntry}
            disabled={
              !selectedEmployeeId ||
              (isSelectedHourly
                ? dailyTotal <= 0 &&
                  dailyHoursInputs.every(
                    (v) => (parseFloat(v) || 0) <= 0
                  )
                : dailyTotal <= 0)
            }
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </CardContent>
      </Card>

      {/* Current Entries Table */}
      {state.sales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Current Month's Entries ({state.sales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Days
                    </TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.sales.map((entry) => {
                    const employee = state.employees.find(
                      (e) => e.id === entry.employeeId
                    );
                    const empResult = summary.employeeBreakdown.find(
                      (e) => e.employeeId === entry.employeeId
                    );
                    const totalSales = entry.dailySales.reduce(
                      (sum, d) => sum + d,
                      0
                    );
                    const isHourly =
                      employee?.commissionType === ECommissionType.HOURLY;
                    const totalHours = entry.dailyHours?.reduce(
                      (sum, h) => sum + h,
                      0
                    );

                    return (
                      <TableRow key={entry.employeeId}>
                        <TableCell className="font-medium">
                          {employee?.name ?? "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={totalSales} />
                          {isHourly && totalHours != null && (
                            <div className="text-xs text-muted-foreground">
                              {totalHours.toFixed(1)}h
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {entry.dailySales.length}
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay
                            amount={empResult?.commissionAmount ?? 0}
                            colorCode
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEntry(entry)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() =>
                                deleteSalesEntry(entry.employeeId)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Running totals */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-4 rounded-md bg-muted px-3 py-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Revenue
                </span>
                <CurrencyDisplay
                  amount={summary.totalRevenue}
                  className="font-semibold"
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Supplier Costs
                </span>
                <CurrencyDisplay
                  amount={summary.totalSupplierCost}
                  className="font-semibold"
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Commissions
                </span>
                <CurrencyDisplay
                  amount={summary.totalCommissions}
                  className="font-semibold"
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Fixed Costs
                </span>
                <CurrencyDisplay
                  amount={
                    summary.totalLocationCosts + summary.totalExpenses
                  }
                  className="font-semibold"
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Profit
                </span>
                <CurrencyDisplay
                  amount={summary.grossProfit}
                  className="font-semibold"
                  colorCode
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        title="Clear All Sales Data"
        description="This will remove all sales entries for the current month. This action cannot be undone."
        confirmLabel="Clear All"
        variant="destructive"
        onConfirm={clearSales}
      />
    </div>
  );
}
