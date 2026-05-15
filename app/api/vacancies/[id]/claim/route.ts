import { NextResponse } from "next/server";
import { z } from "zod";
import { getVacancies, saveVacancies } from "@/lib/data";
import type { CaseManagerId } from "@/types";

const bodySchema = z.object({
  caseManagerId: z.enum([
    "case-manager-1",
    "case-manager-2",
    "case-manager-3",
  ]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = bodySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const vacancies = await getVacancies();
  const index = vacancies.findIndex((v) => v.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const vacancy = vacancies[index];
  if (vacancy.assignedCaseManagerId) {
    return NextResponse.json(
      { error: "Already claimed by another case manager" },
      { status: 409 }
    );
  }

  vacancy.assignedCaseManagerId = body.data.caseManagerId as CaseManagerId;
  vacancies[index] = vacancy;
  await saveVacancies(vacancies);

  return NextResponse.json(vacancy);
}
