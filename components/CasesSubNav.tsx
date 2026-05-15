"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/cases/in-progress", label: "In progress" },
  { href: "/cases/completed", label: "Completed" },
];

export function CasesSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 border-b border-slate-200">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
