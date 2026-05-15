"use client";

import { useCallback, useEffect, useState } from "react";

export function usePersistedCollapsed(storageKey: string, defaultCollapsed = false) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [storageKey, collapsed, hydrated]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return { collapsed, setCollapsed, toggle, hydrated };
}
