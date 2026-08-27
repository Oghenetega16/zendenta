import { NextResponse } from "next/server";
import { listPeripherals } from "@/lib/server/store";

export async function GET() {
  const peripherals = await listPeripherals();
  return NextResponse.json({ peripherals });
}
