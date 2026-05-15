"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Applicant, CityInfo, Vacancy } from "@/types";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import { StatusFlowButtons } from "@/components/StatusFlowButtons";

interface CityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacancy: Vacancy | null;
  cityInfo: CityInfo | null;
  matchedApplicants: Applicant[];
}

export function CityModal({
  open,
  onOpenChange,
  vacancy,
  cityInfo,
  matchedApplicants,
}: CityModalProps) {
  if (!vacancy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{vacancy.address}</DialogTitle>
          <DialogDescription>
            {vacancy.city} · {vacancy.metroArea} · {vacancy.unitType}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Rent:</span> {formatCurrency(vacancy.rent)}
            </p>
            <p>
              <span className="font-medium">Subsidy:</span> {vacancy.subsidyType}
            </p>
            <p>
              <span className="font-medium">Available:</span>{" "}
              {formatDate(vacancy.availableDate)}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <Badge variant="secondary">{formatStatus(vacancy.status)}</Badge>
            </p>
            <div className="flex flex-wrap gap-1">
              {vacancy.accessibility.wheelchair && (
                <Badge variant="outline">Wheelchair</Badge>
              )}
              {vacancy.accessibility.hearingVisual && (
                <Badge variant="outline">Hearing/Visual</Badge>
              )}
              {vacancy.petFriendly && <Badge variant="outline">Pet Friendly</Badge>}
            </div>
            <p className="text-slate-600">{vacancy.petPolicy}</p>
          </div>

          {cityInfo && (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">About {cityInfo.city}</p>
              <p className="text-slate-600">{cityInfo.description}</p>
              <p>
                <span className="font-medium">Schools:</span> {cityInfo.schools}
              </p>
              <p>
                <span className="font-medium">Transit:</span> {cityInfo.transit}
              </p>
              <div className="flex flex-wrap gap-1">
                {cityInfo.amenities.map((a) => (
                  <Badge key={a} variant="secondary">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-2 font-medium">
            Matched Applicants ({matchedApplicants.length})
          </h4>
          {matchedApplicants.length === 0 ? (
            <p className="text-sm text-slate-500">No matching applicants found.</p>
          ) : (
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {matchedApplicants.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 p-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{a.fullName}</p>
                    <p className="text-slate-500">
                      {formatStatus(a.status)} · Applied{" "}
                      {formatDate(a.applicationDate)}
                    </p>
                  </div>
                  {(a.status === "Eligible" || a.status === "Pending") && (
                    <StatusFlowButtons applicant={a} vacancyId={vacancy.id} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
