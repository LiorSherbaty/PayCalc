import { DollarSign, TrendingDown, Users, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { formatPercent } from "@/utils/formatters";
import type { IMonthlySummary } from "@/types";

interface ISummaryCardsProps {
  summary: IMonthlySummary;
}

export function SummaryCards({ summary }: ISummaryCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: summary.totalRevenue,
      icon: DollarSign,
      accent: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
    },
    {
      title: "Supplier Costs",
      value: summary.totalSupplierCost,
      icon: TrendingDown,
      accent:
        "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
    },
    {
      title: "Commissions",
      value: summary.totalCommissions,
      icon: Users,
      accent:
        "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950",
    },
    {
      title: "Gross Profit",
      value: summary.grossProfit,
      icon: Percent,
      accent:
        summary.grossProfit >= 0
          ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950"
          : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-md p-2 ${card.accent}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay
                amount={card.value}
                colorCode={card.title === "Gross Profit"}
              />
            </div>
            {card.title === "Gross Profit" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Margin: {formatPercent(summary.profitMarginPercent)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
