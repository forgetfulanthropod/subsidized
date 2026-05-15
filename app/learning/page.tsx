"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LearningPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-full bg-emerald-50 p-4">
        <BookOpen className="h-10 w-10 text-emerald-700" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Learning</h1>
      <p className="mt-2 text-slate-600">
        Training modules and compliance content will be available here soon.
      </p>
      <Button variant="outline" className="mt-8" asChild>
        <Link href="/apps">← Back to your apps</Link>
      </Button>
    </main>
  );
}
