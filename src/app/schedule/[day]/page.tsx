import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WeekStrip } from "@/components/WeekStrip";
import { MonthCalendar } from "@/components/MonthCalendar";
import { getCollectionDays } from "@/lib/schedule";
import { getCurrentWeekRange, getCurrentMonthRange } from "@/lib/dateUtils";
import type { PickupDay } from "@/types";
import { ChevronLeft } from "lucide-react";

const VALID_DAYS = ["monday", "tuesday", "wednesday", "thursday"] as const;

const dayLabels: Record<PickupDay, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
};

export const dynamic = "force-dynamic";

export default async function SchedulePage({
  params,
}: {
  params: { day: string };
}) {
  const day = params.day as PickupDay;

  if (!VALID_DAYS.includes(day as (typeof VALID_DAYS)[number])) {
    notFound();
  }

  const today = new Date();
  const { start: weekStart, end: weekEnd } = getCurrentWeekRange(today);
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange(today);

  // Fetch week and month data in parallel
  const [weekDays, monthDays] = await Promise.all([
    getCollectionDays(day, weekStart, weekEnd),
    getCollectionDays(day, monthStart, monthEnd),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Back nav + title */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {dayLabels[day]} Collection Schedule
        </h1>
      </div>

      {/* Day selector pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {VALID_DAYS.map((d) => (
          <Link key={d} href={`/schedule/${d}`}>
            <Button
              variant={d === day ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              {dayLabels[d]}
            </Button>
          </Link>
        ))}
      </div>

      {/* Section A: This Week */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <WeekStrip collectionDays={weekDays} />
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Section B: This Month */}
      <Card>
        <CardHeader>
          <CardTitle>This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthCalendar
            year={today.getFullYear()}
            month={today.getMonth()}
            collectionDays={monthDays}
          />
        </CardContent>
      </Card>

      {/* Reminder */}
      <p className="text-sm text-muted-foreground text-center mt-6">
        Carts must be at curb by 7:00 AM. Bulk items collected same day as
        trash, no scheduling required.
      </p>
    </div>
  );
}
