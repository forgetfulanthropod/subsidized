import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import type { Applicant, CityInfo, Property, Vacancy } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");

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

const properties: Property[] = [
  {
    id: "prop-la-101",
    name: "Wilshire Gardens",
    address: "1245 Wilshire Blvd",
    city: "Los Angeles",
    metroArea: "Los Angeles Metro",
    totalUnits: 86,
  },
  {
    id: "prop-la-102",
    name: "Sunset Terrace",
    address: "892 Sunset Blvd",
    city: "Los Angeles",
    metroArea: "Los Angeles Metro",
    totalUnits: 64,
  },
  {
    id: "prop-pas-201",
    name: "Colorado Court",
    address: "456 Colorado Blvd",
    city: "Pasadena",
    metroArea: "Los Angeles Metro",
    totalUnits: 52,
  },
  {
    id: "prop-oak-301",
    name: "Broadway Commons",
    address: "2100 Broadway",
    city: "Oakland",
    metroArea: "Bay Area",
    totalUnits: 72,
  },
  {
    id: "prop-oak-302",
    name: "Telegraph Place",
    address: "789 Telegraph Ave",
    city: "Oakland",
    metroArea: "Bay Area",
    totalUnits: 48,
  },
  {
    id: "prop-sj-401",
    name: "Alameda Heights",
    address: "1500 The Alameda",
    city: "San Jose",
    metroArea: "Bay Area",
    totalUnits: 96,
  },
  {
    id: "prop-ber-501",
    name: "Shattuck Residences",
    address: "2200 Shattuck Ave",
    city: "Berkeley",
    metroArea: "Bay Area",
    totalUnits: 40,
  },
  {
    id: "prop-la-103",
    name: "Pico Park",
    address: "3300 Pico Blvd",
    city: "Los Angeles",
    metroArea: "Los Angeles Metro",
    totalUnits: 58,
  },
  {
    id: "prop-pas-202",
    name: "Lake Avenue Homes",
    address: "100 S Lake Ave",
    city: "Pasadena",
    metroArea: "Los Angeles Metro",
    totalUnits: 44,
  },
  {
    id: "prop-sj-402",
    name: "Santa Clara Square",
    address: "500 E Santa Clara St",
    city: "San Jose",
    metroArea: "Bay Area",
    totalUnits: 80,
  },
];

const vacancies: Vacancy[] = [
  {
    id: "vac-001",
    propertyId: "prop-la-101",
    address: "1245 Wilshire Blvd, Unit 4B",
    city: "Los Angeles",
    metroArea: "Los Angeles Metro",
    unitType: "2BR/1BA",
    rent: 1850,
    subsidyType: "Section8",
    accessibility: { wheelchair: true, hearingVisual: false },
    petFriendly: true,
    petPolicy: "Cats and small dogs under 25 lbs",
    availableDate: "2026-06-01",
    status: "Vacant",
  },
  {
    id: "vac-002",
    propertyId: "prop-la-102",
    address: "892 Sunset Blvd, Unit 12",
    city: "Los Angeles",
    metroArea: "Los Angeles Metro",
    unitType: "1BR/1BA",
    rent: 1420,
    subsidyType: "LIHTC",
    accessibility: { wheelchair: false, hearingVisual: true },
    petFriendly: false,
    petPolicy: "No pets",
    availableDate: "2026-05-20",
    status: "Vacant",
  },
  {
    id: "vac-003",
    propertyId: "prop-pas-201",
    address: "456 Colorado Blvd, Unit 2A",
    city: "Pasadena",
    metroArea: "Los Angeles Metro",
    unitType: "3BR/2BA",
    rent: 2200,
    subsidyType: "Section8",
    accessibility: { wheelchair: true, hearingVisual: true },
    petFriendly: true,
    petPolicy: "Two pets max, breed restrictions apply",
    availableDate: "2026-07-01",
    status: "Vacant",
  },
  {
    id: "vac-004",
    propertyId: "prop-oak-301",
    address: "2100 Broadway, Unit 5",
    city: "Oakland",
    metroArea: "Bay Area",
    unitType: "2BR/1BA",
    rent: 1950,
    subsidyType: "LIHTC",
    accessibility: { wheelchair: true, hearingVisual: false },
    petFriendly: true,
    petPolicy: "Cats only",
    availableDate: "2026-06-15",
    status: "Vacant",
  },
  {
    id: "vac-005",
    propertyId: "prop-oak-302",
    address: "789 Telegraph Ave, Unit 1",
    city: "Oakland",
    metroArea: "Bay Area",
    unitType: "1BR/1BA",
    rent: 1680,
    subsidyType: "Section8",
    accessibility: { wheelchair: false, hearingVisual: false },
    petFriendly: false,
    petPolicy: "No pets",
    availableDate: "2026-05-01",
    status: "UnderReview",
  },
  {
    id: "vac-006",
    propertyId: "prop-sj-401",
    address: "1500 The Alameda, Unit 8C",
    city: "San Jose",
    metroArea: "Bay Area",
    unitType: "2BR/2BA",
    rent: 2100,
    subsidyType: "LIHTC",
    accessibility: { wheelchair: true, hearingVisual: true },
    petFriendly: true,
    petPolicy: "Dogs and cats welcome",
    availableDate: "2026-08-01",
    status: "Vacant",
  },
  {
    id: "vac-007",
    propertyId: "prop-ber-501",
    address: "2200 Shattuck Ave, Unit 3",
    city: "Berkeley",
    metroArea: "Bay Area",
    unitType: "1BR/1BA",
    rent: 1750,
    subsidyType: "Section8",
    accessibility: { wheelchair: false, hearingVisual: true },
    petFriendly: true,
    petPolicy: "One pet under 40 lbs",
    availableDate: "2026-06-01",
    status: "Vacant",
  },
  {
    id: "vac-008",
    propertyId: "prop-la-103",
    address: "3300 Pico Blvd, Unit 6",
    city: "Los Angeles",
    metroArea: "Los Angeles Metro",
    unitType: "2BR/1BA",
    rent: 1780,
    subsidyType: "LIHTC",
    accessibility: { wheelchair: false, hearingVisual: false },
    petFriendly: true,
    petPolicy: "Cats only, no dogs",
    availableDate: "2026-05-15",
    status: "Leased",
  },
  {
    id: "vac-009",
    propertyId: "prop-pas-202",
    address: "100 S Lake Ave, Unit 10",
    city: "Pasadena",
    metroArea: "Los Angeles Metro",
    unitType: "1BR/1BA",
    rent: 1550,
    subsidyType: "Section8",
    accessibility: { wheelchair: true, hearingVisual: false },
    petFriendly: false,
    petPolicy: "No pets",
    availableDate: "2026-06-20",
    status: "Vacant",
  },
  {
    id: "vac-010",
    propertyId: "prop-sj-402",
    address: "500 E Santa Clara St, Unit 2B",
    city: "San Jose",
    metroArea: "Bay Area",
    unitType: "3BR/2BA",
    rent: 2450,
    subsidyType: "Section8",
    accessibility: { wheelchair: true, hearingVisual: false },
    petFriendly: true,
    petPolicy: "Two pets max",
    availableDate: "2026-07-15",
    status: "Vacant",
  },
];

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
];

