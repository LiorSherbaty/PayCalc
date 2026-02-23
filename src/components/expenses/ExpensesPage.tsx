import { useState } from "react";
import { Plus, Trash2, Pencil, Building2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useApp } from "@/context/AppContext";
import type { ILocation, IExpenseItem } from "@/types";

export function ExpensesPage() {
  const {
    state,
    addLocation,
    updateLocation,
    deleteLocation,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useApp();

  // Location form
  const [locationName, setLocationName] = useState("");
  const [locationRent, setLocationRent] = useState("");

  // Expense form
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  // Edit dialogs
  const [editLocationDialog, setEditLocationDialog] = useState<{
    open: boolean;
    location: ILocation | null;
  }>({ open: false, location: null });
  const [editLocationName, setEditLocationName] = useState("");
  const [editLocationRent, setEditLocationRent] = useState("");

  const [editExpenseDialog, setEditExpenseDialog] = useState<{
    open: boolean;
    expense: IExpenseItem | null;
  }>({ open: false, expense: null });
  const [editExpenseName, setEditExpenseName] = useState("");
  const [editExpenseAmount, setEditExpenseAmount] = useState("");

  // Delete dialogs
  const [deleteLocationDialog, setDeleteLocationDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });
  const [deleteExpenseDialog, setDeleteExpenseDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });

  const totalRent = state.locations.reduce(
    (sum, l) => sum + l.monthlyRent,
    0
  );
  const totalExpenses = state.expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  function handleAddLocation() {
    const rent = parseFloat(locationRent);
    if (!locationName.trim() || isNaN(rent) || rent < 0) return;
    addLocation(locationName.trim(), rent);
    setLocationName("");
    setLocationRent("");
  }

  function handleAddExpense() {
    const amount = parseFloat(expenseAmount);
    if (!expenseName.trim() || isNaN(amount) || amount < 0) return;
    addExpense(expenseName.trim(), amount);
    setExpenseName("");
    setExpenseAmount("");
  }

  function openEditLocation(location: ILocation) {
    setEditLocationDialog({ open: true, location });
    setEditLocationName(location.name);
    setEditLocationRent(location.monthlyRent.toString());
  }

  function handleSaveLocation() {
    if (!editLocationDialog.location) return;
    const rent = parseFloat(editLocationRent);
    if (!editLocationName.trim() || isNaN(rent) || rent < 0) return;
    updateLocation({
      id: editLocationDialog.location.id,
      name: editLocationName.trim(),
      monthlyRent: rent,
    });
    setEditLocationDialog({ open: false, location: null });
  }

  function openEditExpense(expense: IExpenseItem) {
    setEditExpenseDialog({ open: true, expense });
    setEditExpenseName(expense.name);
    setEditExpenseAmount(expense.amount.toString());
  }

  function handleSaveExpense() {
    if (!editExpenseDialog.expense) return;
    const amount = parseFloat(editExpenseAmount);
    if (!editExpenseName.trim() || isNaN(amount) || amount < 0) return;
    updateExpense({
      id: editExpenseDialog.expense.id,
      name: editExpenseName.trim(),
      amount,
    });
    setEditExpenseDialog({ open: false, expense: null });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Manage location rent and monthly operating expenses"
      />

      {/* Locations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Locations & Rent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Location Form */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1 flex-1 min-w-[150px]">
              <Label className="text-xs">Location Name</Label>
              <Input
                placeholder="e.g., Main Office"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLocation()}
              />
            </div>
            <div className="space-y-1 w-32">
              <Label className="text-xs">Monthly Rent ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={locationRent}
                onChange={(e) => setLocationRent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLocation()}
              />
            </div>
            <Button
              onClick={handleAddLocation}
              disabled={!locationName.trim() || !locationRent}
              size="sm"
            >
              <Plus className="mr-2 h-3 w-3" />
              Add
            </Button>
          </div>

          {/* Locations Table */}
          {state.locations.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Monthly Rent</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.locations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">
                          {location.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={location.monthlyRent} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditLocation(location)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() =>
                                setDeleteLocationDialog({
                                  open: true,
                                  id: location.id,
                                  name: location.name,
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end text-sm">
                <span className="text-muted-foreground mr-2">Total Rent:</span>
                <CurrencyDisplay amount={totalRent} className="font-semibold" />
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No locations added yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4" />
            Monthly Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Expense Form */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1 flex-1 min-w-[150px]">
              <Label className="text-xs">Expense Name</Label>
              <Input
                placeholder="e.g., Insurance"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddExpense()}
              />
            </div>
            <div className="space-y-1 w-32">
              <Label className="text-xs">Amount ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddExpense()}
              />
            </div>
            <Button
              onClick={handleAddExpense}
              disabled={!expenseName.trim() || !expenseAmount}
              size="sm"
            >
              <Plus className="mr-2 h-3 w-3" />
              Add
            </Button>
          </div>

          {/* Expenses Table */}
          {state.expenses.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense</TableHead>
                      <TableHead className="text-right">
                        Monthly Amount
                      </TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {expense.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={expense.amount} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditExpense(expense)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() =>
                                setDeleteExpenseDialog({
                                  open: true,
                                  id: expense.id,
                                  name: expense.name,
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end text-sm">
                <span className="text-muted-foreground mr-2">
                  Total Expenses:
                </span>
                <CurrencyDisplay
                  amount={totalExpenses}
                  className="font-semibold"
                />
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No expenses added yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Grand Total */}
      {(state.locations.length > 0 || state.expenses.length > 0) && (
        <div className="rounded-md bg-muted px-4 py-3 text-sm flex justify-between items-center">
          <span className="font-medium">Total Monthly Fixed Costs</span>
          <CurrencyDisplay
            amount={totalRent + totalExpenses}
            className="font-bold text-base"
          />
        </div>
      )}

      {/* Edit Location Dialog */}
      <Dialog
        open={editLocationDialog.open}
        onOpenChange={(open) =>
          setEditLocationDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Location Name</Label>
              <Input
                autoFocus
                value={editLocationName}
                onChange={(e) => setEditLocationName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Rent ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editLocationRent}
                onChange={(e) => setEditLocationRent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditLocationDialog({ open: false, location: null })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSaveLocation}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog
        open={editExpenseDialog.open}
        onOpenChange={(open) =>
          setEditExpenseDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Expense Name</Label>
              <Input
                autoFocus
                value={editExpenseName}
                onChange={(e) => setEditExpenseName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editExpenseAmount}
                onChange={(e) => setEditExpenseAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditExpenseDialog({ open: false, expense: null })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSaveExpense}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialogs */}
      <ConfirmDialog
        open={deleteLocationDialog.open}
        onOpenChange={(open) =>
          setDeleteLocationDialog((prev) => ({ ...prev, open }))
        }
        title="Delete Location"
        description={`Are you sure you want to delete "${deleteLocationDialog.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteLocation(deleteLocationDialog.id)}
      />

      <ConfirmDialog
        open={deleteExpenseDialog.open}
        onOpenChange={(open) =>
          setDeleteExpenseDialog((prev) => ({ ...prev, open }))
        }
        title="Delete Expense"
        description={`Are you sure you want to delete "${deleteExpenseDialog.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteExpense(deleteExpenseDialog.id)}
      />
    </div>
  );
}
