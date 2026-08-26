import { NextResponse } from "next/server";
import { listPatients } from "@/lib/server/store";

export async function GET() {
  const patients = await listPatients();
  return NextResponse.json({ patients });
}
