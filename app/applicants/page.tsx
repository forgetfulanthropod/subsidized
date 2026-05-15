"use client";

import Link from "next/link";
import { ApplicantTable } from "@/components/ApplicantTable";
import { Button } from "@/components/ui/button";

export default function ApplicantsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="text-slate-600">
            Manage housing applications and case flow
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/tenants">View Tenants →</Link>
        </Button>
      </div>
      <ApplicantTable />
    </main>
  );
}
