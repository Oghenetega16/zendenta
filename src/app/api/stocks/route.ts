import { NextResponse } from "next/server";
import { listStocks } from "@/lib/server/store";

export async function GET() {
  const stocks = await listStocks();
  return NextResponse.json({ stocks });
}
