"use client";

import Link from "next/link";
import { ApplicantTable } from "@/components/ApplicantTable";
import { Button } from "@/components/ui/button";

export default function TenantsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
          <p className="text-slate-600">
            Applicants with confirmed tenancy
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/applicants">← All Applicants</Link>
        </Button>
      </div>
      <ApplicantTable tenantsOnly showRecordTypeFilter />
    </main>
  );
}
