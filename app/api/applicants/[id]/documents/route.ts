import { NextResponse } from "next/server";
import {
  appendAuditLog,
  getApplicants,
  saveApplicants,
} from "@/lib/data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as {
    action: "approve" | "start-move-in";
  };

  const applicants = await getApplicants();
  const index = applicants.findIndex((a) => a.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applicant = applicants[index];
  const now = new Date().toISOString();
  const { v4: uuid } = await import("uuid");

  if (body.action === "approve") {
    if (!applicant.documentSubmissions?.length) {
      return NextResponse.json(
        { error: "No documents to approve" },
        { status: 400 }
      );
    }

    applicant.documentsApprovedAt = now;
    applicant.documentSubmissions = applicant.documentSubmissions.map((d) => ({
      ...d,
      verificationStatus: "verified" as const,
    }));

    applicant.notes.push({
      id: uuid(),
      date: now,
      text: "Document package approved by case manager.",
      author: "Case Manager",
    });

    await appendAuditLog({
      date: now,
      action: "APPROVE_DOCUMENTS",
      applicantId: id,
      author: "Case Manager",
      details: `${applicant.documentSubmissions.length} documents approved`,
    });
  } else if (body.action === "start-move-in") {
    if (!applicant.documentsApprovedAt) {
      return NextResponse.json(
        { error: "Approve documents before scheduling move-in" },
        { status: 400 }
      );
    }

    if (
      !["TenancyConfirmed", "Notified", "Eligible"].includes(applicant.status)
    ) {
      return NextResponse.json(
        { error: "Tenant is not eligible for move-in scheduling" },
        { status: 400 }
      );
    }

    applicant.status = "MoveInScheduled";
    applicant.responseStatus = "Scheduled";
    const moveIn = new Date();
    moveIn.setDate(moveIn.getDate() + 7);
    moveIn.setHours(12, 0, 0, 0);
    applicant.moveInDate = moveIn.toISOString();

    applicant.notes.push({
      id: uuid(),
      date: now,
      text: "Move-in scheduled after document approval.",
      author: "Case Manager",
    });

    await appendAuditLog({
      date: now,
      action: "START_MOVE_IN",
      applicantId: id,
      author: "Case Manager",
      details: `Move-in scheduled for ${applicant.moveInDate}`,
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  applicants[index] = applicant;
  await saveApplicants(applicants);

  return NextResponse.json(applicant);
}
