import { NextResponse } from "next/server";
import { z } from "zod";
import {
  appendAuditLog,
  getApplicants,
  saveApplicants,
} from "@/lib/data";
import { notifyApplicant } from "@/lib/notifications";

const bodySchema = z.object({
  action: z.enum([
    "eligible",
    "ineligible",
    "notify",
    "schedule",
    "confirm",
  ]),
  vacancyId: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = bodySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { action, vacancyId } = body.data;

  if (action === "notify") {
    if (!vacancyId) {
      return NextResponse.json(
        { error: "vacancyId required for notify" },
        { status: 400 }
      );
    }
    const result = await notifyApplicant(id, vacancyId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(result.applicant);
  }

  const applicants = await getApplicants();
  const index = applicants.findIndex((a) => a.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applicant = applicants[index];

  switch (action) {
    case "eligible":
      applicant.status = "Eligible";
      break;
    case "ineligible":
      applicant.status = "Ineligible";
      break;
    case "schedule":
      applicant.status = "MoveInScheduled";
      applicant.responseStatus = "Scheduled";
      break;
    case "confirm":
      applicant.status = "TenancyConfirmed";
      applicant.responseStatus = "Contacted";
      if (applicant.assignedVacancyId) {
        const { getVacancies, saveVacancies } = await import("@/lib/data");
        const vacancies = await getVacancies();
        const v = vacancies.find((x) => x.id === applicant.assignedVacancyId);
        if (v) {
          v.status = "Leased";
          await saveVacancies(vacancies);
        }
      }
      break;
  }

  applicants[index] = applicant;
  await saveApplicants(applicants);
  await appendAuditLog({
    date: new Date().toISOString(),
    action: action.toUpperCase(),
    applicantId: id,
    vacancyId: applicant.assignedVacancyId,
    author: "Staff",
    details: `Status updated to ${applicant.status}`,
  });

  return NextResponse.json(applicant);
}
