import { NextResponse } from "next/server";
import { setPaymentMethodEnabled } from "@/lib/server/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "Expected { enabled: boolean }" }, { status: 400 });
  }

  const method = await setPaymentMethodEnabled(decodeURIComponent(id), body.enabled);

  if (!method) {
    return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
  }

  return NextResponse.json({ method });
}
