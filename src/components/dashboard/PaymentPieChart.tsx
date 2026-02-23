import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/formatters";
import type { IMonthlySummary } from "@/types";

interface IPaymentPieChartProps {
  summary: IMonthlySummary;
}

const COLORS = ["#f97316", "#a855f7", "#e11d48", "#22c55e"];

export function PaymentPieChart({ summary }: IPaymentPieChartProps) {
  const { state } = useApp();
  const symbol = state.settings.currencySymbol;

  const fixedCosts = summary.totalLocationCosts + summary.totalExpenses;
  const data = [
    { name: "Supplier Costs", value: summary.totalSupplierCost },
    { name: "Commissions", value: summary.totalCommissions },
    { name: "Fixed Costs", value: fixedCosts },
    {
      name: "Profit",
      value: Math.max(0, summary.grossProfit),
    },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No sales data to display
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), symbol)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
