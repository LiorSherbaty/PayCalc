import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import type { ISupplierPaymentResult } from "@/types";

interface ISupplierCostTableProps {
  suppliers: ISupplierPaymentResult[];
}

export function SupplierCostTable({ suppliers }: ISupplierCostTableProps) {
  const hasAnyProducts = suppliers.some((s) =>
    s.lines.some((l) => l.quantitySold > 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Supplier Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyProducts ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No sales data to display
          </p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) =>
                supplier.lines
                  .filter((line) => line.quantitySold > 0)
                  .map((line, i) => (
                    <TableRow key={`${supplier.supplierId}-${line.productId}`}>
                      {i === 0 && (
                        <TableCell
                          className="font-medium"
                          rowSpan={
                            supplier.lines.filter((l) => l.quantitySold > 0)
                              .length
                          }
                        >
                          {supplier.supplierName}
                        </TableCell>
                      )}
                      <TableCell>{line.productName}</TableCell>
                      <TableCell className="text-right">
                        {line.quantitySold}
                      </TableCell>
                      <TableCell className="text-right">
                        <CurrencyDisplay amount={line.costPerUnit} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <CurrencyDisplay amount={line.lineTotal} />
                      </TableCell>
                    </TableRow>
                  ))
              )}
              <TableRow className="font-bold">
                <TableCell colSpan={4}>Total Supplier Costs</TableCell>
                <TableCell className="text-right">
                  <CurrencyDisplay
                    amount={suppliers.reduce((s, sup) => s + sup.total, 0)}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
