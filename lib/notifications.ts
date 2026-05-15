import {
  appendAuditLog,
  getApplicants,
  readJson,
  saveApplicants,
  writeJson,
} from "@/lib/data";
import type { NotificationLogEntry } from "@/types";

export async function notifyApplicant(
  applicantId: string,
  vacancyId: string
) {
  const applicants = await getApplicants();
  const applicant = applicants.find((a) => a.id === applicantId);
  if (!applicant) return { success: false, error: "Applicant not found" };

  applicant.status = "Notified";
  applicant.responseStatus = "NoResponse";
  applicant.assignedVacancyId = vacancyId;

  const logs = await readJson<NotificationLogEntry[]>(
    "notifications-log.json"
  );
  logs.push({
    date: new Date().toISOString(),
    applicantId,
    vacancyId,
    type: "SMS+Email",
    message: `Invitation sent for unit ${vacancyId}`,
  });

  await writeJson("notifications-log.json", logs);
  await saveApplicants(applicants);
  await appendAuditLog({
    date: new Date().toISOString(),
    action: "NOTIFY",
    applicantId,
    vacancyId,
    author: "System",
    details: `Notification sent for vacancy ${vacancyId}`,
  });

  return { success: true, applicant };
}
