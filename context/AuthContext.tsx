"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { STORAGE_KEY } from "@/lib/users";

const AUTH_KEY = "essex-haven-sso";
const APP_KEY = "essex-haven-app";

export type EssexAppId = "subsidized-housing" | "learning";

interface AuthContextValue {
  hydrated: boolean;
  isAuthenticated: boolean;
  selectedApp: EssexAppId | null;
  loginWithEssex: () => void;
  selectApp: (app: EssexAppId) => void;
  clearApp: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readApp(): EssexAppId | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(APP_KEY);
  if (v === "subsidized-housing" || v === "learning") return v;
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedApp, setSelectedApp] = useState<EssexAppId | null>(null);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem(AUTH_KEY) === "true");
    setSelectedApp(readApp());
    setHydrated(true);
  }, []);

  const loginWithEssex = useCallback(() => {
    localStorage.setItem(AUTH_KEY, "true");
    setIsAuthenticated(true);
    router.push("/apps");
  }, [router]);

  const selectApp = useCallback(
    (app: EssexAppId) => {
      localStorage.setItem(APP_KEY, app);
      setSelectedApp(app);
      router.push(app === "subsidized-housing" ? "/cases/in-progress" : "/learning");
    },
    [router]
  );

  const clearApp = useCallback(() => {
    localStorage.removeItem(APP_KEY);
    setSelectedApp(null);
    router.push("/apps");
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(APP_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setSelectedApp(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        hydrated,
        isAuthenticated,
        selectedApp,
        loginWithEssex,
        selectApp,
        clearApp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
