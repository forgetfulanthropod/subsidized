"use client";

import { ChevronDown } from "lucide-react";
import { usePersistedCollapsed } from "@/lib/use-persisted-collapsed";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  storageKey: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
  headerClassName?: string;
  children: React.ReactNode;
}

export function CollapsibleSection({
  storageKey,
  title,
  description,
  defaultCollapsed = false,
  className,
  headerClassName,
  children,
}: CollapsibleSectionProps) {
  const { collapsed, toggle } = usePersistedCollapsed(storageKey, defaultCollapsed);

  return (
    <section className={className}>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex w-full items-start justify-between gap-3 rounded-lg text-left transition-colors hover:bg-slate-50/80",
          headerClassName
        )}
        aria-expanded={!collapsed}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">{title}</div>
          {description && !collapsed && (
            <div className="mt-1 text-sm text-slate-600">{description}</div>
          )}
          {description && collapsed && (
            <div className="mt-1 line-clamp-1 text-sm text-slate-500">
              {description}
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 text-slate-500 transition-transform",
            collapsed && "-rotate-90"
          )}
          aria-hidden
        />
      </button>
      {!collapsed && <div className="mt-3">{children}</div>}
    </section>
  );
}
