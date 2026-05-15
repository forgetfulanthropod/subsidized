import type { Applicant } from "@/types";
import type { CaseManagerId } from "@/lib/users";
import { CASE_MANAGERS } from "@/lib/users";
import { isThisWeek } from "@/lib/utils";

export interface CaseManagerKpi {
  id: CaseManagerId;
  displayName: string;
  inProgress: number;
  stalled: number;
  moveInsThisWeek: number;
  escalatedSent: number;
}

export function getSupervisorDashboard(applicants: Applicant[]) {
  const escalated = applicants
    .filter((a) => a.escalatedAt && a.escalatedBy)
    .sort(
      (a, b) =>
        new Date(b.escalatedAt!).getTime() - new Date(a.escalatedAt!).getTime()
    );

  const kpis: CaseManagerKpi[] = CASE_MANAGERS.map((cm) => {
    const mine = applicants.filter((a) => a.assignedCaseManagerId === cm.id);
    return {
      id: cm.id,
      displayName: cm.displayName,
      inProgress: mine.filter((a) =>
        ["Pending", "Eligible", "Notified", "MoveInScheduled"].includes(a.status)
      ).length,
      stalled: mine.filter((a) => a.status === "Stalled").length,
      moveInsThisWeek: mine.filter(
        (a) => a.moveInDate && isThisWeek(a.moveInDate)
      ).length,
      escalatedSent: applicants.filter((a) => a.escalatedBy === cm.id).length,
    };
  });

  return { escalated, kpis };
}
