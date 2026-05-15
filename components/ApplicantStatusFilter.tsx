"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatStatus } from "@/lib/utils";
import type { Applicant } from "@/types";

export const APPLICANTS_TAB_STATUSES: Applicant["status"][] = [
  "Pending",
  "Eligible",
  "Notified",
  "MoveInScheduled",
  "Stalled",
  "MovedIn",
  "Ineligible",
  "Rejected",
];

export const DEFAULT_APPLICANT_STATUS_SELECTION = new Set<Applicant["status"]>([
  "Pending",
  "Eligible",
  "Notified",
]);

interface ApplicantStatusFilterProps {
  selected: Set<Applicant["status"]>;
  soloStatus: Applicant["status"] | null;
  multiselect: boolean;
  onSelectedChange: (next: Set<Applicant["status"]>) => void;
  onSoloStatusChange: (status: Applicant["status"] | null) => void;
  onMultiselectChange: (enabled: boolean) => void;
}

export function ApplicantStatusFilter({
  selected,
  soloStatus,
  multiselect,
  onSelectedChange,
  onSoloStatusChange,
  onMultiselectChange,
}: ApplicantStatusFilterProps) {
  const toggleStatus = (status: Applicant["status"], checked: boolean) => {
    onSoloStatusChange(null);
    const next = new Set(selected);
    if (checked) next.add(status);
    else next.delete(status);
    onSelectedChange(next);
  };

  const filterSolo = (status: Applicant["status"]) => {
    onSoloStatusChange(status);
    onSelectedChange(new Set([status]));
    onMultiselectChange(false);
  };

  const restoreDefaultSelection = () => {
    onSoloStatusChange(null);
    onMultiselectChange(true);
    onSelectedChange(new Set(DEFAULT_APPLICANT_STATUS_SELECTION));
  };

  return (
    <div className="w-full space-y-2 sm:col-span-2 lg:col-span-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="status-multiselect"
          checked={multiselect && !soloStatus}
          onCheckedChange={(c) => {
            const on = c === true;
            onMultiselectChange(on);
            if (on) {
              onSoloStatusChange(null);
            } else if (soloStatus) {
              onSoloStatusChange(null);
            }
          }}
        />
        <button
          type="button"
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          onClick={restoreDefaultSelection}
        >
          Multiselect
        </button>
        {soloStatus && (
          <button
            type="button"
            className="text-xs font-medium text-emerald-700 hover:underline"
            onClick={restoreDefaultSelection}
          >
            Clear solo filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {APPLICANTS_TAB_STATUSES.map((status) => {
          const inSet = selected.has(status);
          const isSolo = soloStatus === status;
          const pillActive = soloStatus ? isSolo : inSet;

          return (
            <div
              key={status}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 transition-colors",
                pillActive
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-white"
              )}
            >
              <Checkbox
                id={`status-${status}`}
                checked={inSet}
                onCheckedChange={(c) => {
                  onSoloStatusChange(null);
                  if (!multiselect) onMultiselectChange(true);
                  toggleStatus(status, c === true);
                }}
                aria-label={`Include ${formatStatus(status)}`}
              />
              <button
                type="button"
                className={cn(
                  "text-sm font-medium underline-offset-2 hover:underline",
                  isSolo ? "text-emerald-800" : "text-slate-700"
                )}
                onClick={() => filterSolo(status)}
              >
                {formatStatus(status)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
