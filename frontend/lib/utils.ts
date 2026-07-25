import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function abbreviateINR(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1e7) {
    return `${sign}₹${(abs / 1e7).toFixed(1)}Cr`;
  }
  if (abs >= 1e5) {
    return `${sign}₹${(abs / 1e5).toFixed(1)}L`;
  }
  if (abs >= 1e3) {
    return `${sign}₹${(abs / 1e3).toFixed(1)}K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}
