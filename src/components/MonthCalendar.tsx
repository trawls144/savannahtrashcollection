import { cn } from "@/lib/utils";
import { CollectionBadge } from "@/components/CollectionBadge";
import { getMonthGrid, isSameDay } from "@/lib/dateUtils";
import type { CollectionDay } from "@/types";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed
  collectionDays: CollectionDay[];
}

export function MonthCalendar({
  year,
  month,
  collectionDays,
}: MonthCalendarProps) {
  const today = new Date();
  const grid = getMonthGrid(year, month);
  const monthName = new Date(year, month).toLocaleString("en-US", {
    month: "long",
  });

  // Map collection dates for quick lookup
  const collectionMap = new Map<string, CollectionDay>();
  for (const cd of collectionDays) {
    collectionMap.set(cd.collection_date, cd);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        {monthName} {year}
      </h3>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.flat().map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-16 sm:h-20" />;
          }

          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const collection = collectionMap.get(dateStr);
          const isToday = isSameDay(date, today);

          return (
            <div
              key={dateStr}
              className={cn(
                "h-16 sm:h-20 rounded-md border p-1 flex flex-col items-center",
                isToday && "ring-2 ring-primary border-primary bg-primary/5"
              )}
            >
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium",
                  isToday && "text-primary font-bold"
                )}
              >
                {date.getDate()}
              </span>
              {collection && (
                <div className="mt-auto mb-1">
                  <CollectionBadge
                    type={collection.collection_type}
                    compact
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-sm">
        <div className="flex items-center gap-1">
          <CollectionBadge type="garbage" />
        </div>
        <div className="flex items-center gap-1">
          <CollectionBadge type="recycling" />
        </div>
        <div className="flex items-center gap-1">
          <CollectionBadge type="yard_waste" />
        </div>
        <div className="flex items-center gap-1">
          <CollectionBadge type="holiday_skip" />
        </div>
      </div>
    </div>
  );
}
