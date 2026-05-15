"use client";

import { ChevronDown } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { UserAvatar } from "@/components/UserAvatar";
import { APP_USERS, type UserRole } from "@/lib/users";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserLogin() {
  const { user, setUserId } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm outline-none",
            "hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600/30"
          )}
          aria-label={`Signed in as ${user.displayName}, ${user.subtitle}. Switch user.`}
        >
          <UserAvatar
            src={user.avatarUrl}
            alt=""
            size={36}
            className="pointer-events-none"
          />
          <span className="flex flex-col items-start text-left leading-tight">
            <span className="text-sm font-semibold text-slate-900">
              {user.displayName}
            </span>
            <span className="text-xs text-slate-500">{user.subtitle}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        {APP_USERS.map((u) => (
          <DropdownMenuItem
            key={u.id}
            className={cn(
              "cursor-pointer gap-2.5 py-2.5",
              u.id === user.id && "bg-emerald-50 focus:bg-emerald-50"
            )}
            onSelect={() => setUserId(u.id)}
          >
            <UserAvatar src={u.avatarUrl} alt="" size={28} />
            <span className="flex flex-col text-left leading-tight">
              <span className="text-sm font-medium text-slate-900">
                {u.displayName}
              </span>
              <span className="text-xs text-slate-500">{u.subtitle}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
