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

  if (applicant.status !== "Stalled") {
    return NextResponse.json(
      { error: "Only stalled cases support document requests" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  applicant.documentsRequestedAt = now;

  const { v4: uuid } = await import("uuid");
  applicant.notes.push({
    id: uuid(),
    date: now,
    text: "Document request sent to applicant (ID, income verification, voucher paperwork).",
    author: "Case Manager",
  });

  applicants[index] = applicant;
  await saveApplicants(applicants);
  await appendAuditLog({
    date: now,
    action: "REQUEST_DOCUMENTS",
    applicantId: id,
    author: "Staff",
    details: "Documentation request issued for stalled case",
  });

  return NextResponse.json(applicant);
}
