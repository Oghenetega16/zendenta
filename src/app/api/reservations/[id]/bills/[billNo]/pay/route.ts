import { NextResponse } from "next/server";
import { payBill } from "@/lib/server/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; billNo: string }> }
) {
  const { id, billNo } = await params;
  const reservation = await payBill(decodeURIComponent(id), decodeURIComponent(billNo));

  if (!reservation) {
    return NextResponse.json(
      { error: "Reservation or bill not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ reservation });
}
