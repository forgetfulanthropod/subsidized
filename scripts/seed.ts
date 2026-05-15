import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import {
  isApplicantRecord,
  isInReview,
  isTenantRecord,
  MIN_APPLICANTS_IN_REVIEW,
} from "../lib/case-manager-dashboard";
import {
  getRequiredDocuments,
  pickStallReason,
} from "../lib/stall-reasons";
import type {
  Applicant,
  ApplicantMessage,
  CaseManagerId,
  CityInfo,
  Property,
  Vacancy,
} from "../types";

const DATA_DIR = path.join(process.cwd(), "data");

const SCALE = {
  vacancies: 100,
  activeApplicants: 280,
  tenants: 5000,
  stalled: 120,
  ineligible: 40,
  rejected: 40,
  properties: 20,
};

const cities: CityInfo[] = [
  {
    city: "Los Angeles",
    metroArea: "Los Angeles Metro",
    description:
      "Diverse urban core with strong transit connections and community services.",
    amenities: ["Parks", "Farmers markets", "Community centers"],
    schools: "LAUSD — multiple highly rated elementary schools nearby",
    transit: "Metro Rail B/D lines, extensive bus network",
  },
  {
    city: "Pasadena",
    metroArea: "Los Angeles Metro",
    description: "Historic city with tree-lined neighborhoods and cultural venues.",
    amenities: ["Old Town", "Rose Bowl", "Libraries"],
    schools: "Pasadena Unified — strong STEM programs",
    transit: "Gold Line Metro, Foothill Transit",
  },
  {
    city: "Oakland",
    metroArea: "Bay Area",
    description: "Vibrant East Bay hub with waterfront access and diverse communities.",
    amenities: ["Lake Merritt", "Jack London Square", "Farmers markets"],
    schools: "OUSD — several charter and public options",
    transit: "BART, AC Transit",
  },
  {
    city: "San Jose",
    metroArea: "Bay Area",
    description: "South Bay center with tech employment and suburban amenities.",
    amenities: ["Trails", "Community pools", "Shopping districts"],
    schools: "San Jose Unified — STEM-focused programs",
    transit: "VTA Light Rail, Caltrain connection",
  },
  {
    city: "Berkeley",
    metroArea: "Bay Area",
    description: "University town with walkable neighborhoods and strong tenant protections.",
    amenities: ["UC campus area", "Gourmet Ghetto", "Parks"],
    schools: "Berkeley Unified — top-rated district",
    transit: "BART Downtown Berkeley, AC Transit",
  },
];

const PROPERTY_NAMES = [
  "Wilshire Gardens",
  "Sunset Terrace",
  "Colorado Court",
  "Broadway Commons",
  "Telegraph Place",
  "Alameda Heights",
  "Shattuck Residences",
  "Pico Park",
  "Lake Avenue Homes",
  "Santa Clara Square",
  "Mission Creek",
  "Harbor View",
  "Cedar Heights",
  "Valley Oaks",
  "Metro Plaza",
  "Bayview Terrace",
  "Golden Gate Arms",
  "Redwood Court",
  "Civic Center Lofts",
  "Parkside Village",
];

const STREET_NAMES = [
  "Wilshire Blvd",
  "Sunset Blvd",
  "Colorado Blvd",
  "Broadway",
  "Telegraph Ave",
  "The Alameda",
  "Shattuck Ave",
  "Pico Blvd",
  "Lake Ave",
  "Santa Clara St",
  "Mission St",
  "Market St",
  "University Ave",
  "Main St",
  "Oak St",
];

const UNIT_TYPES = ["1BR/1BA", "2BR/1BA", "2BR/2BA", "3BR/2BA", "Studio"];

const firstNames = [
  "Maria",
  "James",
  "Priya",
  "Carlos",
  "Aisha",
  "David",
  "Lin",
  "Robert",
  "Fatima",
  "Michael",
  "Sofia",
  "Kevin",
  "Angela",
  "Thomas",
  "Yuki",
  "Daniel",
  "Elena",
  "Marcus",
  "Jennifer",
  "Ahmed",
  "Lisa",
  "Brian",
  "Nina",
  "Christopher",
  "Rosa",
  "Wei",
  "Olivia",
  "Noah",
  "Emma",
  "Liam",
];

const lastNames = [
  "Garcia",
  "Johnson",
  "Patel",
  "Martinez",
  "Williams",
  "Chen",
  "Brown",
  "Kim",
  "Rodriguez",
  "Taylor",
  "Nguyen",
  "Anderson",
  "Lee",
  "Wilson",
  "Hassan",
  "Moore",
  "Jackson",
  "White",
  "Harris",
  "Clark",
  "Lewis",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "King",
  "Wright",
  "Scott",
  "Green",
  "Baker",
];

