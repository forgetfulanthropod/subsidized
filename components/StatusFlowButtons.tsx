"use client";

import { Fragment } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Applicant } from "@/types";

interface StatusFlowButtonsProps {
  applicant: Applicant;
  vacancyId?: string;
  /** Compact actions menu (used in table detail expand) */
  menuOnly?: boolean;
}

export function StatusFlowButtons({
  applicant,
  vacancyId,
  menuOnly = false,
}: StatusFlowButtonsProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: { action: string; vacancyId?: string }) => {
      const res = await fetch(`/api/applicants/${applicant.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicant", applicant.id] });
    },
  });

  const { status } = applicant;
  const busy = mutation.isPending;

  const run = (action: string, vId?: string) => {
    mutation.mutate({ action, vacancyId: vId });
  };

  const menuItems: Array<{
    label: string;
    action: string;
    vacancyId?: string;
    destructive?: boolean;
  }> = [];

  if (status === "Pending") {
    menuItems.push(
      { label: "Mark eligible", action: "eligible" },
      { label: "Mark ineligible", action: "ineligible", destructive: true }
    );
  }
  if (status === "Eligible" && vacancyId) {
    menuItems.push({ label: "Notify", action: "notify", vacancyId });
  }
  if (status === "Notified") {
    menuItems.push({ label: "Schedule move-in", action: "schedule" });
  }
  if (status === "MoveInScheduled") {
    menuItems.push({ label: "Confirm tenancy", action: "confirm" });
  }

  if (menuItems.length === 0) return null;

  if (menuOnly) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            className="gap-1"
          >
            <MoreHorizontal className="h-4 w-4" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {menuItems.map((item, i) => (
            <Fragment key={item.action}>
              {i > 0 && item.destructive && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className={
                  item.destructive ? "text-red-600 focus:text-red-600" : ""
                }
                disabled={busy}
                onSelect={() => run(item.action, item.vacancyId)}
              >
                {item.label}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status === "Pending" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={busy}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem disabled={busy} onSelect={() => run("eligible")}>
              Mark eligible
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              disabled={busy}
              onSelect={() => run("ineligible")}
            >
              Mark ineligible
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          {status === "Eligible" && vacancyId && (
            <Button
              size="sm"
              disabled={busy}
              onClick={() => run("notify", vacancyId)}
            >
              Notify
            </Button>
          )}
          {status === "Notified" && (
            <Button size="sm" disabled={busy} onClick={() => run("schedule")}>
              Schedule Move-In
            </Button>
          )}
          {status === "MoveInScheduled" && (
            <Button size="sm" disabled={busy} onClick={() => run("confirm")}>
              Confirm Tenancy
            </Button>
          )}
        </>
      )}
    </div>
  );
}
