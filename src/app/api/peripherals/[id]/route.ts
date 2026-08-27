import { NextResponse } from "next/server";
import { updatePeripheralStatus } from "@/lib/server/store";
import { PeripheralStatus } from "@/types";

const validStatuses: PeripheralStatus[] = ["active", "maintenance", "retired"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const peripheral = await updatePeripheralStatus(decodeURIComponent(id), body.status);

  if (!peripheral) {
    return NextResponse.json({ error: "Peripheral not found" }, { status: 404 });
  }

  return NextResponse.json({ peripheral });
}
