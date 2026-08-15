import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateOrderNumber(): string {
  return `DYN-${Date.now().toString(36).toUpperCase()}`;
}

export function generateBookingNumber(): string {
  return `SRV-${Date.now().toString(36).toUpperCase()}`;
}
