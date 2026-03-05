"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MonthCalendar } from "@/components/MonthCalendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CollectionDay, PickupDay } from "@/types";

interface MonthNavigatorProps {
  pickupDay: PickupDay;
  initialYear: number;
  initialMonth: number;
  initialData: CollectionDay[];
}

export function MonthNavigator({
  pickupDay,
  initialYear,
  initialMonth,
  initialData,
}: MonthNavigatorProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState<CollectionDay[]>(initialData);
  const [loading, setLoading] = useState(false);

  const isInitial = year === initialYear && month === initialMonth;

  useEffect(() => {
    if (isInitial) {
      setData(initialData);
      return;
    }

    setLoading(true);
    fetch(`/api/schedule?day=${pickupDay}&year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [year, month, pickupDay, isInitial, initialData]);

  function goToPrev() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNext() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToToday() {
    setYear(initialYear);
    setMonth(initialMonth);
  }

  const monthLabel = new Date(year, month).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={goToPrev} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{monthLabel}</span>
          {!isInitial && (
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
              Today
            </Button>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={goToNext} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        <MonthCalendar
          year={year}
          month={month}
          collectionDays={data}
          hideHeader
        />
      </div>
    </div>
  );
}
