import { NextResponse } from "next/server";
import { getReservation } from "@/lib/server/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reservation = await getReservation(decodeURIComponent(id));

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  return NextResponse.json({ reservation });
}
