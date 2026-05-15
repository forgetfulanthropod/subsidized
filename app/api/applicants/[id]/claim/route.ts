import { NextResponse } from "next/server";
import { z } from "zod";
import {
  appendAuditLog,
  getApplicants,
  saveApplicants,
} from "@/lib/data";
import type { CaseManagerId } from "@/types";

const bodySchema = z.object({
  caseManagerId: z.enum([
    "case-manager-1",
    "case-manager-2",
    "case-manager-3",
  ]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = bodySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const applicants = await getApplicants();
  const index = applicants.findIndex((a) => a.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applicant = applicants[index];
  if (applicant.assignedCaseManagerId) {
    return NextResponse.json(
      { error: "Already claimed by another case manager" },
      { status: 409 }
    );
  }

  applicant.assignedCaseManagerId = body.data.caseManagerId as CaseManagerId;
  applicant.inReviewBy = {
    name: body.data.caseManagerId === "case-manager-1"
      ? "A. Rodriguez"
      : body.data.caseManagerId === "case-manager-2"
        ? "M. Chen"
        : "J. Williams",
    title: "case manager",
  };

  applicants[index] = applicant;
  await saveApplicants(applicants);
  await appendAuditLog({
    date: new Date().toISOString(),
    action: "CLAIM_APPLICANT",
    applicantId: id,
    author: applicant.inReviewBy.name,
    details: `Applicant claimed by ${applicant.inReviewBy.name}`,
  });

  return NextResponse.json(applicant);
}
