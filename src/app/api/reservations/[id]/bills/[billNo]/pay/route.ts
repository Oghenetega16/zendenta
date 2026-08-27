import { NextResponse } from "next/server";
import { payBill } from "@/lib/server/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; billNo: string }> }
) {
  const { id, billNo } = await params;
  const body = await request.json().catch(() => ({}));
  const accountId = typeof body.accountId === "string" ? body.accountId : undefined;

  const reservation = await payBill(decodeURIComponent(id), decodeURIComponent(billNo), accountId);

  if (!reservation) {
    return NextResponse.json(
      { error: "Reservation or bill not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ reservation });
}
