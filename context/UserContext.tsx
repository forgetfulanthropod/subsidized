"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  APP_USERS,
  getUserById,
  STORAGE_KEY,
  type AppUser,
  type UserRole,
} from "@/lib/users";

interface UserContextValue {
  user: AppUser;
  setUserId: (id: UserRole) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(APP_USERS[0]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as UserRole | null;
    if (stored && getUserById(stored)) {
      setUser(getUserById(stored));
    }
  }, []);

  const setUserId = useCallback((id: UserRole) => {
    const next = getUserById(id);
    setUser(next);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
