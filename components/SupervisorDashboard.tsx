"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { EscalatedCasePanel } from "@/components/EscalatedCasePanel";
import { useUser } from "@/context/UserContext";
import { getSupervisorDashboard } from "@/lib/supervisor-dashboard";
import { getCaseManagerById, isSupervisor } from "@/lib/users";
import { formatDate, formatStatus } from "@/lib/utils";
import { getMostCommonStallReason, formatStallReason } from "@/lib/stall-reasons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Applicant } from "@/types";

const ESCALATED_COLLAPSED_KEY = "essex-haven-supervisor-escalated-collapsed";
const METRICS_COLLAPSED_KEY = "essex-haven-supervisor-metrics-collapsed";

export function SupervisorDashboard() {
  const { user } = useUser();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
  const activeId = selectedId ?? escalated[0]?.id ?? null;
  const selected = escalated.find((a) => a.id === activeId);
  const topStall = getMostCommonStallReason(applicants);

  return (
    <section className="mb-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Case manager KPI overview
        </h2>
        <p className="text-sm text-slate-600">
          Escalations and caseload health across your team
        </p>
        {topStall.total > 0 && (
          <p className="mt-2 text-sm text-slate-600">
            Top stall reason in caseload:{" "}
            <span className="font-medium text-amber-900">
              {formatStallReason(topStall.id)}
            </span>{" "}
            ({topStall.pct}% of {topStall.total} stalled cases)
          </p>
        )}
      </div>

      {escalated.length > 0 && (
        <CollapsibleSection
          storageKey={ESCALATED_COLLAPSED_KEY}
          className="rounded-lg border border-amber-200 bg-amber-50/50 p-4"
          headerClassName="p-0 hover:bg-transparent"
          title={
            <span className="flex items-center gap-2 text-base font-semibold text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              Manage escalated cases ({escalated.length})
            </span>
          }
          description={
            <span className="text-amber-800/90">
              Select a case to review documents, reassign, or clear escalation
              without leaving this dashboard.
            </span>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
            <ul className="max-h-80 space-y-1 overflow-y-auto rounded-md border border-amber-100 bg-white p-1">
              {escalated.map((a) => {
                const sender = getCaseManagerById(a.escalatedBy);
                const isActive = a.id === activeId;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className={cn(
                        "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-amber-100 ring-1 ring-amber-300"
                          : "hover:bg-amber-50"
                      )}
                    >
                      <p className="font-medium text-slate-900">{a.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {formatStatus(a.status)} · from{" "}
                        {sender?.displayName ?? "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {a.escalatedAt ? formatDate(a.escalatedAt) : ""}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
            {selected ? (
              <EscalatedCasePanel applicant={selected} />
            ) : (
              <p className="text-sm text-slate-500">Select an escalated case.</p>
            )}
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        storageKey={METRICS_COLLAPSED_KEY}
        title={
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <BarChart3 className="h-4 w-4" />
            Team metrics
          </span>
        }
      >
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
      </CollapsibleSection>
    </section>
  );
}
