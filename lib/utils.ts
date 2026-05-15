import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "MoveInScheduled" → "move in scheduled" */
export function formatStatus(status: string) {
  return status
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase();
}

export function formatInReviewBy(name: string, title: string) {
  return `In review by ${name}, ${title}`;
}
