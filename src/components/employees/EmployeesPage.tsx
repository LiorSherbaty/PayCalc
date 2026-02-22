import { useState } from "react";
import { Plus, Trash2, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CommissionEditor } from "./CommissionEditor";
import { CommissionPreview } from "./CommissionPreview";
import { useApp } from "@/context/AppContext";
import { ECommissionType, ETieredMode } from "@/types";
import type { IEmployee } from "@/types";
import { formatRate } from "@/utils/formatters";

export function EmployeesPage() {
  const { state, addEmployee, updateEmployee, deleteEmployee } = useApp();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(
    null
  );
  const [newName, setNewName] = useState("");
  const [newEmployee, setNewEmployee] = useState<IEmployee>({
    id: "",
    name: "",
    commissionType: ECommissionType.FLAT,
    flatRate: 0.1,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });

  function handleAddEmployee() {
    if (!newName.trim()) return;
    addEmployee({ ...newEmployee, name: newName.trim() });
    setNewName("");
    setNewEmployee({
      id: "",
      name: "",
      commissionType: ECommissionType.FLAT,
      flatRate: 0.1,
    });
    setShowAddDialog(false);
  }

  function handleSaveEdit() {
    if (!editingEmployee) return;
    updateEmployee(editingEmployee);
    setEditingEmployee(null);
  }

  function getCommissionLabel(emp: IEmployee): string {
    if (emp.commissionType === ECommissionType.FLAT) {
      return `Flat ${formatRate(emp.flatRate ?? 0)}`;
    }
    const mode =
      emp.tieredMode === ETieredMode.MARGINAL ? "Marginal" : "Flat-rate";
    return `Tiered (${mode}) - ${emp.tiers?.length ?? 0} tiers`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage employees and their commission structures"
        action={
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        }
      />

      {state.employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No employees added yet</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setShowAddDialog(true)}
            >
              Add your first employee
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {state.employees.map((emp) => (
            <Card key={emp.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{emp.name}</CardTitle>
                    <Badge variant="secondary">
                      {getCommissionLabel(emp)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingEmployee({ ...emp })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          id: emp.id,
                          name: emp.name,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CommissionPreview employee={emp} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee Name</Label>
              <Input
                autoFocus
                placeholder="Enter employee name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <CommissionEditor
              employee={newEmployee}
              onChange={setNewEmployee}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog
        open={editingEmployee !== null}
        onOpenChange={(open) => {
          if (!open) setEditingEmployee(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Employee Name</Label>
                <Input
                  value={editingEmployee.name}
                  onChange={(e) =>
                    setEditingEmployee((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                />
              </div>
              <CommissionEditor
                employee={editingEmployee}
                onChange={setEditingEmployee}
              />
              <CommissionPreview employee={editingEmployee} />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingEmployee(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, open }))
        }
        title="Delete Employee"
        description={`Are you sure you want to delete "${deleteDialog.name}"? Their sales data will also be removed.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteEmployee(deleteDialog.id)}
      />
    </div>
  );
}
