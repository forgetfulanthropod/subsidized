import { NextResponse } from "next/server";
import {
  appendAuditLog,
  getApplicants,
  readJson,
  saveApplicants,
  writeJson,
} from "@/lib/data";
import { getCaseManagerById } from "@/lib/users";
import type { CaseManagerId } from "@/lib/users";
import type { NotificationLogEntry } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as {
    action: "clear" | "reassign" | "close";
    caseManagerId?: CaseManagerId;
    notify?: boolean;
    reason?: string;
  };

  const applicants = await getApplicants();
  const index = applicants.findIndex((a) => a.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applicant = applicants[index];
  const now = new Date().toISOString();
  const { v4: uuid } = await import("uuid");

  if (body.action === "clear") {
    delete applicant.escalatedAt;
    delete applicant.escalatedBy;
    await appendAuditLog({
      date: now,
      action: "CLEAR_ESCALATION",
      applicantId: id,
      author: "Supervisor",
      details: "Escalation cleared from supervisor dashboard",
    });
  } else if (body.action === "reassign" && body.caseManagerId) {
    const cm = getCaseManagerById(body.caseManagerId);
    applicant.assignedCaseManagerId = body.caseManagerId;
    if (cm) {
      applicant.inReviewBy = { name: cm.displayName, title: "case manager" };
    }

    if (body.notify) {
      const cmName = cm?.displayName ?? body.caseManagerId;
      applicant.notes.push({
        id: uuid(),
        date: now,
        text: `Supervisor reassigned this case to ${cmName} and sent notification.`,
        author: "Supervisor",
      });

      const logs = await readJson<NotificationLogEntry[]>(
        "notifications-log.json"
      );
      logs.push({
        date: now,
        applicantId: id,
        vacancyId: applicant.assignedVacancyId ?? "",
        type: "Internal",
        message: `Case reassigned to ${cmName} — supervisor notification`,
      });
      await writeJson("notifications-log.json", logs);
    }

    await appendAuditLog({
      date: now,
      action: body.notify ? "REASSIGN_NOTIFY" : "REASSIGN_CASE",
      applicantId: id,
      author: "Supervisor",
      details: body.notify
        ? `Reassigned to ${body.caseManagerId} with notification`
        : `Reassigned to ${body.caseManagerId}`,
    });
  } else if (body.action === "close") {
    const reason = body.reason?.trim();
    if (!reason || reason.length < 3) {
      return NextResponse.json(
        { error: "A reason for closing is required" },
        { status: 400 }
      );
    }

    applicant.status = "Rejected";
    applicant.responseStatus = "Declined";
    delete applicant.escalatedAt;
    delete applicant.escalatedBy;
    applicant.notes.push({
      id: uuid(),
      date: now,
      text: `Case closed by supervisor: ${reason}`,
      author: "Supervisor",
    });

    await appendAuditLog({
      date: now,
      action: "CLOSE_CASE",
      applicantId: id,
      author: "Supervisor",
      details: reason,
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  applicants[index] = applicant;
  await saveApplicants(applicants);

  return NextResponse.json(applicant);
}
