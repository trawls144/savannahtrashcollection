/**
 * Get the start (Sunday) and end (Saturday) of the current week.
 */
export function getCurrentWeekRange(today: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay()); // Sunday
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get the first and last day of the current month.
 */
export function getCurrentMonthRange(today: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Format a Date as YYYY-MM-DD.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Check if two dates are the same calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Get all days in a month as a grid (array of weeks, each week is 7 days).
 * Days outside the month are null.
 */
export function getMonthGrid(
  year: number,
  month: number
): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const grid: (Date | null)[][] = [];

  let currentWeek: (Date | null)[] = [];

  // Fill leading nulls for days before the 1st
  for (let i = 0; i < firstDay.getDay(); i++) {
    currentWeek.push(null);
  }

  // Fill in actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    currentWeek.push(new Date(year, month, d));
    if (currentWeek.length === 7) {
      grid.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill trailing nulls
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    grid.push(currentWeek);
  }

  return grid;
}
