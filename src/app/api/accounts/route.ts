import { NextResponse } from "next/server";
import { listAccountsWithTotals } from "@/lib/server/store";

export async function GET() {
  const accounts = await listAccountsWithTotals();
  return NextResponse.json({ accounts });
}
