import { NextResponse } from "next/server";
import { listPaymentMethods } from "@/lib/server/store";

export async function GET() {
  const methods = await listPaymentMethods();
  return NextResponse.json({ methods });
}
