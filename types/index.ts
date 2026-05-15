import type { StallReasonId } from "@/lib/stall-reasons";

export type CaseManagerId =
  | "case-manager-1"
  | "case-manager-2"
  | "case-manager-3";

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  metroArea: string;
  totalUnits: number;
}

export interface Vacancy {
  id: string;
  propertyId: string;
  address: string;
  city: string;
  metroArea: string;
  unitType: string;
  rent: number;
  subsidyType: "Section8" | "LIHTC";
  accessibility: {
    wheelchair: boolean;
    hearingVisual: boolean;
  };
  petFriendly: boolean;
  petPolicy: string;
  availableDate: string;
  status: "Vacant" | "UnderReview" | "Leased";
  assignedCaseManagerId?: CaseManagerId;
  images?: string[];
}

export interface ApplicantMessage {
  id: string;
  date: string;
  from: string;
  subject: string;
  preview: string;
  read: boolean;
}

export interface Applicant {
  id: string;
  applicationDate: string;
  fullName: string;
  email: string;
  phone: string;
  householdSize: number;
  income: number;
  voucherType: "Section8" | "Other";
  accessibilityNeeds: string[];
  hasPets: boolean;
  petTypes?: string[];
  preferredCities: string[];
  status:
    | "Pending"
    | "Eligible"
    | "Ineligible"
    | "Notified"
    | "MoveInScheduled"
    | "TenancyConfirmed"
    | "MovedIn"
    | "Stalled"
    | "Rejected";
  documentsRequestedAt?: string;
  stallReason?: StallReasonId;
  requiredDocuments?: readonly string[];
  responseStatus: "NoResponse" | "Contacted" | "Scheduled" | "Declined";
  assignedVacancyId?: string;
  inReviewBy?: {
    name: string;
    title: string;
  };
  assignedCaseManagerId?: CaseManagerId;
  escalatedAt?: string;
  escalatedBy?: CaseManagerId;
  lastInteractionDate?: string;
  moveInDate?: string;
  messages?: ApplicantMessage[];
  notes: Array<{
    id: string;
    date: string;
    text: string;
    author: string;
  }>;
}

export interface CityInfo {
  city: string;
  metroArea: string;
  description: string;
  amenities: string[];
  schools: string;
  transit: string;
}

export interface AuditLogEntry {
  id: string;
  date: string;
  action: string;
  applicantId?: string;
  vacancyId?: string;
  author: string;
  details?: string;
}

export interface NotificationLogEntry {
  date: string;
  applicantId: string;
  vacancyId: string;
  type: string;
  message: string;
}
