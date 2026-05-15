"use client";

import { useMemo, useState } from "react";
import { MoreVertical, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CaseReviewDetailDialog } from "@/components/CaseReviewDetailDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  filterInReviewByRecordType,
  IN_REVIEW_DISPLAY_LIMIT,
  isApplicantRecord,
  type InReviewRecordFilter,
} from "@/lib/case-manager-dashboard";
import { formatDate, formatStatus } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Applicant, Vacancy } from "@/types";

const FILTER_OPTIONS: { value: InReviewRecordFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "applicants", label: "Applicants" },
  { value: "tenants", label: "Tenants" },
];

interface InReviewQueueProps {
  items: Applicant[];
}

export function InReviewQueue({ items }: InReviewQueueProps) {
  const [recordFilter, setRecordFilter] = useState<InReviewRecordFilter>("all");
  const [dialogApplicant, setDialogApplicant] = useState<Applicant | null>(null);

  const { data: vacancies = [] } = useQuery<Vacancy[]>({
    queryKey: ["vacancies"],
    queryFn: async () => {
      const res = await fetch("/api/vacancies");
      if (!res.ok) throw new Error("Failed to fetch vacancies");
      return res.json();
    },
  });

  const filtered = useMemo(
    () => filterInReviewByRecordType(items, recordFilter),
    [items, recordFilter]
  );

  const displayed = filtered.slice(0, IN_REVIEW_DISPLAY_LIMIT);
  const applicantCount = items.filter(isApplicantRecord).length;
  const tenantCount = items.length - applicantCount;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-emerald-700" />
              In review
            </CardTitle>
            <Badge variant={items.length > 0 ? "default" : "secondary"}>
              {filtered.length}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRecordFilter(opt.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  recordFilter === opt.value
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {opt.label}
                {opt.value === "applicants" && ` (${applicantCount})`}
                {opt.value === "tenants" && ` (${tenantCount})`}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing in your review queue.</p>
          ) : (
            <>
              <ul className="max-h-80 space-y-1 overflow-y-auto">
                {displayed.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 rounded-md border border-slate-100 px-2 py-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {a.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isApplicantRecord(a) ? "Applicant" : "Tenant"} ·{" "}
                        {formatStatus(a.status)}
                        {a.lastInteractionDate &&
                          ` · ${formatDate(a.lastInteractionDate)}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label={`Actions for ${a.fullName}`}
                      onClick={() => setDialogApplicant(a)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              {filtered.length > IN_REVIEW_DISPLAY_LIMIT && (
                <p className="mt-2 text-xs text-slate-500">
                  Showing {IN_REVIEW_DISPLAY_LIMIT} of {filtered.length} in review
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CaseReviewDetailDialog
        applicant={dialogApplicant}
        vacancies={vacancies}
        open={dialogApplicant !== null}
        onOpenChange={(open) => {
          if (!open) setDialogApplicant(null);
        }}
      />
    </>
  );
}
