"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestDocumentsButton } from "@/components/RequestDocumentsButton";
import { RequiredDocumentsAlert } from "@/components/RequiredDocumentsAlert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  formatDate,
  formatStatus,
  statusBadgeVariant,
} from "@/lib/utils";
import {
  formatStallReason,
  getRequiredDocuments,
} from "@/lib/stall-reasons";
import {
  CASE_MANAGERS,
  getCaseManagerById,
  type CaseManagerId,
} from "@/lib/users";
import { Badge } from "@/components/ui/badge";
import type { Applicant } from "@/types";

interface EscalatedCasePanelProps {
  applicant: Applicant;
}

export function EscalatedCasePanel({ applicant }: EscalatedCasePanelProps) {
  const queryClient = useQueryClient();
  const sender = getCaseManagerById(applicant.escalatedBy);
  const docs =
    applicant.requiredDocuments ??
    getRequiredDocuments(applicant.stallReason);

  const [pendingManagerId, setPendingManagerId] = useState<CaseManagerId | "">(
    applicant.assignedCaseManagerId ?? ""
  );
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeReason, setCloseReason] = useState("");

  useEffect(() => {
    setPendingManagerId(applicant.assignedCaseManagerId ?? "");
    setCloseReason("");
    setCloseOpen(false);
  }, [applicant.id, applicant.assignedCaseManagerId]);

  const mutation = useMutation({
    mutationFn: async (body: {
      action: "clear" | "reassign" | "close";
      caseManagerId?: CaseManagerId;
      notify?: boolean;
      reason?: string;
    }) => {
      const res = await fetch(`/api/applicants/${applicant.id}/escalation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update case");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicant", applicant.id] });
      setCloseOpen(false);
      setCloseReason("");
    },
  });

  const assignedId = applicant.assignedCaseManagerId ?? "";
  const managerChanged =
    pendingManagerId !== "" &&
    pendingManagerId !== assignedId;

  const busy = mutation.isPending;

  return (
    <>
      <div className="space-y-4 rounded-lg border border-amber-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {applicant.fullName}
            </p>
            <p className="text-sm text-slate-500">
              Escalated{" "}
              {applicant.escalatedAt ? formatDate(applicant.escalatedAt) : ""}{" "}
              · from {sender?.displayName ?? "Unknown"}
            </p>
          </div>
          <Badge variant={statusBadgeVariant(applicant.status)}>
            {formatStatus(applicant.status)}
          </Badge>
        </div>

        {applicant.stallReason && (
          <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span className="font-medium text-slate-900">Stall reason:</span>{" "}
            {formatStallReason(applicant.stallReason)}
          </p>
        )}

        <RequiredDocumentsAlert
          documents={docs}
          documentsRequestedAt={applicant.documentsRequestedAt}
        />

        <div className="flex flex-wrap gap-2">
          {applicant.status === "Stalled" && (
            <RequestDocumentsButton applicantId={applicant.id} />
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/applications/${applicant.id}`}>Open full case</Link>
          </Button>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Supervisor actions
          </p>

          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={() => setCloseOpen(true)}
          >
            Close case
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={() => mutation.mutate({ action: "clear" })}
          >
            Clear escalation
          </Button>

          <div className="space-y-2">
            <Label htmlFor={`reassign-${applicant.id}`}>Case manager</Label>
            <select
              id={`reassign-${applicant.id}`}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm sm:max-w-xs"
              value={pendingManagerId}
              disabled={busy}
              onChange={(e) =>
                setPendingManagerId(e.target.value as CaseManagerId)
              }
            >
              {CASE_MANAGERS.map((cm) => (
                <option key={cm.id} value={cm.id}>
                  {cm.displayName}
                </option>
              ))}
            </select>
            {managerChanged && (
              <Button
                type="button"
                size="sm"
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={() =>
                  mutation.mutate({
                    action: "reassign",
                    caseManagerId: pendingManagerId as CaseManagerId,
                    notify: true,
                  })
                }
              >
                Confirm and notify
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close case</DialogTitle>
            <DialogDescription>
              Confirm why you are closing {applicant.fullName}&apos;s case. This
              will be recorded in the case notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`close-reason-${applicant.id}`}>
                Reason for closing
              </Label>
              <textarea
                id={`close-reason-${applicant.id}`}
                rows={4}
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                placeholder="e.g. Applicant withdrew, duplicate application, failed to provide documents…"
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCloseOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={busy || closeReason.trim().length < 3}
                onClick={() =>
                  mutation.mutate({
                    action: "close",
                    reason: closeReason.trim(),
                  })
                }
              >
                Confirm close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