const ACTIVE_STATUSES: Applicant["status"][] = [
  "Pending",
  "Pending",
  "Eligible",
  "Eligible",
  "Notified",
  "MoveInScheduled",
  "Ineligible",
  "Rejected",
  "Pending",
];

const CASE_MANAGERS: CaseManagerId[] = [
  "case-manager-1",
  "case-manager-2",
  "case-manager-3",
];

const CM_PROFILES: Array<{ id: CaseManagerId; name: string }> = [
  { id: "case-manager-1", name: "A. Rodriguez" },
  { id: "case-manager-2", name: "M. Chen" },
  { id: "case-manager-3", name: "J. Williams" },
];

const MESSAGE_SUBJECTS = [
  "Documentation follow-up",
  "Lease signing question",
  "Income verification",
  "Unit walkthrough request",
  "Voucher update",
];

const PET_POLICIES = [
  "No pets",
  "Cats only",
  "Cats and small dogs under 25 lbs",
  "Two pets max",
  "One pet under 40 lbs",
];

function randomDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString();
}

function dateDaysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function personName(i: number) {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 7 + 3) % lastNames.length];
  return `${first} ${last}`;
}

function generateProperties(): Property[] {
  const properties: Property[] = [];
  for (let i = 0; i < SCALE.properties; i++) {
    const cityInfo = cities[i % cities.length];
    const street = STREET_NAMES[i % STREET_NAMES.length];
    const number = 100 + i * 47;
    properties.push({
      id: `prop-${String(i + 1).padStart(3, "0")}`,
      name: PROPERTY_NAMES[i % PROPERTY_NAMES.length],
      address: `${number} ${street}`,
      city: cityInfo.city,
      metroArea: cityInfo.metroArea,
      totalUnits: 48 + (i % 8) * 12,
    });
  }
  return properties;
}

function generateVacancies(properties: Property[]): Vacancy[] {
  const vacancies: Vacancy[] = [];
  for (let i = 0; i < SCALE.vacancies; i++) {
    const property = properties[i % properties.length];
    const unitNum = (i % 24) + 1;
    const floor = Math.floor(unitNum / 8) + 1;
    const statusRoll = i % 20;
    const status: Vacancy["status"] =
      statusRoll < 16 ? "Vacant" : statusRoll < 18 ? "UnderReview" : "Leased";

    vacancies.push({
      id: `vac-${String(i + 1).padStart(4, "0")}`,
      propertyId: property.id,
      address: `${property.address}, Unit ${floor}${String.fromCharCode(65 + (unitNum % 8))}`,
      city: property.city,
      metroArea: property.metroArea,
      unitType: UNIT_TYPES[i % UNIT_TYPES.length],
      rent: 1200 + (i % 12) * 150,
      subsidyType: i % 2 === 0 ? "Section8" : "LIHTC",
      accessibility: {
        wheelchair: i % 5 === 0,
        hearingVisual: i % 7 === 0,
      },
      petFriendly: i % 3 !== 0,
      petPolicy: PET_POLICIES[i % PET_POLICIES.length],
      availableDate: dateDaysFromNow((i % 60) + 1).slice(0, 10),
      status,
      assignedCaseManagerId:
        status !== "Leased" && i % 3 !== 0
          ? CASE_MANAGERS[i % CASE_MANAGERS.length]
          : undefined,
    });
  }
  return vacancies;
}

function buildMessages(
  fullName: string,
  i: number
): ApplicantMessage[] | undefined {
  if (i % 4 !== 0) return undefined;
  const unread = i % 8 === 0;
  return [
    {
      id: uuid(),
      date: randomDate(4),
      from: fullName,
      subject: MESSAGE_SUBJECTS[i % MESSAGE_SUBJECTS.length],
      preview: "Hi, I wanted to follow up on my application status…",
      read: !unread,
    },
  ];
}

