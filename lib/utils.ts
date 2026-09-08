import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function calculateGrossMargin(revenue: number, grossProfit: number): number {
  if (revenue === 0) return 0
  return (grossProfit / revenue) * 100
}

export function calculateNetMargin(revenue: number, netProfit: number): number {
  if (revenue === 0) return 0
  return (netProfit / revenue) * 100
}

export function calculateBreakEven(fixedCosts: number, contributionMargin: number): number {
  if (contributionMargin === 0) return 0
  return fixedCosts / contributionMargin
}

export function calculateCLV(avgTransactionValue: number, purchaseFrequency: number, customerLifespan: number): number {
  return avgTransactionValue * purchaseFrequency * customerLifespan
}

export function calculateConversionRate(leads: number, customers: number): number {
  if (leads === 0) return 0
  return (customers / leads) * 100
}
