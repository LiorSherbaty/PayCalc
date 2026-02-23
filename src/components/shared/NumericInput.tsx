import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface INumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  displayMultiplier?: number;
  decimalPlaces?: number;
  className?: string;
  placeholder?: string;
}

export function NumericInput({
  value,
  onChange,
  min,
  max,
  step,
  displayMultiplier = 1,
  decimalPlaces,
  className,
  placeholder,
}: INumericInputProps) {
  const [localValue, setLocalValue] = useState(() =>
    formatDisplay(value, displayMultiplier, decimalPlaces)
  );
  const isFocused = useRef(false);

  useEffect(() => {
    if (isFocused.current) return;
    setLocalValue(formatDisplay(value, displayMultiplier, decimalPlaces));
  }, [value, displayMultiplier, decimalPlaces]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalValue(e.target.value);
  }

  function handleBlur() {
    isFocused.current = false;
    const parsed = parseFloat(localValue);

    if (!Number.isFinite(parsed)) {
      const fallback = min ?? 0;
      onChange(fallback);
      setLocalValue(formatDisplay(fallback, displayMultiplier, decimalPlaces));
      return;
    }

    const displayValue = parsed;
    const actualValue = displayValue / displayMultiplier;
    const clamped = clamp(actualValue, min, max);
    onChange(clamped);
    setLocalValue(formatDisplay(clamped, displayMultiplier, decimalPlaces));
  }

  function handleFocus() {
    isFocused.current = true;
  }

  return (
    <Input
      type="number"
      min={min !== undefined ? min * displayMultiplier : undefined}
      max={max !== undefined ? max * displayMultiplier : undefined}
      step={step}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={className}
      placeholder={placeholder}
    />
  );
}

function formatDisplay(
  value: number,
  multiplier: number,
  decimalPlaces?: number
): string {
  const display = value * multiplier;
  if (decimalPlaces !== undefined) return display.toFixed(decimalPlaces);
  return String(display);
}

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}
