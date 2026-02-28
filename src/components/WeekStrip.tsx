import { cn } from "@/lib/utils";
import { CollectionBadge } from "@/components/CollectionBadge";
import { getCurrentWeekRange, isSameDay } from "@/lib/dateUtils";
import type { CollectionDay } from "@/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface WeekStripProps {
  collectionDays: CollectionDay[];
}

export function WeekStrip({ collectionDays }: WeekStripProps) {
  const today = new Date();
  const { start } = getCurrentWeekRange(today);

  // Build 7 days of the week
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });

  // Map collection dates for quick lookup
  const collectionMap = new Map<string, CollectionDay>();
  for (const cd of collectionDays) {
    collectionMap.set(cd.collection_date, cd);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
      {days.map((date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const collection = collectionMap.get(dateStr);
        const isToday = isSameDay(date, today);

        return (
          <div
            key={dateStr}
            className={cn(
              "flex-shrink-0 snap-center flex flex-col items-center rounded-lg border bg-card p-3 min-w-[80px] sm:min-w-[100px] sm:flex-1",
              isToday && "ring-2 ring-primary border-primary"
            )}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {DAY_NAMES[date.getDay()]}
            </span>
            <span
              className={cn(
                "text-lg font-bold mt-1",
                isToday && "text-primary"
              )}
            >
              {date.getDate()}
            </span>
            <div className="mt-2 min-h-[24px]">
              {collection && (
                <CollectionBadge type={collection.collection_type} compact />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
