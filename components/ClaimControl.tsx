"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { getCaseManagerById, isCaseManager } from "@/lib/users";
import type { CaseManagerId } from "@/lib/users";

type ClaimType = "applicant" | "vacancy";

export function ClaimControl({
  type,
  id,
  assignedCaseManagerId,
  onClick,
}: {
  type: ClaimType;
  id: string;
  assignedCaseManagerId?: CaseManagerId;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/${type === "applicant" ? "applicants" : "vacancies"}/${id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseManagerId: user.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to claim");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["vacancies"] });
    },
  });

  const manager = getCaseManagerById(assignedCaseManagerId);

  if (manager) {
    return (
      <span className="text-sm text-slate-700" onClick={onClick}>
        <span className="font-medium">{manager.displayName}</span>
        <span className="text-slate-500"> · {manager.subtitle}</span>
      </span>
    );
  }

  if (!isCaseManager(user.id)) {
    return (
      <span className="text-sm text-slate-400" onClick={onClick}>
        Unclaimed
      </span>
    );
  }

  return (
    <button
      type="button"
      className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline disabled:opacity-50"
      disabled={mutation.isPending}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        mutation.mutate();
      }}
    >
      {mutation.isPending ? "Claiming…" : "Unclaimed — claim"}
    </button>
  );
}
