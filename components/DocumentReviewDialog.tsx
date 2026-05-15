"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { DocumentPlaceholder } from "@/components/DocumentPlaceholder";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  canStartMoveInFromDocuments,
  isTenantRecord,
} from "@/lib/case-manager-dashboard";
import { cn, formatDate, formatStatus } from "@/lib/utils";
import type { Applicant, DocumentSubmission } from "@/types";

interface DocumentReviewDialogProps {
  applicant: Applicant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentReviewDialog({
  applicant,
  open,
  onOpenChange,
}: DocumentReviewDialogProps) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (action: "approve" | "start-move-in") => {
      const res = await fetch(`/api/applicants/${applicant!.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Request failed");
      }
      return res.json();
    },
    onSuccess: (_data, action) => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicant", applicant?.id] });
      if (action === "start-move-in") onOpenChange(false);
    },
  });

  const docs = applicant?.documentSubmissions ?? [];
  const selected = docs.find((d) => d.id === selectedId) ?? null;

  const docKey = docs.map((d) => d.id).join(",");

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      return;
    }
    if (docs.length > 0) {
      setSelectedId((prev) =>
        prev && docs.some((d) => d.id === prev) ? prev : docs[0].id
      );
    } else {
      setSelectedId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- docKey tracks submission set
  }, [open, applicant?.id, docKey]);

  if (!applicant) return null;

  const approved = Boolean(applicant.documentsApprovedAt);
  const showMoveIn =
    isTenantRecord(applicant) &&
    ["TenancyConfirmed", "Notified", "Eligible"].includes(applicant.status);
  const moveInReady = canStartMoveInFromDocuments(applicant);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{applicant.fullName}</DialogTitle>
          <DialogDescription>
            Incoming documents · {formatStatus(applicant.status)}
          </DialogDescription>
        </DialogHeader>

        {docs.length === 0 ? (
          <p className="text-sm text-slate-500">No documents on file.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
            <ul className="space-y-2" role="listbox" aria-label="Documents">
              {docs.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  doc={doc}
                  selected={doc.id === selectedId}
                  onSelect={() => setSelectedId(doc.id)}
                />
              ))}
            </ul>

            <div
              className={cn(
                "flex min-h-[240px] flex-col rounded-lg border border-slate-200 bg-slate-50/80 p-4",
                !selected && "items-center justify-center"
              )}
            >
              {selected ? (
                <DocumentPlaceholder label={selected.label} className="flex-1" />
              ) : (
                <p className="text-sm text-slate-500">
                  Select a document to preview
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Button
            type="button"
            size="sm"
            disabled={mutation.isPending || approved || docs.length === 0}
            onClick={() => mutation.mutate("approve")}
          >
            {approved ? "Approved" : "Approve"}
          </Button>
          {showMoveIn && (
            <Button
              type="button"
              size="sm"
              variant="default"
              className="bg-emerald-700 hover:bg-emerald-800"
              disabled={
                mutation.isPending ||
                !moveInReady ||
                applicant.status === "MoveInScheduled"
              }
              onClick={() => mutation.mutate("start-move-in")}
            >
              Start move-in
            </Button>
          )}
        </div>
        {showMoveIn && !approved && docs.length > 0 && (
          <p className="text-xs text-slate-500">
            Approve documents before starting move-in.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DocumentListItem({
  doc,
  selected,
  onSelect,
}: {
  doc: DocumentSubmission;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
          selected
            ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200"
            : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
        )}
      >
        {doc.verificationStatus === "verified" ? (
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
            aria-hidden
          />
        ) : (
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800"
            aria-hidden
          >
            <HelpCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{doc.label}</p>
          <p className="text-xs text-slate-500">
            Received {formatDate(doc.submittedAt)}
            {doc.verificationStatus === "verified"
              ? " · Auto-verified"
              : " · AI uncertain"}
          </p>
        </div>
      </button>
    </li>
  );
}
