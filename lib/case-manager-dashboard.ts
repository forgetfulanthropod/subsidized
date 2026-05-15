import { isThisWeek } from "@/lib/utils";
import type { Applicant } from "@/types";
import type { UserRole } from "@/lib/users";

export function isAssignedToManager(applicant: Applicant, managerId: UserRole) {
  return applicant.assignedCaseManagerId === managerId;
}

export function isTenantInReview(applicant: Applicant) {
  if (applicant.status === "TenancyConfirmed" || applicant.status === "MovedIn") {
    return applicant.inReviewBy?.title === "case manager";
  }
  return ["Eligible", "Notified", "MoveInScheduled"].includes(applicant.status);
}

export function getCaseManagerDashboard(applicants: Applicant[], managerId: UserRole) {
  const mine = applicants.filter((a) => isAssignedToManager(a, managerId));

  const tenantsInReview = mine
    .filter(isTenantInReview)
    .sort(
      (a, b) =>
        new Date(a.applicationDate).getTime() -
        new Date(b.applicationDate).getTime()
    );

  const longestSinceInteraction = mine
    .filter((a) => a.lastInteractionDate)
    .sort(
      (a, b) =>
        new Date(a.lastInteractionDate!).getTime() -
        new Date(b.lastInteractionDate!).getTime()
    );

  const newMessages = mine.flatMap((applicant) =>
    (applicant.messages ?? [])
      .filter((m) => !m.read)
      .map((message) => ({ applicant, message }))
  );

  newMessages.sort(
    (a, b) =>
      new Date(b.message.date).getTime() - new Date(a.message.date).getTime()
  );

  const moveInsThisWeek = mine
    .filter((a) => a.moveInDate && isThisWeek(a.moveInDate))
    .sort(
      (a, b) =>
        new Date(a.moveInDate!).getTime() - new Date(b.moveInDate!).getTime()
    );

  return {
    tenantsInReview,
    longestSinceInteraction,
    newMessages,
    moveInsThisWeek,
  };
}
