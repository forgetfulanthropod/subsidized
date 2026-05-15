"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getSupervisorDashboard } from "@/lib/supervisor-dashboard";
import { getCaseManagerById, isSupervisor } from "@/lib/users";
import { formatDate, formatStatus } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Applicant } from "@/types";

export function SupervisorDashboard() {
  const { user } = useUser();

  const { data: applicants = [], isLoading } = useQuery<Applicant[]>({
    queryKey: ["applicants"],
    queryFn: async () => {
      const res = await fetch("/api/applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return res.json();
    },
    enabled: isSupervisor(user.id),
  });

  if (!isSupervisor(user.id)) return null;

  if (isLoading) {
    return <p className="mb-6 text-sm text-slate-500">Loading supervisor overview…</p>;
  }

  const { escalated, kpis } = getSupervisorDashboard(applicants);

  return (
    <section className="mb-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Case manager KPI overview
        </h2>
        <p className="text-sm text-slate-600">
          Escalations and caseload health across your team
        </p>
      </div>

      {escalated.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              Escalated cases ({escalated.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 space-y-2 overflow-y-auto">
            {escalated.map((a) => {
              const sender = getCaseManagerById(a.escalatedBy);
              return (
                <Link
                  key={a.id}
                  href={`/applications/${a.id}`}
                  className="flex items-center justify-between rounded-md border border-amber-100 bg-white px-3 py-2 text-sm transition-colors hover:border-amber-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">{a.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {formatStatus(a.status)} · escalated{" "}
                      {a.escalatedAt ? formatDate(a.escalatedAt) : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-amber-800">
                      From {sender?.displayName ?? "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">{sender?.subtitle}</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <BarChart3 className="h-4 w-4" />
          Team metrics
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  {kpi.displayName}
                </CardTitle>
                <p className="text-xs text-slate-500">case manager</p>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-lg font-bold text-slate-900">{kpi.inProgress}</p>
                  <p className="text-xs text-slate-500">in progress</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-700">{kpi.stalled}</p>
                  <p className="text-xs text-slate-500">stalled</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-700">
                    {kpi.moveInsThisWeek}
                  </p>
                  <p className="text-xs text-slate-500">move-ins this week</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-700">{kpi.escalatedSent}</p>
                  <p className="text-xs text-slate-500">escalated</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
