import { NextResponse } from "next/server";
import { getApplicants } from "@/lib/data";

export async function GET() {
  const applicants = await getApplicants();
  return NextResponse.json(applicants);
}
