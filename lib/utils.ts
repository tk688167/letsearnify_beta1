import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatUserId(memberId: number | undefined | null) {
  if (memberId === undefined || memberId === null) return "LEU-XXXXXX";
  return `LEU-${memberId.toString().padStart(6, '0')}`;
}