function buildApplicantBase(
  i: number,
  vacancies: Vacancy[],
  options: {
    status: Applicant["status"];
    applicationDaysAgo: number;
    interactionDaysAgo: number;
    includeMessages?: boolean;
    emailSuffix?: string;
    unclaimed?: boolean;
  }
): Applicant {
  const fullName = personName(i);
  const [first, ...rest] = fullName.split(" ");
  const last = rest.join(" ") || "Resident";
  const cityInfo = cities[i % cities.length];
  const cityPool = cities.map((c) => c.city);
  const preferredCities = [
    cityInfo.city,
    cityPool[(i + 1) % cityPool.length],
  ].filter((c, idx, arr) => arr.indexOf(c) === idx);

  const hasWheelchair = i % 7 === 0;
  const hasHearing = i % 9 === 0;
  const accessibilityNeeds: string[] = [];
  if (hasWheelchair) accessibilityNeeds.push("wheelchair");
  if (hasHearing) accessibilityNeeds.push("hearing");

  const hasPets = i % 4 === 0;
  const status = options.status;
  const needsReview = ["Eligible", "Notified", "MoveInScheduled", "MovedIn", "Stalled"].includes(
    status
  );
  const assignedCaseManagerId = options.unclaimed
    ? undefined
    : CASE_MANAGERS[i % CASE_MANAGERS.length];
  const cmProfile = assignedCaseManagerId
    ? CM_PROFILES.find((p) => p.id === assignedCaseManagerId)
    : undefined;

  return {
    id: uuid(),
    applicationDate: randomDate(options.applicationDaysAgo),
    fullName,
    assignedCaseManagerId,
    lastInteractionDate: randomDate(options.interactionDaysAgo),
    messages: options.includeMessages ? buildMessages(fullName, i) : undefined,
    email: `${first.toLowerCase().replace(/\s/g, "")}.${last.toLowerCase().replace(/\s/g, "")}${options.emailSuffix ?? ""}@email.com`,
    phone: `(${310 + (i % 90)}) 555-${String(1000 + (i % 9000)).slice(-4)}`,
    householdSize: 1 + (i % 5),
    income: 20000 + (i % 10) * 6000,
    voucherType: i % 3 === 0 ? "Other" : "Section8",
    accessibilityNeeds,
    hasPets,
    petTypes: hasPets ? (i % 2 === 0 ? ["cat"] : ["dog"]) : undefined,
    preferredCities,
    status,
    inReviewBy:
      needsReview && cmProfile
        ? { name: cmProfile.name, title: "case manager" }
        : undefined,
    responseStatus:
      status === "Notified"
        ? "NoResponse"
        : status === "MoveInScheduled"
          ? "Scheduled"
          : status === "MovedIn"
            ? "Contacted"
            : "NoResponse",
    assignedVacancyId:
      status === "MoveInScheduled" ||
      status === "MovedIn" ||
      status === "Stalled"
        ? vacancies[i % vacancies.length].id
        : undefined,
    notes: [],
  };
}

function generateActiveApplicants(vacancies: Vacancy[]): Applicant[] {
  const applicants: Applicant[] = [];
  for (let i = 0; i < SCALE.activeApplicants; i++) {
    const status = ACTIVE_STATUSES[i % ACTIVE_STATUSES.length];
    const applicant = buildApplicantBase(i, vacancies, {
      status,
      applicationDaysAgo: 90,
      interactionDaysAgo: 3 + ((i * 7) % 40),
      includeMessages: true,
      unclaimed: i % 4 === 0,
    });

    if (status === "MoveInScheduled") {
      applicant.moveInDate =
        i % 5 === 0
          ? dateDaysFromNow(i % 4)
          : dateDaysFromNow(10 + (i % 14));
    }

    if (i % 5 === 0) {
      applicant.notes = [
        {
          id: uuid(),
          date: randomDate(30),
          text: "Initial screening completed. Awaiting documentation.",
          author: "Case Manager",
        },
      ];
    }

    applicants.push(applicant);
  }
  return applicants;
}

function generateTenants(vacancies: Vacancy[], startIndex: number): Applicant[] {
  const tenants: Applicant[] = [];
  for (let i = 0; i < SCALE.tenants; i++) {
    const idx = startIndex + i;
    const applicant = buildApplicantBase(idx, vacancies, {
      status: "MovedIn",
      applicationDaysAgo: 200 + (i % 400),
      interactionDaysAgo: 5 + (i % 90),
      emailSuffix: ".tenant",
    });
    applicant.moveInDate = randomDate(30 + (i % 800));
    const cm = CM_PROFILES.find((p) => p.id === applicant.assignedCaseManagerId);
    applicant.inReviewBy = {
      name: cm?.name ?? "A. Rodriguez",
      title: "case manager",
    };
    if (i % 20 === 0) {
      applicant.notes = [
        {
          id: uuid(),
          date: randomDate(40),
          text: "Move-in completed. Final inspection passed.",
          author: "Case Manager",
        },
      ];
    }
    tenants.push(applicant);
  }
  return tenants;
}

