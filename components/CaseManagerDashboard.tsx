"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock,
  Mail,
  Users,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getCaseManagerDashboard } from "@/lib/case-manager-dashboard";
import { isCaseManager } from "@/lib/users";
import { formatDate, formatDaysSince, formatStatus } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Applicant } from "@/types";

export function CaseManagerDashboard() {
  const { user } = useUser();

  const { data: applicants = [], isLoading } = useQuery<Applicant[]>({
    queryKey: ["applicants"],
    queryFn: async () => {
      const res = await fetch("/api/applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return res.json();
    },
    enabled: isCaseManager(user.id),
  });

  if (!isCaseManager(user.id)) return null;

  const dashboard = getCaseManagerDashboard(applicants, user.id);

  if (isLoading) {
    return (
      <p className="mb-6 text-sm text-slate-500">Loading your caseload…</p>
    );
  }

  return (
    <section className="mb-8 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {user.displayName} — caseload overview
        </h2>
        <p className="text-sm text-slate-600">
          Your active tenants and priorities · {user.subtitle}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Your tenants in review"
          icon={Users}
          count={dashboard.tenantsInReview.length}
          empty="No tenants currently in your review queue."
        >
          {dashboard.tenantsInReview.slice(0, 5).map((a) => (
            <ApplicantRow
              key={a.id}
              name={a.fullName}
              href={`/applications/${a.id}`}
              meta={
                a.inReviewBy
                  ? `In review · ${formatStatus(a.status)}`
                  : formatStatus(a.status)
              }
            />
          ))}
          {dashboard.tenantsInReview.length > 5 && (
            <FooterLink href="/cases/completed" label="View completed cases" />
          )}
        </DashboardCard>

        <DashboardCard
          title="Longest since interaction"
          icon={Clock}
          count={dashboard.longestSinceInteraction.length}
          empty="No interaction history on file."
        >
          {dashboard.longestSinceInteraction.slice(0, 5).map((a) => (
            <ApplicantRow
              key={a.id}
              name={a.fullName}
              href={`/applications/${a.id}`}
              meta={
                a.lastInteractionDate
                  ? formatDaysSince(a.lastInteractionDate)
                  : "—"
              }
              highlight
            />
          ))}
        </DashboardCard>

        <DashboardCard
          title="New messages"
          icon={Mail}
          count={dashboard.newMessages.length}
          empty="No unread messages."
        >
          {dashboard.newMessages.slice(0, 5).map(({ applicant, message }) => (
            <ApplicantRow
              key={message.id}
              name={message.subject}
              href={`/applications/${applicant.id}`}
              meta={`${applicant.fullName} · ${formatDaysSince(message.date)}`}
            />
          ))}
        </DashboardCard>

        <DashboardCard
          title="Move-ins this week"
          icon={CalendarDays}
          count={dashboard.moveInsThisWeek.length}
          empty="No move-ins scheduled this week."
        >
          {dashboard.moveInsThisWeek.map((a) => (
            <ApplicantRow
              key={a.id}
              name={a.fullName}
              href={`/applications/${a.id}`}
              meta={
                a.moveInDate ? `Move-in ${formatDate(a.moveInDate)}` : "—"
              }
            />
          ))}
        </DashboardCard>
      </div>
    </section>
  );
}

function DashboardCard({
  title,
  icon: Icon,
  count,
  empty,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="h-4 w-4 text-emerald-700" />
            {title}
          </CardTitle>
          <Badge variant={count > 0 ? "default" : "secondary"}>{count}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm">
        {count === 0 ? (
          <p className="text-slate-500">{empty}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function ApplicantRow({
  name,
  href,
  meta,
  highlight,
}: {
  name: string;
  href: string;
  meta: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block rounded-md border border-slate-100 px-2 py-1.5 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
    >
      <p className="font-medium text-slate-900 line-clamp-1">{name}</p>
      <p
        className={
          highlight
            ? "text-xs font-medium text-amber-700"
            : "text-xs text-slate-500"
        }
      >
        {meta}
      </p>
    </Link>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block pt-1 text-xs font-medium text-emerald-700 hover:underline"
    >
      {label} →
    </Link>
  );
}
