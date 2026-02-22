export function formatCurrency(
  amount: number,
  currencySymbol: string = "$"
): string {
  if (!Number.isFinite(amount)) return `${currencySymbol}--`;

  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? "-" : "";
  return `${sign}${currencySymbol}${formatted}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}
