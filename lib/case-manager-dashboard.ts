import { isThisWeek } from "@/lib/utils";
import type { Applicant } from "@/types";
import type { UserRole } from "@/lib/users";

export const IN_REVIEW_DISPLAY_LIMIT = 35;
/** Minimum active applicants (Eligible / Notified / Move-in scheduled) per case manager queue. */
export const MIN_APPLICANTS_IN_REVIEW = 12;
export const MOVE_INS_THIS_WEEK_CAP = 11;
export const MOVE_INS_SCROLL_THRESHOLD = 5;

export type InReviewRecordFilter = "all" | "applicants" | "tenants";

export function isAssignedToManager(applicant: Applicant, managerId: UserRole) {
  return applicant.assignedCaseManagerId === managerId;
}

export function isTenantRecord(applicant: Applicant) {
  return applicant.status === "TenancyConfirmed" || applicant.status === "MovedIn";
}

export function isApplicantRecord(applicant: Applicant) {
  return !isTenantRecord(applicant);
}

export function isInReview(applicant: Applicant) {
  if (applicant.reviewedAt) return false;

  if (isTenantRecord(applicant)) {
    return applicant.inReviewBy?.title === "case manager";
  }

  return ["Eligible", "Notified", "MoveInScheduled"].includes(applicant.status);
}

/** @deprecated use isInReview */
export function isTenantInReview(applicant: Applicant) {
  return isInReview(applicant);
}

export function filterInReviewByRecordType(
  list: Applicant[],
  recordFilter: InReviewRecordFilter
) {
  if (recordFilter === "applicants") {
    return list.filter(isApplicantRecord);
  }
  if (recordFilter === "tenants") {
    return list.filter(isTenantRecord);
  }
  return list;
}

export function getCaseManagerDashboard(applicants: Applicant[], managerId: UserRole) {
  const mine = applicants.filter((a) => isAssignedToManager(a, managerId));

  const tenantsInReview = mine
    .filter(isInReview)
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
