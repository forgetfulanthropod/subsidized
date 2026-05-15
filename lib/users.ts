export type UserRole = "case-manager-1" | "case-manager-2" | "case-manager-3" | "supervisor";

export type CaseManagerId = Extract<
  UserRole,
  "case-manager-1" | "case-manager-2" | "case-manager-3"
>;

export interface AppUser {
  id: UserRole;
  displayName: string;
  subtitle: string;
  reviewerName: string;
  reviewerTitle: string;
  avatarUrl: string;
}

function avatar(seed: string, background: string) {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${background}`;
}

export const APP_USERS: AppUser[] = [
  {
    id: "case-manager-1",
    displayName: "A. Rodriguez",
    subtitle: "case manager",
    reviewerName: "A. Rodriguez",
    reviewerTitle: "case manager",
    avatarUrl: avatar("a-rodriguez", "e2e8f0"),
  },
  {
    id: "case-manager-2",
    displayName: "M. Chen",
    subtitle: "case manager",
    reviewerName: "M. Chen",
    reviewerTitle: "case manager",
    avatarUrl: avatar("m-chen", "dbeafe"),
  },
  {
    id: "case-manager-3",
    displayName: "J. Williams",
    subtitle: "case manager",
    reviewerName: "J. Williams",
    reviewerTitle: "case manager",
    avatarUrl: avatar("j-williams", "d1fae5"),
  },
  {
    id: "supervisor",
    displayName: "F. Smith",
    subtitle: "supervisor",
    reviewerName: "F. Smith",
    reviewerTitle: "supervisor",
    avatarUrl: avatar("f-smith", "ede9fe"),
  },
];

export const CASE_MANAGERS = APP_USERS.filter((u) =>
  u.id.startsWith("case-manager")
) as Array<AppUser & { id: CaseManagerId }>;

export function getUserById(id: UserRole) {
  return APP_USERS.find((u) => u.id === id) ?? APP_USERS[0];
}

export function getCaseManagerById(id: CaseManagerId | undefined) {
  if (!id) return undefined;
  return CASE_MANAGERS.find((u) => u.id === id);
}

export function getCaseManagerDisplayName(id: CaseManagerId | undefined) {
  return getCaseManagerById(id)?.displayName ?? null;
}

export const STORAGE_KEY = "essex-haven-user";

export function isCaseManager(id: UserRole) {
  return id.startsWith("case-manager");
}

export function isSupervisor(id: UserRole) {
  return id === "supervisor";
}
