import { NextResponse } from "next/server";
import { receivePurchase } from "@/lib/server/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await receivePurchase(decodeURIComponent(id));

  if (!result) {
    return NextResponse.json(
      { error: "Purchase not found or already received" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
