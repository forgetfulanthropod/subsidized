"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Nav } from "@/components/Nav";

export function ConditionalNav() {
  const pathname = usePathname();
  const { isAuthenticated, selectedApp } = useAuth();

  if (!isAuthenticated || selectedApp !== "subsidized-housing") {
    return null;
  }

  if (pathname === "/login" || pathname === "/apps") {
    return null;
  }

  return <Nav />;
}
