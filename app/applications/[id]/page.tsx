"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusFlowButtons } from "@/components/StatusFlowButtons";
import { getMatchingVacancies } from "@/lib/matching";
import { formatCurrency, formatDate, formatStatus, formatSubsidyType } from "@/lib/utils";
import type { Applicant, Vacancy } from "@/types";

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: applicant, isLoading } = useQuery<Applicant>({
    queryKey: ["applicant", id],
    queryFn: async () => {
      const res = await fetch(`/api/applicants/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const { data: vacancies = [] } = useQuery<Vacancy[]>({
    queryKey: ["vacancies"],
    queryFn: async () => {
      const res = await fetch("/api/vacancies");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  if (!applicant) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-slate-500">Applicant not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/applicants">Back to applicants</Link>
        </Button>
      </main>
    );
  }

  const matches = getMatchingVacancies(applicant, vacancies);
  const vacancyId = matches[0]?.id ?? applicant.assignedVacancyId;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/applicants">← Back</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{applicant.fullName}</CardTitle>
              <p className="text-slate-500">
                Applied {formatDate(applicant.applicationDate)}
              </p>
            </div>
            <Badge>{applicant.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <p>
              <span className="font-medium">Email:</span> {applicant.email}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {applicant.phone}
            </p>
            <p>
              <span className="font-medium">Household:</span>{" "}
              {applicant.householdSize}
            </p>
            <p>
              <span className="font-medium">Income:</span>{" "}
              {formatCurrency(applicant.income)}
            </p>
            <p>
              <span className="font-medium">Voucher:</span> {applicant.voucherType}
            </p>
            <p>
              <span className="font-medium">Response:</span>{" "}
              {applicant.responseStatus}
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium">Preferred cities:</span>{" "}
              {applicant.preferredCities.join(", ")}
            </p>
            {applicant.accessibilityNeeds.length > 0 && (
              <p className="sm:col-span-2">
                <span className="font-medium">Accessibility:</span>{" "}
                {applicant.accessibilityNeeds.join(", ")}
              </p>
            )}
            {applicant.hasPets && (
              <p className="sm:col-span-2">
                <span className="font-medium">Pets:</span>{" "}
                {applicant.petTypes?.join(", ") ?? "Yes"}
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-medium">Case actions</h3>
            <StatusFlowButtons applicant={applicant} vacancyId={vacancyId} />
          </div>

          <div>
            <h3 className="mb-2 font-medium">
              Matching vacancies ({matches.length})
            </h3>
            {matches.length === 0 ? (
              <p className="text-sm text-slate-500">No compatible units.</p>
            ) : (
              <ul className="space-y-2">
                {matches.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-md border border-slate-100 p-3 text-sm"
                  >
                    <p className="font-medium">{v.address}</p>
                    <p className="text-slate-500">
                      {v.city} · {formatSubsidyType(v.subsidyType)} ·{" "}
                      {formatStatus(v.status)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {applicant.notes.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">Notes</h3>
              <ul className="space-y-2">
                {applicant.notes.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-md bg-slate-50 p-3 text-sm"
                  >
                    <p className="text-xs text-slate-500">
                      {formatDate(n.date)} · {n.author}
                    </p>
                    <p>{n.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
