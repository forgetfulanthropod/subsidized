import { CaseManagerDashboard } from "@/components/CaseManagerDashboard";
import { CasesSubNav } from "@/components/CasesSubNav";
import { SupervisorDashboard } from "@/components/SupervisorDashboard";
import { ApplicantTable } from "@/components/ApplicantTable";

export default function CasesInProgressPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <CasesSubNav />
      <SupervisorDashboard />
      <CaseManagerDashboard />
      <ApplicantTable casesMode="in-progress" showAssignee />
    </main>
  );
}
