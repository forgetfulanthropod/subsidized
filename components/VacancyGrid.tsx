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
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import type { Applicant, CityInfo, Vacancy } from "@/types";

export function VacancyGrid() {
  const [metroFilter, setMetroFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [petFilter, setPetFilter] = useState(false);
  const [wheelchairFilter, setWheelchairFilter] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: vacancies = [], isLoading } = useQuery<Vacancy[]>({
    queryKey: ["vacancies"],
    queryFn: async () => {
      const res = await fetch("/api/vacancies");
      if (!res.ok) throw new Error("Failed to fetch vacancies");
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

  const allMetros = useMemo(
    () => [...new Set(vacancies.map((v) => v.metroArea))].sort(),
    [vacancies]
  );

  const allCities = useMemo(
    () => [...new Set(vacancies.map((v) => v.city))].sort(),
    [vacancies]
  );

  const filtered = useMemo(() => {
    return vacancies.filter((v) => {
      if (metroFilter !== "all" && v.metroArea !== metroFilter) return false;
      if (cityFilter !== "all" && v.city !== cityFilter) return false;
      if (petFilter && !v.petFriendly) return false;
      if (wheelchairFilter && !v.accessibility.wheelchair) return false;
      return true;
    });
  }, [vacancies, metroFilter, cityFilter, petFilter, wheelchairFilter]);

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

  return (
    <div className="space-y-4">
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vacancy) => {
            const matchCount = getMatchingApplicants(vacancy, applicants).length;
            return (
              <Card
                key={vacancy.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => openVacancy(vacancy)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {vacancy.address}
                    </CardTitle>
                    <Badge
                      variant={
                        vacancy.status === "Vacant" ? "default" : "secondary"
                      }
                    >
                      {formatStatus(vacancy.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {vacancy.city} · {vacancy.metroArea}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {vacancy.unitType} · {formatCurrency(vacancy.rent)}/mo
                  </p>
                  <p className="text-slate-600">
                    {vacancy.subsidyType} · Available {formatDate(vacancy.availableDate)}
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
