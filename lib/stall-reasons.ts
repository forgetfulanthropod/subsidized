/** Top causes of subsidized-housing application delays (industry / PHA sources). */
export const STALL_REASONS = [
  {
    id: "missingDocumentation",
    label: "Missing or incomplete documentation",
    requiredDocuments: [
      "Government-issued photo ID",
      "Proof of income (pay stubs or tax return)",
      "Voucher / HAP packet",
    ],
    weight: 40,
  },
  {
    id: "applicantNonResponse",
    label: "Applicant non-response or unreachable",
    requiredDocuments: [
      "Signed intent-to-lease",
      "Updated contact verification",
    ],
    weight: 25,
  },
  {
    id: "incomeVerificationPending",
    label: "Income verification pending (employer delay)",
    requiredDocuments: [
      "Employer income verification letter",
      "Pay stubs (last 30 days)",
    ],
    weight: 20,
  },
  {
    id: "voucherInspectionDelay",
    label: "Voucher inspection or PHA coordination delay",
    requiredDocuments: [
      "HAP contract approval",
      "Housing quality standards inspection clearance",
    ],
    weight: 10,
  },
  {
    id: "landlordUnitHold",
    label: "Landlord or unit availability hold",
    requiredDocuments: ["Landlord W-9", "Draft lease agreement"],
    weight: 5,
  },
] as const;

export type StallReasonId = (typeof STALL_REASONS)[number]["id"];

export const MAX_MATCHING_VACANCIES = 5;

export function pickStallReason(seed: number): StallReasonId {
  const bucket = seed % 100;
  let cumulative = 0;
  for (const reason of STALL_REASONS) {
    cumulative += reason.weight;
    if (bucket < cumulative) return reason.id;
  }
  return STALL_REASONS[0].id;
}

export function getStallReason(id: StallReasonId | undefined) {
  return STALL_REASONS.find((r) => r.id === id);
}

export function formatStallReason(id: StallReasonId | undefined) {
  return getStallReason(id)?.label ?? "Unknown stall reason";
}

export function getRequiredDocuments(id: StallReasonId | undefined) {
  return getStallReason(id)?.requiredDocuments ?? [];
}

/** Most frequent stall reason across stalled applicants (for dashboard copy). */
export function getMostCommonStallReason(
  applicants: Array<{ status: string; stallReason?: StallReasonId }>
) {
  const counts = new Map<StallReasonId, number>();
  for (const a of applicants) {
    if (a.status !== "Stalled" || !a.stallReason) continue;
    counts.set(a.stallReason, (counts.get(a.stallReason) ?? 0) + 1);
  }
  let top: StallReasonId = STALL_REASONS[0].id;
  let max = 0;
  for (const [id, n] of counts) {
    if (n > max) {
      max = n;
      top = id;
    }
  }
  const total = [...counts.values()].reduce((s, n) => s + n, 0);
  const pct = total > 0 ? Math.round(((counts.get(top) ?? 0) / total) * 100) : 0;
  return { id: top, label: formatStallReason(top), count: counts.get(top) ?? 0, pct, total };
}
