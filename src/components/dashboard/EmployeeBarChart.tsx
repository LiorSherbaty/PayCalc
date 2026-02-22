import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/formatters";
import type { IMonthlySummary } from "@/types";

interface IEmployeeBarChartProps {
  summary: IMonthlySummary;
}

export function EmployeeBarChart({ summary }: IEmployeeBarChartProps) {
  const { state } = useApp();
  const symbol = state.settings.currencySymbol;

  const data = summary.employeeBreakdown.map((e) => ({
    name: e.employeeName,
    sales: e.totalSales,
    commission: e.commissionAmount,
  }));

  const BAR_GROUP_HEIGHT = 52;
  const CHART_PADDING = 40;
  const chartHeight = Math.max(280, data.length * BAR_GROUP_HEIGHT + CHART_PADDING);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Employee Commission Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No employee data to display
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Employee Commission Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, bottom: 20, left: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" className="text-xs" />
            <YAxis
              type="category"
              dataKey="name"
              className="text-xs"
              width={110}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), symbol)}
            />
            <Bar
              dataKey="sales"
              name="Sales"
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="commission"
              name="Commission"
              fill="#a855f7"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
