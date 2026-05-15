import type { Applicant, Vacancy } from "@/types";

export function getMatchingVacancies(
  applicant: Applicant,
  vacancies: Vacancy[]
) {
  return vacancies.filter((v) => {
    if (v.status !== "Vacant") return false;

    const accessibilityMatch = applicant.accessibilityNeeds.every((need) => {
      if (need === "wheelchair") return v.accessibility.wheelchair;
      if (need === "hearing") return v.accessibility.hearingVisual;
      return true;
    });

    const petMatch = !applicant.hasPets || v.petFriendly;
    const cityMatch = applicant.preferredCities.includes(v.city);

    return accessibilityMatch && petMatch && cityMatch;
  });
}

export function getMatchingApplicants(
  vacancy: Vacancy,
  applicants: Applicant[]
) {
  return applicants.filter((a) => {
    if (
      a.status === "Ineligible" ||
      a.status === "Rejected" ||
      a.status === "TenancyConfirmed" ||
      a.status === "MovedIn"
    ) {
      return false;
    }

    const accessibilityMatch = a.accessibilityNeeds.every((need) => {
      if (need === "wheelchair") return vacancy.accessibility.wheelchair;
      if (need === "hearing") return vacancy.accessibility.hearingVisual;
      return true;
    });

    const petMatch = !a.hasPets || vacancy.petFriendly;
    const cityMatch = a.preferredCities.includes(vacancy.city);

    return accessibilityMatch && petMatch && cityMatch;
  });
}
