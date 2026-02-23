import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { SalesEntryPage } from "@/components/sales/SalesEntryPage";
import { SuppliersPage } from "@/components/suppliers/SuppliersPage";
import { EmployeesPage } from "@/components/employees/EmployeesPage";
import { ProductSalesPage } from "@/components/product-sales/ProductSalesPage";
import { ExpensesPage } from "@/components/expenses/ExpensesPage";
import { SettingsPage } from "@/components/settings/SettingsPage";

export default function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="sales" element={<SalesEntryPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="product-sales" element={<ProductSalesPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}
