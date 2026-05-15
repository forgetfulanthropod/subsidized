"use client";

import Link from "next/link";
import { MarkAsReviewedButton } from "@/components/MarkAsReviewedButton";
import { RequestDocumentsButton } from "@/components/RequestDocumentsButton";
import { RequiredDocumentsAlert } from "@/components/RequiredDocumentsAlert";
import { StatusFlowButtons } from "@/components/StatusFlowButtons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  getMatchingVacancies,
  getTopMatchingVacancies,
} from "@/lib/matching";
import {
  isApplicantRecord,
  isTenantRecord,
} from "@/lib/case-manager-dashboard";
import {
  formatStallReason,
  getRequiredDocuments,
} from "@/lib/stall-reasons";
import {
  formatCurrency,
  formatDate,
  formatInReviewBy,
  formatStatus,
  formatSubsidyType,
  statusBadgeVariant,
} from "@/lib/utils";
import type { Applicant, Vacancy } from "@/types";

interface CaseReviewDetailDialogProps {
  applicant: Applicant | null;
  vacancies: Vacancy[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CaseReviewDetailDialog({
  applicant,
  vacancies,
  open,
  onOpenChange,
}: CaseReviewDetailDialogProps) {
  if (!applicant) return null;

  const allMatches = getMatchingVacancies(applicant, vacancies);
  const matches = getTopMatchingVacancies(applicant, vacancies);
  const vacancyId = matches[0]?.id ?? applicant.assignedVacancyId;
  const requiredDocs =
    applicant.requiredDocuments ??
    getRequiredDocuments(applicant.stallReason);
  const recordLabel = isTenantRecord(applicant) ? "Tenant" : "Applicant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-6">
            {applicant.fullName}
            <Badge variant="outline">{recordLabel}</Badge>
            <Badge variant={statusBadgeVariant(applicant.status)}>
              {formatStatus(applicant.status)}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Applied {formatDate(applicant.applicationDate)}
            {applicant.inReviewBy &&
              ` · ${formatInReviewBy(
                applicant.inReviewBy.name,
                applicant.inReviewBy.title
              )}`}
          </p>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {applicant.status === "Stalled" && applicant.stallReason && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
              <span className="font-semibold">Stall reason:</span>{" "}
              {formatStallReason(applicant.stallReason)}
            </p>
          )}

          {applicant.status === "Stalled" && requiredDocs.length > 0 && (
            <RequiredDocumentsAlert
              documents={requiredDocs}
              documentsRequestedAt={applicant.documentsRequestedAt}
            />
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="font-medium text-slate-600">Email:</span>{" "}
              {applicant.email}
            </p>
            <p>
              <span className="font-medium text-slate-600">Phone:</span>{" "}
              {applicant.phone}
            </p>
            <p>
              <span className="font-medium text-slate-600">Household:</span>{" "}
              {applicant.householdSize}
            </p>
            <p>
              <span className="font-medium text-slate-600">Income:</span>{" "}
              {formatCurrency(applicant.income)}
            </p>
            <p>
              <span className="font-medium text-slate-600">Voucher:</span>{" "}
              {applicant.voucherType}
            </p>
            <p>
              <span className="font-medium text-slate-600">Cities:</span>{" "}
              {applicant.preferredCities.join(", ")}
            </p>
          </div>

          {isApplicantRecord(applicant) && matches.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-slate-700">
                Matching units ({matches.length}
                {allMatches.length > matches.length
                  ? ` of ${allMatches.length}`
                  : ""}
                )
              </p>
              <ul className="space-y-1">
                {matches.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-md border border-slate-100 px-2 py-1 text-xs"
                  >
                    {v.address}, {v.city} · {formatSubsidyType(v.subsidyType)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <MarkAsReviewedButton
              applicantId={applicant.id}
              onSuccess={() => onOpenChange(false)}
            />
            {applicant.status === "Stalled" && (
              <RequestDocumentsButton applicantId={applicant.id} />
            )}
            {isApplicantRecord(applicant) && (
              <StatusFlowButtons applicant={applicant} vacancyId={vacancyId} />
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/applications/${applicant.id}`}>Open full case</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
