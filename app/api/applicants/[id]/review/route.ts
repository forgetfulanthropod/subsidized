import { NextResponse } from "next/server";
import {
  appendAuditLog,
  getApplicants,
  saveApplicants,
} from "@/lib/data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const applicants = await getApplicants();
  const index = applicants.findIndex((a) => a.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applicant = applicants[index];
  const now = new Date().toISOString();
  const { v4: uuid } = await import("uuid");

  applicant.reviewedAt = now;
  delete applicant.inReviewBy;

  applicant.notes.push({
    id: uuid(),
    date: now,
    text: "Marked as reviewed by case manager.",
    author: "Case Manager",
  });

  applicants[index] = applicant;
  await saveApplicants(applicants);

  await appendAuditLog({
    date: now,
    action: "MARK_REVIEWED",
    applicantId: id,
    author: "Case Manager",
    details: "Removed from in-review queue",
  });

  return NextResponse.json(applicant);
}
