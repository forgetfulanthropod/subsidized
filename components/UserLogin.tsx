"use client";

import { LogIn } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { APP_USERS, type UserRole } from "@/lib/users";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserLogin() {
  const { user, setUserId } = useUser();

  return (
    <div className="flex items-center gap-2">
      <LogIn className="hidden h-4 w-4 text-slate-400 sm:block" />
      <div className="space-y-0.5">
        <Label className="sr-only">Sign in as</Label>
        <Select
          value={user.id}
          onValueChange={(v) => setUserId(v as UserRole)}
        >
          <SelectTrigger className="h-9 w-[160px] border-slate-300 text-sm">
            <SelectValue placeholder="Sign in" />
          </SelectTrigger>
          <SelectContent align="end">
            {APP_USERS.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
