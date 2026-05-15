"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Applicant } from "@/types";

interface StatusFlowButtonsProps {
  applicant: Applicant;
  vacancyId?: string;
}

export function StatusFlowButtons({ applicant, vacancyId }: StatusFlowButtonsProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: {
      action: string;
      vacancyId?: string;
    }) => {
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

  return (
    <div className="flex flex-wrap gap-1">
      {status === "Pending" && (
        <>
          <Button
            size="sm"
            disabled={busy}
            onClick={() => mutation.mutate({ action: "eligible" })}
          >
            Mark Eligible
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={() => mutation.mutate({ action: "ineligible" })}
          >
            Ineligible
          </Button>
        </>
      )}
      {status === "Eligible" && vacancyId && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => mutation.mutate({ action: "notify", vacancyId })}
        >
          Notify
        </Button>
      )}
      {status === "Notified" && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => mutation.mutate({ action: "schedule" })}
        >
          Schedule Move-In
        </Button>
      )}
      {status === "MoveInScheduled" && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => mutation.mutate({ action: "confirm" })}
        >
          Confirm Tenancy
        </Button>
      )}
    </div>
  );
}