const statuses: Applicant["status"][] = [
  "Pending",
  "Pending",
  "Eligible",
  "Eligible",
  "Notified",
  "MoveInScheduled",
  "TenancyConfirmed",
  "Ineligible",
  "Rejected",
  "Pending",
];

function randomDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString();
}

function generateApplicants(): Applicant[] {
  const cityPool = cities.map((c) => c.city);
  const applicants: Applicant[] = [];

  for (let i = 0; i < 28; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const numCities = 1 + (i % 3);
    const preferredCities: string[] = [];
    for (let j = 0; j < numCities; j++) {
      const c = cityPool[(i + j) % cityPool.length];
      if (!preferredCities.includes(c)) preferredCities.push(c);
    }

    const hasWheelchair = i % 7 === 0;
    const hasHearing = i % 9 === 0;
    const accessibilityNeeds: string[] = [];
    if (hasWheelchair) accessibilityNeeds.push("wheelchair");
    if (hasHearing) accessibilityNeeds.push("hearing");

    const hasPets = i % 4 === 0;
    const status = statuses[i % statuses.length];
    const inReviewBy =
      status === "TenancyConfirmed"
        ? i % 3 === 0
          ? { name: "F. Smith", title: "supervisor" }
          : { name: "A. Rodriguez", title: "case manager" }
        : undefined;

    applicants.push({
      id: uuid(),
      applicationDate: randomDate(90),
      fullName: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@email.com`,
      phone: `(${310 + (i % 90)}) 555-${String(1000 + i).slice(-4)}`,
      householdSize: 1 + (i % 5),
      income: 22000 + (i % 8) * 8000,
      voucherType: i % 3 === 0 ? "Other" : "Section8",
      accessibilityNeeds,
      hasPets,
      petTypes: hasPets ? (i % 2 === 0 ? ["cat"] : ["dog"]) : undefined,
      preferredCities,
      status,
      inReviewBy,
      responseStatus:
        status === "Notified"
          ? "NoResponse"
          : status === "MoveInScheduled"
            ? "Scheduled"
            : status === "TenancyConfirmed"
              ? "Contacted"
              : "NoResponse",
      assignedVacancyId:
        status === "TenancyConfirmed" || status === "MoveInScheduled"
          ? vacancies[i % vacancies.length].id
          : undefined,
      notes:
        i % 5 === 0
          ? [
              {
                id: uuid(),
                date: randomDate(30),
                text: "Initial screening completed. Awaiting documentation.",
                author: "Case Manager",
              },
            ]
          : [],
    });
  }

  return applicants.sort(
    (a, b) =>
      new Date(a.applicationDate).getTime() -
      new Date(b.applicationDate).getTime()
  );
}

async function seed() {
  await mkdir(DATA_DIR, { recursive: true });
  const applicants = generateApplicants();

  await writeFile(
    path.join(DATA_DIR, "vacancies.json"),
    JSON.stringify(vacancies, null, 2)
  );
  await writeFile(
    path.join(DATA_DIR, "applicants.json"),
    JSON.stringify(applicants, null, 2)
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

  console.log(
    `Seeded ${properties.length} properties, ${vacancies.length} vacancies, ${applicants.length} applicants, ${cities.length} cities`
  );
}

seed().catch(console.error);
