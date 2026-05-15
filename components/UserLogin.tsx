"use client";

import { useUser } from "@/context/UserContext";
import { UserAvatar } from "@/components/UserAvatar";
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
    <div className="flex items-center gap-3">
      <UserAvatar src={user.avatarUrl} alt={user.displayName} size={40} />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold leading-tight text-slate-900">
          {user.displayName}
        </p>
        <p className="text-xs text-slate-500">{user.subtitle}</p>
        <Label className="sr-only">Switch user</Label>
        <Select
          value={user.id}
          onValueChange={(v) => setUserId(v as UserRole)}
        >
          <SelectTrigger className="mt-1 h-7 w-[140px] border-slate-200 text-xs">
            <SelectValue placeholder="Switch role" />
          </SelectTrigger>
          <SelectContent align="end">
            {APP_USERS.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                <span className="flex items-center gap-2">
                  <UserAvatar src={u.avatarUrl} alt={u.displayName} size={20} />
                  <span>
                    {u.displayName}
                    <span className="block text-xs text-slate-500">
                      {u.subtitle}
                    </span>
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
