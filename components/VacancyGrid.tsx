"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, PawPrint, Accessibility } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CityModal } from "@/components/CityModal";
import { getMatchingApplicants } from "@/lib/matching";
import {
  buildPropertyStats,
  getPropertyDisplayName,
  type PropertyWithStats,
} from "@/lib/properties";
import { formatDate, formatStatus, formatSubsidyType } from "@/lib/utils";
import type { Applicant, CityInfo, Property, Vacancy } from "@/types";

export function VacancyGrid() {
  const [metroFilter, setMetroFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [petFilter, setPetFilter] = useState(false);
  const [wheelchairFilter, setWheelchairFilter] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: vacancies = [], isLoading: loadingVacancies } = useQuery<
    Vacancy[]
  >({
    queryKey: ["vacancies"],
    queryFn: async () => {
      const res = await fetch("/api/vacancies");
      if (!res.ok) throw new Error("Failed to fetch vacancies");
      return res.json();
    },
  });

  const { data: properties = [], isLoading: loadingProperties } = useQuery<
    Property[]
  >({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties");
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    },
  });

  const { data: applicants = [] } = useQuery<Applicant[]>({
    queryKey: ["applicants"],
    queryFn: async () => {
      const res = await fetch("/api/applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return res.json();
    },
  });

  const { data: cities = [] } = useQuery<CityInfo[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      const res = await fetch("/api/cities");
      if (!res.ok) throw new Error("Failed to fetch cities");
      return res.json();
    },
  });

  const propertyStats = useMemo(
    () => buildPropertyStats(properties, vacancies),
    [properties, vacancies]
  );

  const allMetros = useMemo(
    () => [...new Set(propertyStats.map((p) => p.metroArea))].sort(),
    [propertyStats]
  );

  const allCities = useMemo(
    () => [...new Set(propertyStats.map((p) => p.city))].sort(),
    [propertyStats]
  );

  const filteredProperties = useMemo(() => {
    return propertyStats
      .map((property) => {
        const unitVacancies = property.vacancies.filter((v) => {
          if (v.status === "Leased") return false;
          if (metroFilter !== "all" && v.metroArea !== metroFilter) return false;
          if (cityFilter !== "all" && v.city !== cityFilter) return false;
          if (petFilter && !v.petFriendly) return false;
          if (wheelchairFilter && !v.accessibility.wheelchair) return false;
          return true;
        });
        return { ...property, vacancies: unitVacancies };
      })
      .filter((p) => p.vacancies.length > 0);
  }, [propertyStats, metroFilter, cityFilter, petFilter, wheelchairFilter]);

  const portfolioSummary = useMemo(() => {
    const vacant = vacancies.filter((v) => v.status === "Vacant").length;
    const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
    return { vacant, totalUnits, properties: properties.length };
  }, [vacancies, properties]);

  const openVacancy = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setModalOpen(true);
  };

  const cityInfo = selectedVacancy
    ? cities.find((c) => c.city === selectedVacancy.city) ?? null
    : null;

  const matchedApplicants = selectedVacancy
    ? getMatchingApplicants(selectedVacancy, applicants)
    : [];

  const isLoading = loadingVacancies || loadingProperties;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-emerald-800">Open vacancies</p>
          <p className="mt-1 text-3xl font-bold text-emerald-900">
            {portfolioSummary.vacant}
          </p>
          <p className="text-xs text-emerald-700">units ready to lease</p>
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-800">Portfolio size</p>
          <p className="mt-1 text-3xl font-bold text-emerald-900">
            {portfolioSummary.totalUnits}
          </p>
          <p className="text-xs text-emerald-700">
            total units across {portfolioSummary.properties} properties
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-800">Availability rate</p>
          <p className="mt-1 text-3xl font-bold text-emerald-900">
            {portfolioSummary.totalUnits > 0
              ? Math.round(
                  (portfolioSummary.vacant / portfolioSummary.totalUnits) * 100
                )
              : 0}
            %
          </p>
          <p className="text-xs text-emerald-700">of units currently vacant</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="space-y-1">
          <Label>Metro Area</Label>
          <Select value={metroFilter} onValueChange={setMetroFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All metros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {allMetros.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>City</Label>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {allCities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="pets"
            checked={petFilter}
            onCheckedChange={(c) => setPetFilter(c === true)}
          />
          <Label htmlFor="pets">Pet friendly only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="wheelchair"
            checked={wheelchairFilter}
            onCheckedChange={(c) => setWheelchairFilter(c === true)}
          />
          <Label htmlFor="wheelchair">Wheelchair accessible</Label>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Loading vacancies…</p>
      ) : filteredProperties.length === 0 ? (
        <p className="text-slate-500">No vacant properties match your filters.</p>
      ) : (
        <div className="space-y-6">
          {filteredProperties.map((property) => (
            <PropertySection
              key={property.id}
              property={property}
              applicants={applicants}
              onOpenVacancy={openVacancy}
            />
          ))}
        </div>
      )}

      <CityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        vacancy={selectedVacancy}
        cityInfo={cityInfo}
        matchedApplicants={matchedApplicants}
      />
    </div>
  );
}

function PropertySection({
  property,
  applicants,
  onOpenVacancy,
}: {
  property: PropertyWithStats & { vacancies: Vacancy[] };
  applicants: Applicant[];
  onOpenVacancy: (v: Vacancy) => void;
}) {
  const openVacancies = property.vacancies.filter((v) => v.status === "Vacant");
  const availabilityPct = Math.round(
    (property.vacantUnits / property.totalUnits) * 100
  );

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {getPropertyDisplayName(property)}
            </h2>
            <p className="text-sm text-slate-500">
              {property.address} · {property.city} · {property.metroArea}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border-2 border-emerald-600 bg-white px-4 py-2 text-center">
              <p className="text-2xl font-bold leading-none text-emerald-800">
                {property.vacantUnits}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
                {property.vacantUnits === 1 ? "vacancy" : "vacancies"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-center">
              <p className="text-2xl font-bold leading-none text-slate-900">
                {property.totalUnits}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                total units
              </p>
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium text-emerald-800">
            {openVacancies.length} open
          </span>
          {property.underReviewUnits > 0 && (
            <>
              {" "}
              · {property.underReviewUnits} under review
            </>
          )}{" "}
          · {availabilityPct}% of portfolio vacant at this property
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {property.vacancies.map((vacancy) => {
          const matchCount = getMatchingApplicants(vacancy, applicants).length;
          return (
            <Card
              key={vacancy.id}
              className="cursor-pointer border-slate-100 shadow-none transition-shadow hover:border-emerald-200 hover:shadow-md"
              onClick={() => onOpenVacancy(vacancy)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-snug">
                    {vacancy.unitType}
                  </CardTitle>
                  <Badge
                    variant={
                      vacancy.status === "Vacant" ? "default" : "warning"
                    }
                  >
                    {formatStatus(vacancy.status)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">{vacancy.address}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {formatSubsidyType(vacancy.subsidyType)}
                </p>
                <p className="text-slate-600">
                  Available {formatDate(vacancy.availableDate)}
                </p>
                <div className="flex flex-wrap gap-1">
                  {vacancy.petFriendly && (
                    <Badge variant="outline" className="gap-0.5">
                      <PawPrint className="h-3 w-3" /> Pets
                    </Badge>
                  )}
                  {vacancy.accessibility.wheelchair && (
                    <Badge variant="outline" className="gap-0.5">
                      <Accessibility className="h-3 w-3" /> Accessible
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-emerald-700">
                  {matchCount} matched applicant{matchCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
