import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface ICurrencyDisplayProps {
  amount: number;
  className?: string;
  colorCode?: boolean; // green positive, red negative
}

export function CurrencyDisplay({
  amount,
  className,
  colorCode = false,
}: ICurrencyDisplayProps) {
  const { state } = useApp();

  return (
    <span
      className={cn(
        colorCode && amount > 0 && "text-emerald-600 dark:text-emerald-400",
        colorCode && amount < 0 && "text-red-600 dark:text-red-400",
        className
      )}
    >
      {formatCurrency(amount, state.settings.currencySymbol)}
    </span>
  );
}
