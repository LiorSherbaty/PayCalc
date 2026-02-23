import { useMemo } from "react";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useApp } from "@/context/AppContext";
import { calculateSupplierPayment } from "@/utils/calculations";
import type { IProductSaleEntry } from "@/types";

export function ProductSalesPage() {
  const { state, setProductSales } = useApp();

  // Build a lookup: productId → quantitySold
  const quantityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const ps of state.productSales) {
      map.set(ps.productId, ps.quantitySold);
    }
    return map;
  }, [state.productSales]);

  // Flat list of all products across suppliers for easy rendering
  const allProducts = useMemo(() => {
    return state.suppliers.flatMap((supplier) =>
      supplier.products.map((product) => ({
        supplierId: supplier.id,
        supplierName: supplier.name,
        productId: product.id,
        productName: product.name,
        costPerUnit: product.costPerUnit,
      }))
    );
  }, [state.suppliers]);

  // Supplier cost breakdowns
  const supplierBreakdowns = useMemo(
    () =>
      state.suppliers.map((supplier) =>
        calculateSupplierPayment(supplier, state.productSales)
      ),
    [state.suppliers, state.productSales]
  );

  const totalSupplierCost = supplierBreakdowns.reduce(
    (sum, s) => sum + s.total,
    0
  );

  function handleQuantityChange(productId: string, value: string) {
    const qty = parseInt(value, 10);
    const newQuantity = isNaN(qty) || qty < 0 ? 0 : qty;

    const updated: IProductSaleEntry[] = [];
    let found = false;

    for (const ps of state.productSales) {
      if (ps.productId === productId) {
        found = true;
        if (newQuantity > 0) {
          updated.push({ productId, quantitySold: newQuantity });
        }
      } else {
        updated.push(ps);
      }
    }

    if (!found && newQuantity > 0) {
      updated.push({ productId, quantitySold: newQuantity });
    }

    setProductSales(updated);
  }

  // Group products by supplier for display
  const supplierGroups = useMemo(() => {
    return state.suppliers.map((supplier) => ({
      supplier,
      breakdown: supplierBreakdowns.find(
        (b) => b.supplierId === supplier.id
      ),
    }));
  }, [state.suppliers, supplierBreakdowns]);

  if (state.suppliers.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Product Sales"
          description="Enter this month's product quantities sold (business-wide)"
        />
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No suppliers configured. Add suppliers and products first.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Sales"
        description="Enter this month's product quantities sold (business-wide totals)"
      />

      {supplierGroups.map(({ supplier, breakdown }) => (
        <Card key={supplier.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              {supplier.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.products.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No products for this supplier
              </p>
            ) : (
              <>
                <div className="overflow-x-auto -mx-6 px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">
                          Cost / Unit
                        </TableHead>
                        <TableHead className="w-28 text-center">
                          Qty Sold
                        </TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplier.products.map((product) => {
                        const qty = quantityMap.get(product.id) ?? 0;
                        const lineTotal = qty * product.costPerUnit;

                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell className="text-right">
                              <CurrencyDisplay amount={product.costPerUnit} />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                className="w-24 text-center mx-auto"
                                value={qty || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  handleQuantityChange(
                                    product.id,
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <CurrencyDisplay amount={lineTotal} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-3 flex justify-end text-sm">
                  <span className="text-muted-foreground mr-2">
                    Supplier Total:
                  </span>
                  <CurrencyDisplay
                    amount={breakdown?.total ?? 0}
                    className="font-semibold"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Grand Total */}
      <div className="rounded-md bg-muted px-4 py-3 text-sm flex justify-between items-center">
        <span className="font-medium">Total Supplier Costs</span>
        <CurrencyDisplay
          amount={totalSupplierCost}
          className="font-bold text-base"
        />
      </div>
    </div>
  );
}