function generateCompletedCases(
  vacancies: Vacancy[],
  startIndex: number
): Applicant[] {
  const completed: Applicant[] = [];
  const segments: Array<{ count: number; status: Applicant["status"] }> = [
    { count: SCALE.stalled, status: "Stalled" },
    { count: SCALE.ineligible, status: "Ineligible" },
    { count: SCALE.rejected, status: "Rejected" },
  ];

  let offset = 0;
  for (const { count, status } of segments) {
    for (let j = 0; j < count; j++) {
      const i = startIndex + offset + j;
      const applicant = buildApplicantBase(i, vacancies, {
        status,
        applicationDaysAgo: 180 + (i % 90),
        interactionDaysAgo: status === "Stalled" ? 35 + (i % 25) : 20 + (i % 15),
        emailSuffix: ".closed",
      });

      if (status === "Stalled") {
        const stallReason = pickStallReason(i + j);
        applicant.stallReason = stallReason;
        applicant.requiredDocuments = [...getRequiredDocuments(stallReason)];
        if (j % 3 !== 2) {
          applicant.documentsRequestedAt = randomDate(8 + (j % 12));
        }
        applicant.moveInDate = randomDate(45 + (i % 30));
        applicant.notes = [
          {
            id: uuid(),
            date: randomDate(20),
            text: `Case stalled — ${stallReason === "missingDocumentation" ? "income docs and voucher packet outstanding" : "follow-up required on outstanding items"}.`,
            author: "Case Manager",
          },
        ];
        if (j % 2 === 0) {
          applicant.messages = [
            {
              id: uuid(),
              date: randomDate(12),
              from: applicant.fullName,
              subject: "Missing paperwork",
              preview: "Still gathering documents from my employer…",
              read: true,
            },
          ];
        }
      }

      completed.push(applicant);
    }
    offset += count;
  }

  return completed;
}

