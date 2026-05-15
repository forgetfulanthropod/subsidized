import Link from "next/link";
import { Building2, Users, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const links = [
  {
    href: "/applicants",
    title: "Applicants",
    description: "Review applications, run matching, and manage case flow.",
    icon: Users,
  },
  {
    href: "/vacancies",
    title: "Vacancies",
    description: "Browse subsidized units across LA and Bay Area metros.",
    icon: Building2,
  },
  {
    href: "/tenants",
    title: "Tenants",
    description: "View applicants with confirmed tenancy.",
    icon: Home,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Essex Haven
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Subsidized housing management for Essex Property Trust
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {links.map((link) => (
          <Card key={link.href} className="flex flex-col">
            <CardHeader>
              <link.icon className="mb-2 h-8 w-8 text-emerald-700" />
              <CardTitle>{link.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <p className="text-sm text-slate-600">{link.description}</p>
              <Button asChild>
                <Link href={link.href}>Open {link.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
