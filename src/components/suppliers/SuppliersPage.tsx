import { useState } from "react";
import { Plus, Trash2, Pencil, Package, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useApp } from "@/context/AppContext";
import type { IProduct } from "@/types";

export function SuppliersPage() {
  const {
    state,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useApp();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");

  // Product dialog
  const [productDialog, setProductDialog] = useState<{
    open: boolean;
    supplierId: string;
    editing: IProduct | null;
  }>({ open: false, supplierId: "", editing: null });
  const [productName, setProductName] = useState("");
  const [productCost, setProductCost] = useState("");

  // Edit supplier dialog
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });

  function handleAddSupplier() {
    if (!newSupplierName.trim()) return;
    addSupplier(newSupplierName.trim());
    setNewSupplierName("");
    setShowAddSupplier(false);
  }

  function handleSaveProduct() {
    const cost = parseFloat(productCost);
    if (!productName.trim() || isNaN(cost) || cost < 0) return;

    if (productDialog.editing) {
      updateProduct(productDialog.supplierId, {
        id: productDialog.editing.id,
        name: productName.trim(),
        costPerUnit: cost,
      });
    } else {
      addProduct(productDialog.supplierId, productName.trim(), cost);
    }

    setProductDialog({ open: false, supplierId: "", editing: null });
    setProductName("");
    setProductCost("");
  }

  function openProductDialog(supplierId: string, editing?: IProduct) {
    setProductDialog({
      open: true,
      supplierId,
      editing: editing ?? null,
    });
    setProductName(editing?.name ?? "");
    setProductCost(editing?.costPerUnit?.toString() ?? "");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage suppliers and their product costs"
        action={
          <Button onClick={() => setShowAddSupplier(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        }
      />

      {state.suppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No suppliers added yet</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setShowAddSupplier(true)}
            >
              Add your first supplier
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {state.suppliers.map((supplier) => {
            const isExpanded = expandedId === supplier.id;
            return (
              <Card key={supplier.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : supplier.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">
                        {supplier.name}
                      </CardTitle>
                      <Badge variant="secondary">
                        {supplier.products.length} product
                        {supplier.products.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditDialog({
                            open: true,
                            id: supplier.id,
                            name: supplier.name,
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({
                            open: true,
                            id: supplier.id,
                            name: supplier.name,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    {supplier.products.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No products yet
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">
                              Cost Per Unit
                            </TableHead>
                            <TableHead className="w-24"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supplier.products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">
                                {product.name}
                              </TableCell>
                              <TableCell className="text-right">
                                <CurrencyDisplay
                                  amount={product.costPerUnit}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      openProductDialog(
                                        supplier.id,
                                        product
                                      )
                                    }
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() =>
                                      deleteProduct(
                                        supplier.id,
                                        product.id
                                      )
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
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => openProductDialog(supplier.id)}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Product
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Supplier Dialog */}
      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Supplier Name</Label>
              <Input
                autoFocus
                placeholder="Enter supplier name"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSupplier()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddSupplier(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSupplier}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Supplier Name</Label>
            <Input
              autoFocus
              value={editDialog.name}
              onChange={(e) =>
                setEditDialog((prev) => ({ ...prev, name: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateSupplier(editDialog.id, editDialog.name);
                  setEditDialog({ open: false, id: "", name: "" });
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditDialog({ open: false, id: "", name: "" })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateSupplier(editDialog.id, editDialog.name);
                setEditDialog({ open: false, id: "", name: "" });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={productDialog.open}
        onOpenChange={(open) =>
          setProductDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {productDialog.editing ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                autoFocus
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cost Per Unit ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={productCost}
                onChange={(e) => setProductCost(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setProductDialog({
                  open: false,
                  supplierId: "",
                  editing: null,
                })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              {productDialog.editing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Supplier Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, open }))
        }
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deleteDialog.name}" and all its products? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteSupplier(deleteDialog.id)}
      />
    </div>
  );
}