function isThisWeek(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function ensureMoveInsThisWeek(applicants: Applicant[], vacancies: Vacancy[]) {
  CASE_MANAGERS.forEach((cmId, cmIndex) => {
    const moveInsThisWeek = applicants.filter(
      (a) =>
        a.assignedCaseManagerId === cmId &&
        a.moveInDate &&
        isThisWeek(a.moveInDate)
    );

    const needed = Math.max(0, 1 - moveInsThisWeek.length);
    if (needed === 0) return;

    const pool = applicants.filter(
      (a) =>
        a.assignedCaseManagerId === cmId &&
        ["MoveInScheduled", "Notified", "Eligible", "Pending"].includes(a.status)
    );

    for (let n = 0; n < needed && n < pool.length; n++) {
      const target = pool[n];
      target.status = "MoveInScheduled";
      target.moveInDate = dateDaysFromNow(1 + cmIndex + n);
      target.responseStatus = "Scheduled";
      const cm = CM_PROFILES.find((p) => p.id === cmId);
      target.inReviewBy = {
        name: cm?.name ?? "A. Rodriguez",
        title: "case manager",
      };
      target.assignedVacancyId =
        target.assignedVacancyId ?? vacancies[(cmIndex + n) % vacancies.length].id;
    }
  });
}

function generateApplicants(vacancies: Vacancy[]): Applicant[] {
  const active = generateActiveApplicants(vacancies);
  const tenants = generateTenants(vacancies, SCALE.activeApplicants);
  const completed = generateCompletedCases(
    vacancies,
    SCALE.activeApplicants + SCALE.tenants
  );

  const all = [...active, ...tenants, ...completed].sort(
    (a, b) =>
      new Date(a.applicationDate).getTime() -
      new Date(b.applicationDate).getTime()
  );

  ensureMoveInsThisWeek(all, vacancies);
  capMoveInsThisWeek(all);
  markEscalatedCases(all);
  ensureApplicantsInReviewPerManager(all);
  capInReviewPerManager(all);
  return all;
}

const MOVE_INS_THIS_WEEK_CAP = 11;

function capMoveInsThisWeek(applicants: Applicant[]) {
  for (const cmId of CASE_MANAGERS) {
    const thisWeek = applicants
      .filter(
        (a) =>
          a.assignedCaseManagerId === cmId &&
          a.moveInDate &&
          isThisWeek(a.moveInDate)
      )
      .sort(
        (a, b) =>
          new Date(a.moveInDate!).getTime() - new Date(b.moveInDate!).getTime()
      );

    thisWeek.slice(MOVE_INS_THIS_WEEK_CAP).forEach((a, i) => {
      a.moveInDate = dateDaysFromNow(8 + (i % 14));
    });
  }
}

const IN_REVIEW_CAP = 35;

function capInReviewPerManager(applicants: Applicant[]) {
  const byDate = (a: Applicant, b: Applicant) =>
    new Date(a.applicationDate).getTime() -
    new Date(b.applicationDate).getTime();

  for (const cmId of CASE_MANAGERS) {
    const queue = applicants.filter(
      (a) => a.assignedCaseManagerId === cmId && isInReview(a)
    );

    const applicantQueue = queue.filter(isApplicantRecord).sort(byDate);
    const tenantQueue = queue.filter(isTenantRecord).sort(byDate);

    const keepApplicants = applicantQueue.slice(0, MIN_APPLICANTS_IN_REVIEW);
    const tenantSlots = Math.max(0, IN_REVIEW_CAP - keepApplicants.length);
    const keepTenants = tenantQueue.slice(0, tenantSlots);
    const keepIds = new Set(
      [...keepApplicants, ...keepTenants].map((a) => a.id)
    );

    queue.forEach((a, i) => {
      if (keepIds.has(a.id)) return;
      a.reviewedAt = randomDate(1 + (i % 30));
      delete a.inReviewBy;
    });
  }
}

function ensureApplicantsInReviewPerManager(applicants: Applicant[]) {
  for (const cmId of CASE_MANAGERS) {
    const inReviewApplicants = applicants.filter(
      (a) =>
        a.assignedCaseManagerId === cmId &&
        isApplicantRecord(a) &&
        ["Eligible", "Notified", "MoveInScheduled"].includes(a.status)
    );

    const needed = Math.max(0, MIN_APPLICANTS_IN_REVIEW - inReviewApplicants.length);
    if (needed === 0) continue;

    const pool = applicants.filter(
      (a) =>
        a.assignedCaseManagerId === cmId &&
        isApplicantRecord(a) &&
        ["Pending", "Eligible", "Notified"].includes(a.status)
    );

    const statuses: Applicant["status"][] = [
      "Eligible",
      "Notified",
      "MoveInScheduled",
    ];

    for (let n = 0; n < needed && n < pool.length; n++) {
      const target = pool[n];
      target.status = statuses[n % statuses.length];
      const cm = CM_PROFILES.find((p) => p.id === cmId);
      target.inReviewBy = {
        name: cm?.name ?? "A. Rodriguez",
        title: "case manager",
      };
    }
  }
}

function markEscalatedCases(applicants: Applicant[]) {
  const candidates = applicants.filter((a) =>
    ["Stalled", "MoveInScheduled", "Notified", "Eligible"].includes(a.status)
  );

  candidates.slice(0, 35).forEach((applicant, i) => {
    const escalatedBy =
      applicant.assignedCaseManagerId ?? CASE_MANAGERS[i % CASE_MANAGERS.length];
    applicant.escalatedBy = escalatedBy;
    applicant.escalatedAt = randomDate(3 + (i % 14));
    if (!applicant.stallReason && applicant.status === "Stalled") {
      const stallReason = pickStallReason(i + 500);
      applicant.stallReason = stallReason;
      applicant.requiredDocuments = [...getRequiredDocuments(stallReason)];
    }
  });
}

async function seed() {
  console.log("Generating seed data…");
  const start = Date.now();

  await mkdir(DATA_DIR, { recursive: true });

  const properties = generateProperties();
  const vacancies = generateVacancies(properties);
  const applicants = generateApplicants(vacancies);

  const tenantCount = applicants.filter((a) => a.status === "MovedIn").length;

  await writeFile(
    path.join(DATA_DIR, "vacancies.json"),
    JSON.stringify(vacancies, null, 2)
  );
  await writeFile(
    path.join(DATA_DIR, "applicants.json"),
    JSON.stringify(applicants)
  );
  await writeFile(
    path.join(DATA_DIR, "cities.json"),
    JSON.stringify(cities, null, 2)
  );
  await writeFile(
    path.join(DATA_DIR, "properties.json"),
    JSON.stringify(properties, null, 2)
  );
  await writeFile(
    path.join(DATA_DIR, "audit-log.json"),
    JSON.stringify([], null, 2)
  );
  await writeFile(
    path.join(DATA_DIR, "notifications-log.json"),
    JSON.stringify([], null, 2)
  );

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `Seeded ${properties.length} properties, ${vacancies.length} vacancies, ${applicants.length} applicants (${tenantCount} tenants / moved in), ${cities.length} cities in ${elapsed}s`
  );
}

seed().catch(console.error);
