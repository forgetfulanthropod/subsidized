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
const STATUS_LABELS: Record<string, string> = {
  MovedIn: "moved in",
  Stalled: "stalled",
  TenancyConfirmed: "tenancy confirmed",
};

export function formatStatus(status: string) {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  return status
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase();
}

export function formatSubsidyType(subsidyType: "Section8" | "LIHTC") {
  return subsidyType === "Section8" ? "Section 8" : "Subsidized";
}

export function formatInReviewBy(name: string, title: string) {
  return `In review by ${name}, ${title}`;
}

export function daysSince(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function formatDaysSince(iso: string) {
  const days = daysSince(iso);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function isThisWeek(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}
