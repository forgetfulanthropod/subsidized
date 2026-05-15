"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_PATHS = ["/login", "/apps"];

function isSubsidizedAppRoute(pathname: string) {
  return (
    pathname.startsWith("/cases") ||
    pathname.startsWith("/vacancies") ||
    pathname.startsWith("/applicants") ||
    pathname.startsWith("/tenants") ||
    pathname.startsWith("/applications")
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { hydrated, isAuthenticated, selectedApp } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace("/apps");
      return;
    }

    if (isAuthenticated && !selectedApp && isSubsidizedAppRoute(pathname)) {
      router.replace("/apps");
      return;
    }

    if (
      isAuthenticated &&
      selectedApp === "learning" &&
      isSubsidizedAppRoute(pathname)
    ) {
      router.replace("/learning");
      return;
    }

    if (
      isAuthenticated &&
      selectedApp === "subsidized-housing" &&
      (pathname === "/login" || pathname === "/apps")
    ) {
      router.replace("/cases/in-progress");
    }
  }, [hydrated, isAuthenticated, selectedApp, pathname, router]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
