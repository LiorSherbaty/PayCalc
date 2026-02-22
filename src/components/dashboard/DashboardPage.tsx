import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { SummaryCards } from "./SummaryCards";
import { PaymentPieChart } from "./PaymentPieChart";
import { EmployeeBarChart } from "./EmployeeBarChart";
import { SupplierCostTable } from "./SupplierCostTable";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { useApp } from "@/context/AppContext";
import { calculateMonthlySummary } from "@/utils/calculations";

export function DashboardPage() {
  const { state } = useApp();

  const summary = useMemo(
    () =>
      calculateMonthlySummary(
        state.suppliers,
        state.employees,
        state.sales
      ),
    [state.suppliers, state.employees, state.sales]
  );

  const hasSalesData = state.sales.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Monthly payment overview at a glance"
      />

      {!hasSalesData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              No sales data entered yet. Head to Sales Entry to input this
              month's numbers.
            </span>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link to="/sales">Enter Sales</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <SummaryCards summary={summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PaymentPieChart summary={summary} />
        <EmployeeBarChart summary={summary} />
      </div>

      <WhatIfSimulator />

      <SupplierCostTable suppliers={summary.supplierBreakdown} />
    </div>
  );
}
