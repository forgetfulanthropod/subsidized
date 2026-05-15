"use client";

import { getCaseManagerById } from "@/lib/users";
import type { CaseManagerId } from "@/lib/users";

type ClaimType = "applicant" | "vacancy";

export function ClaimControl({
  assignedCaseManagerId,
  onClick,
}: {
  type: ClaimType;
  id: string;
  assignedCaseManagerId?: CaseManagerId;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const manager = getCaseManagerById(assignedCaseManagerId);

  if (manager) {
    return (
      <span className="text-sm text-slate-700" onClick={onClick}>
        <span className="font-medium">{manager.displayName}</span>
        <span className="text-slate-500"> · {manager.subtitle}</span>
      </span>
    );
  }

  return (
    <span className="text-sm text-slate-500" onClick={onClick}>
      Unclaimed
    </span>
  );
}
