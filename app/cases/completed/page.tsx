import { CasesSubNav } from "@/components/CasesSubNav";
import { ApplicantTable } from "@/components/ApplicantTable";

export default function CasesCompletedPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Cases</h1>
        <p className="text-slate-600">Closed applications and confirmed tenancies</p>
      </div>
      <CasesSubNav />
      <ApplicantTable casesMode="completed" showReview showAssignee />
    </main>
  );
}
