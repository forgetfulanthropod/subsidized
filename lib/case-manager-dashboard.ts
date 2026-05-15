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

  const documentUpdates = mine
    .filter(hasPendingDocumentReview)
    .sort((a, b) => {
      const aDate = latestSubmissionDate(a) ?? a.applicationDate;
      const bDate = latestSubmissionDate(b) ?? b.applicationDate;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  const moveInsThisWeek = mine
    .filter((a) => a.moveInDate && isThisWeek(a.moveInDate))
    .sort(
      (a, b) =>
        new Date(a.moveInDate!).getTime() - new Date(b.moveInDate!).getTime()
    );

  return {
    tenantsInReview,
    longestSinceInteraction,
    documentUpdates,
    moveInsThisWeek,
  };
}

export function hasPendingDocumentReview(applicant: Applicant) {
  if (!applicant.documentSubmissions?.length) return false;
  if (applicant.documentsApprovedAt) return false;
  return isTenantRecord(applicant);
}

export function latestSubmissionDate(applicant: Applicant) {
  const dates = applicant.documentSubmissions?.map((d) => d.submittedAt) ?? [];
  if (dates.length === 0) return undefined;
  return dates.sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )[0];
}

export function canStartMoveInFromDocuments(applicant: Applicant) {
  return (
    Boolean(applicant.documentsApprovedAt) &&
    ["TenancyConfirmed", "Notified", "Eligible"].includes(applicant.status)
  );
}
