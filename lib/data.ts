import fs from "fs/promises";
import path from "path";
import type {
  Applicant,
  AuditLogEntry,
  CityInfo,
  NotificationLogEntry,
  Property,
  Vacancy,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

export async function readJson<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch {
    return [] as T;
  }
}

export async function writeJson<T>(filename: string, data: T) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function getVacancies() {
  return readJson<Vacancy[]>("vacancies.json");
}

export async function saveVacancies(vacancies: Vacancy[]) {
  return writeJson("vacancies.json", vacancies);
}

export async function getApplicants() {
  const applicants = await readJson<Applicant[]>("applicants.json");
  return applicants.sort(
    (a, b) =>
      new Date(a.applicationDate).getTime() -
      new Date(b.applicationDate).getTime()
  );
}

export async function saveApplicants(applicants: Applicant[]) {
  return writeJson("applicants.json", applicants);
}

export async function getApplicantById(id: string) {
  const applicants = await getApplicants();
  return applicants.find((a) => a.id === id);
}

export async function getCities() {
  return readJson<CityInfo[]>("cities.json");
}

export async function getProperties() {
  return readJson<Property[]>("properties.json");
}

export async function getAuditLog() {
  return readJson<AuditLogEntry[]>("audit-log.json");
}

export async function appendAuditLog(entry: Omit<AuditLogEntry, "id">) {
  const logs = await getAuditLog();
  const { v4: uuid } = await import("uuid");
  logs.push({ ...entry, id: uuid() });
  await writeJson("audit-log.json", logs);
}

export async function getNotificationLog() {
  return readJson<NotificationLogEntry[]>("notifications-log.json");
}

export async function getTenants() {
  const applicants = await getApplicants();
  return applicants.filter(
    (a) => a.status === "TenancyConfirmed" || a.status === "MovedIn"
  );
}
