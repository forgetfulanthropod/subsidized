"use client";

import Image from "next/image";
import { Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { loginWithEssex } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-sm text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/essex-logo.png"
            alt="Essex Property Trust"
            width={220}
            height={56}
            className="h-11 w-auto"
            priority
          />
        </div>

        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-emerald-50 p-4">
            <Building2 className="h-8 w-8 text-emerald-700" aria-hidden />
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Use your Essex account to access property management applications.
        </p>

        <Button
          type="button"
          size="lg"
          className="mt-8 w-full bg-emerald-700 hover:bg-emerald-800"
          onClick={loginWithEssex}
        >
          Login with Essex
        </Button>
      </div>
    </main>
  );
}
