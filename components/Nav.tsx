"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserLogin } from "@/components/UserLogin";

const links = [
  { href: "/cases/in-progress", label: "Cases", prefix: "/cases" },
  { href: "/vacancies", label: "Vacancies", prefix: "/vacancies" },
  { href: "/applicants", label: "Applicants", prefix: "/applicants" },
  { href: "/tenants", label: "Tenants", prefix: "/tenants" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/cases/in-progress"
          className="flex shrink-0 items-center gap-2.5"
        >
          <Image
            src="/essex-logo.png"
            alt="Essex Property Trust"
            width={180}
            height={48}
            className="h-8 w-auto sm:h-9"
            priority
          />
          <span className="hidden text-sm text-slate-500 sm:inline">
            Subsidized Housing
          </span>
        </Link>
        <nav className="flex flex-1 justify-center gap-1">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              pathname.startsWith(link.prefix + "/") ||
              (link.prefix === "/cases" && pathname === "/cases");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <UserLogin />
      </div>
    </header>
  );
}
