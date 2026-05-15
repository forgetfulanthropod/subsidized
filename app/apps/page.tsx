"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Compass,
  Home,
  Info,
  LayoutGrid,
} from "lucide-react";
import { useAuth, type EssexAppId } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type EnabledApp = {
  id: EssexAppId;
  name: string;
  description: string;
  icon: typeof Home;
  enabled: true;
};

type DisabledApp = {
  id: string;
  name: string;
  description: string;
  icon: typeof Home;
  enabled: false;
  purpose: string;
  usedBy: string[];
};

type AppTile = EnabledApp | DisabledApp;

const APPS: AppTile[] = [
  {
    id: "subsidized-housing",
    name: "Subsidized Housing",
    description: "Cases, vacancies, applicants, and tenant workflows.",
    icon: Home,
    enabled: true,
  },
  {
    id: "learning",
    name: "Learning",
    description: "Training and compliance resources for your team.",
    icon: BookOpen,
    enabled: true,
  },
  {
    id: "market-rate",
    name: "Market-rate Housing",
    description: "Conventional leasing and resident services.",
    icon: LayoutGrid,
    enabled: false,
    purpose:
      "Manages market-rate leasing from prospect tour through renewal: listings, applications, lease execution, rent rolls, and day-to-day resident service for conventional apartments across the portfolio.",
    usedBy: [
      "Regional property managers",
      "Leasing consultants & on-site teams",
      "Resident services coordinators",
      "Community managers",
    ],
  },
  {
    id: "data-navigation",
    name: "Data Navigation",
    description: "Portfolio analytics and operational reporting.",
    icon: Compass,
    enabled: false,
    purpose:
      "Central hub for portfolio KPIs, occupancy and revenue analytics, and cross-market reporting. Connects property operations data with finance and leadership views for planning and performance reviews.",
    usedBy: [
      "Asset management",
      "Finance & portfolio analytics",
      "Regional vice presidents",
      "Executive leadership",
    ],
  },
];

export default function AppsPage() {
  const { selectApp } = useAuth();
  const [infoApp, setInfoApp] = useState<DisabledApp | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-col items-center text-center sm:items-start sm:text-left">
        <Image
          src="/essex-logo.png"
          alt="Essex Property Trust"
          width={180}
          height={48}
          className="mb-6 h-9 w-auto"
        />
        <h1 className="text-2xl font-bold text-slate-900">Your apps</h1>
        <p className="mt-1 text-slate-600">
          Choose an application to open on your Essex account.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {APPS.map((app) => {
          const Icon = app.icon;

          if (app.enabled) {
            return (
              <li key={app.id}>
                <button
                  type="button"
                  onClick={() => selectApp(app.id)}
                  className="flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <Icon className="mb-3 h-6 w-6 text-emerald-700" aria-hidden />
                  <span className="font-semibold text-slate-900">{app.name}</span>
                  <span className="mt-1 text-sm text-slate-600">
                    {app.description}
                  </span>
                </button>
              </li>
            );
          }

          return (
            <li key={app.id}>
              <button
                type="button"
                onClick={() => setInfoApp(app)}
                className={cn(
                  "group flex h-full w-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm transition-colors",
                  "hover:border-slate-300 hover:bg-white"
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <Icon
                    className="h-6 w-6 text-slate-500 group-hover:text-slate-700"
                    aria-hidden
                  />
                  <Info
                    className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600"
                    aria-hidden
                  />
                </div>
                <span className="font-semibold text-slate-700">{app.name}</span>
                <span className="mt-1 text-sm text-slate-500">
                  {app.description}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={infoApp !== null}
        onOpenChange={(open) => {
          if (!open) setInfoApp(null);
        }}
      >
        <DialogContent className="max-w-md">
          {infoApp && <AppInfoDialogContent app={infoApp} onClose={() => setInfoApp(null)} />}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function AppInfoDialogContent({
  app,
  onClose,
}: {
  app: DisabledApp;
  onClose: () => void;
}) {
  const Icon = app.icon;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-slate-600" aria-hidden />
          {app.name}
        </DialogTitle>
        <DialogDescription>{app.description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-semibold text-slate-900">What it&apos;s for</h3>
          <p className="mt-1 text-slate-600">{app.purpose}</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Who uses it at Essex</h3>
          <ul className="mt-2 space-y-1.5">
            {app.usedBy.map((team) => (
              <li
                key={team}
                className="flex items-start gap-2 text-slate-600"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600"
                  aria-hidden
                />
                {team}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={onClose}
      >
        Close
      </Button>
    </>
  );
}
