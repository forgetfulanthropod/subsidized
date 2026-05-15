import { VacancyGrid } from "@/components/VacancyGrid";

export default function VacanciesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Vacancies</h1>
        <p className="text-slate-600">
          Browse available subsidized units and matched applicants
        </p>
      </div>
      <VacancyGrid />
    </main>
  );
}
