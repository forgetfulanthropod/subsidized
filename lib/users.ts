export type UserRole = "case-manager-1" | "case-manager-2" | "case-manager-3" | "supervisor";

export interface AppUser {
  id: UserRole;
  label: string;
  reviewerName: string;
  reviewerTitle: string;
}

export const APP_USERS: AppUser[] = [
  {
    id: "case-manager-1",
    label: "Case Manager 1",
    reviewerName: "A. Rodriguez",
    reviewerTitle: "case manager",
  },
  {
    id: "case-manager-2",
    label: "Case Manager 2",
    reviewerName: "A. Rodriguez",
    reviewerTitle: "case manager",
  },
  {
    id: "case-manager-3",
    label: "Case Manager 3",
    reviewerName: "A. Rodriguez",
    reviewerTitle: "case manager",
  },
  {
    id: "supervisor",
    label: "Supervisor",
    reviewerName: "F. Smith",
    reviewerTitle: "supervisor",
  },
];

export function getUserById(id: UserRole) {
  return APP_USERS.find((u) => u.id === id) ?? APP_USERS[0];
}

export const STORAGE_KEY = "essex-haven-user";
