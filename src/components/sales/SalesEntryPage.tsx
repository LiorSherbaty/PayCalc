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
import type { IMonthlySalesEntry, IProductSaleEntry } from "@/types";

export function SalesEntryPage() {
  const {
    state,
    addSalesEntry,
    updateSalesEntry,
    deleteSalesEntry,
    clearSales,
  } = useApp();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [totalSales, setTotalSales] = useState("");
  const [productQuantities, setProductQuantities] = useState<
    Record<string, string>
  >({});
  const [showClearDialog, setShowClearDialog] = useState(false);

  const allProducts = useMemo(
    () =>
      state.suppliers.flatMap((s) =>
        s.products.map((p) => ({
          ...p,
          supplierName: s.name,
          supplierId: s.id,
        }))
      ),
    [state.suppliers]
  );

  const availableEmployees = state.employees.filter(
    (emp) => !state.sales.some((s) => s.employeeId === emp.id)
  );

  const summary = useMemo(
    () =>
      calculateMonthlySummary(state.suppliers, state.employees, state.sales),
    [state.suppliers, state.employees, state.sales]
  );

  function handleAddEntry() {
    if (!selectedEmployeeId || !totalSales) return;

    const salesDollars = parseFloat(totalSales);
    if (!Number.isFinite(salesDollars) || salesDollars < 0) return;

    const productSales: IProductSaleEntry[] = allProducts
      .map((p) => ({
        productId: p.id,
        quantitySold: Math.max(0, Number(productQuantities[p.id]) || 0),
      }))
      .filter((ps) => ps.quantitySold > 0);

    const entry: IMonthlySalesEntry = {
      employeeId: selectedEmployeeId,
      totalSalesDollars: salesDollars,
      productSales,
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
    setTotalSales("");
    setProductQuantities({});
  }

  function handleEditEntry(entry: IMonthlySalesEntry) {
    setSelectedEmployeeId(entry.employeeId);
    setTotalSales(entry.totalSalesDollars.toString());
    const quantities: Record<string, string> = {};
    for (const ps of entry.productSales) {
      quantities[ps.productId] = ps.quantitySold.toString();
    }
    setProductQuantities(quantities);
    deleteSalesEntry(entry.employeeId);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Entry"
        description="Enter this month's sales data for each employee"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>Total Sales ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={totalSales}
                onChange={(e) => setTotalSales(e.target.value)}
              />
            </div>
          </div>

          {allProducts.length > 0 && (
            <div className="space-y-2">
              <Label>Product Quantities Sold</Label>
              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {allProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {product.supplierName}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      className="w-20 shrink-0"
                      placeholder="0"
                      value={productQuantities[product.id] || ""}
                      onChange={(e) =>
                        setProductQuantities((prev) => ({
                          ...prev,
                          [product.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleAddEntry}
            disabled={!selectedEmployeeId || !totalSales}
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
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Products
                    </TableHead>
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
                    const totalProducts = entry.productSales.reduce(
                      (sum, ps) => sum + ps.quantitySold,
                      0
                    );

                    return (
                      <TableRow key={entry.employeeId}>
                        <TableCell className="font-medium">
                          {employee?.name ?? "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay
                            amount={entry.totalSalesDollars}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay
                            amount={empResult?.commissionAmount ?? 0}
                            colorCode
                          />
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {totalProducts} units
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

            {/* Running totals — responsive grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 rounded-md bg-muted px-3 py-3 text-sm">
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
