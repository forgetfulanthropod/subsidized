import { NextResponse } from "next/server";
import { getVacancies } from "@/lib/data";

export async function GET() {
  const vacancies = await getVacancies();
  return NextResponse.json(vacancies);
}
