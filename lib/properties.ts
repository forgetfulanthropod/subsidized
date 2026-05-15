import type { Property, Vacancy } from "@/types";

export interface PropertyWithStats extends Property {
  vacantUnits: number;
  underReviewUnits: number;
  vacancies: Vacancy[];
}

export function buildPropertyStats(
  properties: Property[],
  vacancies: Vacancy[]
): PropertyWithStats[] {
  return properties.map((property) => {
    const propertyVacancies = vacancies.filter(
      (v) => v.propertyId === property.id
    );
    const vacantUnits = propertyVacancies.filter(
      (v) => v.status === "Vacant"
    ).length;
    const underReviewUnits = propertyVacancies.filter(
      (v) => v.status === "UnderReview"
    ).length;

    return {
      ...property,
      vacantUnits,
      underReviewUnits,
      vacancies: propertyVacancies,
    };
  });
}

export function getPropertyDisplayName(property: Property) {
  return property.name || property.address;
}
