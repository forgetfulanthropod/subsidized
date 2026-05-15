"use client";

import Link from "next/link";
import { StatusFlowButtons } from "@/components/StatusFlowButtons";
import { getMatchingVacancies } from "@/lib/matching";
import { formatDate, formatStatus, formatSubsidyType } from "@/lib/utils";
import type { Applicant, Vacancy } from "@/types";

interface ApplicantDetailExpandProps {
  applicant: Applicant;
  vacancies: Vacancy[];
}

export function ApplicantDetailExpand({
  applicant,
  vacancies,
}: ApplicantDetailExpandProps) {
  const matches = getMatchingVacancies(applicant, vacancies);
  const vacancyId = matches[0]?.id ?? applicant.assignedVacancyId;

  return (
    <div className="space-y-4 bg-slate-50 px-4 py-4">
      <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <p>
          <span className="font-medium text-slate-600">Email:</span>{" "}
          {applicant.email}
        </p>
        <p>
          <span className="font-medium text-slate-600">Phone:</span>{" "}
          {applicant.phone}
        </p>
        <p>
          <span className="font-medium text-slate-600">Voucher:</span>{" "}
          {applicant.voucherType}
        </p>
        <p>
          <span className="font-medium text-slate-600">Response:</span>{" "}
          {formatStatus(applicant.responseStatus)}
        </p>
        {applicant.accessibilityNeeds.length > 0 && (
          <p>
            <span className="font-medium text-slate-600">Accessibility:</span>{" "}
            {applicant.accessibilityNeeds.join(", ")}
          </p>
        )}
        {applicant.hasPets && (
          <p>
            <span className="font-medium text-slate-600">Pets:</span>{" "}
            {applicant.petTypes?.join(", ") ?? "Yes"}
          </p>
        )}
      </div>

      {matches.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">
            Matching units ({matches.length})
          </p>
          <ul className="flex flex-wrap gap-2">
            {matches.map((v) => (
              <li
                key={v.id}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
              >
                {v.address}, {v.city} · {formatSubsidyType(v.subsidyType)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <StatusFlowButtons
          applicant={applicant}
          vacancyId={vacancyId}
          menuOnly
        />
        <Link
          href={`/applications/${applicant.id}`}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          Full application →
        </Link>
      </div>
    </div>
  );
}
