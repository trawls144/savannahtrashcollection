import { NextRequest, NextResponse } from "next/server";
import { getCollectionDays } from "@/lib/schedule";
import type { PickupDay } from "@/types";

const VALID_DAYS = ["monday", "tuesday", "wednesday", "thursday"];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const day = searchParams.get("day");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!day || !year || !month || !VALID_DAYS.includes(day)) {
    return NextResponse.json(
      { error: "Missing or invalid query params: day, year, month" },
      { status: 400 }
    );
  }

  const y = parseInt(year, 10);
  const m = parseInt(month, 10);

  if (isNaN(y) || isNaN(m) || m < 0 || m > 11) {
    return NextResponse.json(
      { error: "Invalid year or month" },
      { status: 400 }
    );
  }

  const startDate = new Date(y, m, 1);
  const endDate = new Date(y, m + 1, 0);

  const data = await getCollectionDays(day as PickupDay, startDate, endDate);

  return NextResponse.json(data);
}
