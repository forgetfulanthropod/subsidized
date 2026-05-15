"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { DocumentReviewDialog } from "@/components/DocumentReviewDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOVE_INS_SCROLL_THRESHOLD } from "@/lib/case-manager-dashboard";
import { formatDaysSince } from "@/lib/utils";
import { latestSubmissionDate } from "@/lib/case-manager-dashboard";
import type { Applicant } from "@/types";

interface DocumentUpdatesQueueProps {
  tenants: Applicant[];
}

export function DocumentUpdatesQueue({ tenants }: DocumentUpdatesQueueProps) {
  const [selected, setSelected] = useState<Applicant | null>(null);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-emerald-700" />
              Document updates
            </CardTitle>
            <Badge variant={tenants.length > 0 ? "default" : "secondary"}>
              {tenants.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          {tenants.length === 0 ? (
            <p className="text-sm text-slate-500">No pending document updates.</p>
          ) : (
            <ul
              className={
                tenants.length > MOVE_INS_SCROLL_THRESHOLD
                  ? "max-h-52 space-y-2 overflow-y-auto pr-1"
                  : "space-y-2"
              }
            >
              {tenants.map((tenant) => {
                const latest = latestSubmissionDate(tenant);
                const uncertain =
                  tenant.documentSubmissions?.filter(
                    (d) => d.verificationStatus === "uncertain"
                  ).length ?? 0;
                return (
                  <li
                    key={tenant.id}
                    className="flex items-center gap-2 rounded-md border border-slate-100 px-2 py-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {tenant.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tenant.documentSubmissions?.length ?? 0} doc
                        {(tenant.documentSubmissions?.length ?? 0) !== 1
                          ? "s"
                          : ""}
                        {uncertain > 0 && ` · ${uncertain} need review`}
                        {latest && ` · ${formatDaysSince(latest)}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-8"
                      onClick={() => setSelected(tenant)}
                    >
                      Review
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <DocumentReviewDialog
        applicant={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}
