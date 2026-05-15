import { NextResponse } from "next/server";
import { getApplicantById } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const applicant = await getApplicantById(id);
  if (!applicant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(applicant);
}
