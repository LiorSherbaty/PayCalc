import { useState, useRef, useCallback, useMemo } from "react";
import {
  Upload,
  Download,
  RotateCcw,
  Sun,
  Moon,
  FileDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useApp } from "@/context/AppContext";
import { parseSuppliersJson, parseEmployeesJson } from "@/utils/validators";
import { calculateMonthlySummary } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export function SettingsPage() {
  const {
    state,
    updateSettings,
    importSuppliers,
    importEmployees,
    resetAll,
  } = useApp();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [importResult, setImportResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = useCallback(
    (file: File) => {
      setImportResult(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result;
        if (typeof raw !== "string") {
          setImportResult({
            type: "error",
            message: "Could not read file. Make sure it is a valid JSON text file.",
          });
          return;
        }

        // Try suppliers first
        const suppliersResult = parseSuppliersJson(raw);
        if (suppliersResult.data) {
          importSuppliers(suppliersResult.data.suppliers);
          setImportResult({
            type: "success",
            message: `Imported ${suppliersResult.data.suppliers.length} supplier(s) successfully`,
          });
          toast.success("Suppliers imported successfully");
          return;
        }

        // Try employees
        const employeesResult = parseEmployeesJson(raw);
        if (employeesResult.data) {
          importEmployees(employeesResult.data.employees);
          setImportResult({
            type: "success",
            message: `Imported ${employeesResult.data.employees.length} employee(s) successfully`,
          });
          toast.success("Employees imported successfully");
          return;
        }

        // Both failed
        const allErrors = [
          ...suppliersResult.validation.errors.map(
            (e) => `Suppliers: ${e}`
          ),
          ...employeesResult.validation.errors.map(
            (e) => `Employees: ${e}`
          ),
        ];
        setImportResult({
          type: "error",
          message: allErrors.join("\n"),
        });
      };
      reader.readAsText(file);
    },
    [importSuppliers, importEmployees]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".json")) {
      handleImportFile(file);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleImportFile(file);
    }
    e.target.value = "";
  }

  function exportConfig() {
    const data = {
      suppliers: state.suppliers,
      employees: state.employees,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "paycalc-config.json");
    toast.success("Configuration exported");
  }

  function exportSuppliersJson() {
    const blob = new Blob(
      [JSON.stringify({ suppliers: state.suppliers }, null, 2)],
      { type: "application/json" }
    );
    saveAs(blob, "paycalc-suppliers.json");
    toast.success("Suppliers exported");
  }

  function exportEmployeesJson() {
    const blob = new Blob(
      [JSON.stringify({ employees: state.employees }, null, 2)],
      { type: "application/json" }
    );
    saveAs(blob, "paycalc-employees.json");
    toast.success("Employees exported");
  }

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

  function exportResultsCsv() {
    const symbol = state.settings.currencySymbol;
    const lines: string[] = [
      "Type,Name,Amount,Details",
      // Employee commissions
      ...summary.employeeBreakdown.map(
        (e) =>
          `Commission,"${e.employeeName}",${formatCurrency(e.commissionAmount, symbol)},"Sales: ${formatCurrency(e.totalSales, symbol)}"`
      ),
      // Supplier costs
      ...summary.supplierBreakdown.map(
        (s) =>
          `Supplier Cost,"${s.supplierName}",${formatCurrency(s.total, symbol)},"${s.lines.filter((l) => l.quantitySold > 0).map((l) => `${l.productName}: ${l.quantitySold} units`).join("; ")}"`
      ),
      // Location costs
      ...state.locations.map(
        (l) =>
          `Location Rent,"${l.name}",${formatCurrency(l.monthlyRent, symbol)},`
      ),
      // Expenses
      ...state.expenses.map(
        (e) =>
          `Expense,"${e.name}",${formatCurrency(e.amount, symbol)},`
      ),
      "",
      `Total Revenue,,${formatCurrency(summary.totalRevenue, symbol)},`,
      `Total Supplier Costs,,${formatCurrency(summary.totalSupplierCost, symbol)},`,
      `Total Commissions,,${formatCurrency(summary.totalCommissions, symbol)},`,
      `Total Location Costs,,${formatCurrency(summary.totalLocationCosts, symbol)},`,
      `Total Expenses,,${formatCurrency(summary.totalExpenses, symbol)},`,
      `Gross Profit,,${formatCurrency(summary.grossProfit, symbol)},`,
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    saveAs(blob, "paycalc-results.csv");
    toast.success("Results exported as CSV");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="App preferences, import and export data"
      />

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-xs text-muted-foreground">
                Toggle dark/light theme
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={state.settings.darkMode}
                onCheckedChange={(checked) =>
                  updateSettings({ darkMode: checked })
                }
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Currency Symbol</Label>
              <p className="text-xs text-muted-foreground">
                Displayed before amounts
              </p>
            </div>
            <Input
              value={state.settings.currencySymbol}
              onChange={(e) =>
                updateSettings({ currencySymbol: e.target.value })
              }
              className="w-20 text-center"
              maxLength={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop a JSON file here, or
            </p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Accepts suppliers or employees JSON files
            </p>
          </div>

          {importResult && (
            <Alert
              variant={
                importResult.type === "error" ? "destructive" : "default"
              }
            >
              {importResult.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription className="whitespace-pre-line">
                {importResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" onClick={exportConfig}>
              <Download className="mr-2 h-4 w-4" />
              Full Config (JSON)
            </Button>
            <Button variant="outline" onClick={exportSuppliersJson}>
              <Download className="mr-2 h-4 w-4" />
              Suppliers (JSON)
            </Button>
            <Button variant="outline" onClick={exportEmployeesJson}>
              <Download className="mr-2 h-4 w-4" />
              Employees (JSON)
            </Button>
            <Button variant="outline" onClick={exportResultsCsv}>
              <FileDown className="mr-2 h-4 w-4" />
              Results (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Reset to Defaults</p>
              <p className="text-xs text-muted-foreground">
                This will remove all your data and restore default
                suppliers and employees
              </p>
            </div>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset All
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset All Data"
        description="This will delete all suppliers, employees, and sales data, and restore the default configuration. This action cannot be undone."
        confirmLabel="Reset Everything"
        variant="destructive"
        onConfirm={resetAll}
      />
    </div>
  );
}
