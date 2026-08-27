import { NextResponse } from "next/server";
import { listPurchases } from "@/lib/server/store";

export async function GET() {
  const purchases = await listPurchases();
  return NextResponse.json({ purchases });
}
