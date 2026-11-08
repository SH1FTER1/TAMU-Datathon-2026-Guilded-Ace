import { ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined) return '0.0%';
  return `${val >= 0 ? '' : ''}${val.toFixed(2)}%`;
}

