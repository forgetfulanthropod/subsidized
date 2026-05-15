import { CaseManagerDashboard } from "@/components/CaseManagerDashboard";
import { CasesSubNav } from "@/components/CasesSubNav";
import { SupervisorDashboard } from "@/components/SupervisorDashboard";
import { ApplicantTable } from "@/components/ApplicantTable";

export default function CasesInProgressPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Cases</h1>
        <p className="text-slate-600">Active applications and move-ins on your caseload</p>
      </div>
      <CasesSubNav />
      <SupervisorDashboard />
      <CaseManagerDashboard />
      <ApplicantTable casesMode="in-progress" showAssignee />
    </main>
  );
}
