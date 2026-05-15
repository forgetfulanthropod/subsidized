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
  images?: string[];
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
    | "Rejected";
  responseStatus: "NoResponse" | "Contacted" | "Scheduled" | "Declined";
  assignedVacancyId?: string;
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
