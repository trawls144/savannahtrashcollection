/**
 * Seed script for the Savannah 2026 Trash Collection Schedule.
 *
 * Data extracted from the official 2026 Sanitation Schedule PDFs:
 * - savannah-collection-monday.pdf
 * - Savannah-colletction-tuesday.pdf
 * - Savannah-colletion-wednesday.pdf
 * - Savannah-collection-thursday.pdf
 *
 * Color key from PDFs:
 *   Yellow               = Garbage Collection
 *   Yellow + recycle icon = Curbside Recycling & Garbage Collection Day
 *   Green                = Yard Waste Collection Day
 *   Blue                 = City Holiday (no collection)
 *
 * Usage:
 *   npx tsx scripts/seed-schedule.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */

import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PickupDay = "monday" | "tuesday" | "wednesday" | "thursday";
type CollectionType = "garbage" | "recycling" | "yard_waste" | "holiday_skip";

interface SeedRow {
  pickup_day: PickupDay;
  collection_date: string; // YYYY-MM-DD
  collection_type: CollectionType;
}

// ---------------------------------------------------------------------------
// Helper: turn "YYYY-MM-DD" strings from shorthand arrays into SeedRows
// ---------------------------------------------------------------------------
function makeDates(
  day: PickupDay,
  type: CollectionType,
  dates: string[]
): SeedRow[] {
  return dates.map((d) => ({
    pickup_day: day,
    collection_date: d,
    collection_type: type,
  }));
}

// ---------------------------------------------------------------------------
// 2026 Schedule Data — extracted from official PDFs
// ---------------------------------------------------------------------------

// ======================== MONDAY ========================
// Pattern: Recycling+Garbage and Yard Waste alternate biweekly.
// Holidays that fall on Monday: Jan 19 (MLK), May 25 (Memorial Day), Sep 7 (Labor Day)

const mondayRecycling = [
  "2026-01-05",
  "2026-02-02", "2026-02-16",
  "2026-03-02", "2026-03-16", "2026-03-30",
  "2026-04-06", "2026-04-20",
  "2026-05-04", "2026-05-18",
  "2026-06-01", "2026-06-15", "2026-06-29",
  "2026-07-06", "2026-07-20",
  "2026-08-03", "2026-08-17", "2026-08-31",
  "2026-09-21",
  "2026-10-05", "2026-10-19",
  "2026-11-02", "2026-11-16", "2026-11-30",
  "2026-12-07", "2026-12-21",
]; // 26 dates

const mondayYardWaste = [
  "2026-01-12", "2026-01-26",
  "2026-02-09", "2026-02-23",
  "2026-03-09", "2026-03-23",
  "2026-04-13", "2026-04-27",
  "2026-05-11",
  "2026-06-08", "2026-06-22",
  "2026-07-13", "2026-07-27",
  "2026-08-10", "2026-08-24",
  "2026-09-14", "2026-09-28",
  "2026-10-12", "2026-10-26",
  "2026-11-09", "2026-11-23",
  "2026-12-14", "2026-12-28",
]; // 23 dates

const mondayHolidays = [
  "2026-01-19", // Martin Luther King Jr. Day
  "2026-05-25", // Memorial Day
  "2026-09-07", // Labor Day
]; // 3 dates — Total Monday: 26 + 23 + 3 = 52 ✓

// ======================== TUESDAY ========================
// Pattern: Recycling+Garbage and Yard Waste alternate biweekly, starting
// with Recycling on Jan 6.
// No city holidays fall on Tuesday in 2026.

const tuesdayRecycling = [
  "2026-01-06", "2026-01-20",
  "2026-02-03", "2026-02-17",
  "2026-03-03", "2026-03-17", "2026-03-31",
  "2026-04-14", "2026-04-28",
  "2026-05-12", "2026-05-26",
  "2026-06-09", "2026-06-23",
  "2026-07-07", "2026-07-21",
  "2026-08-04", "2026-08-18",
  "2026-09-01", "2026-09-15", "2026-09-29",
  "2026-10-13", "2026-10-27",
  "2026-11-10", "2026-11-24",
  "2026-12-08", "2026-12-22",
]; // 26 dates

const tuesdayYardWaste = [
  "2026-01-13", "2026-01-27",
  "2026-02-10", "2026-02-24",
  "2026-03-10", "2026-03-24",
  "2026-04-07", "2026-04-21",
  "2026-05-05", "2026-05-19",
  "2026-06-02", "2026-06-16", "2026-06-30",
  "2026-07-14", "2026-07-28",
  "2026-08-11", "2026-08-25",
  "2026-09-08", "2026-09-22",
  "2026-10-06", "2026-10-20",
  "2026-11-03", "2026-11-17",
  "2026-12-01", "2026-12-15", "2026-12-29",
]; // 26 dates

const tuesdayHolidays: string[] = []; // 0 — Total Tuesday: 26 + 26 = 52 ✓

// ======================== WEDNESDAY ========================
// Pattern: Recycling+Garbage and Yard Waste alternate biweekly, starting
// with Recycling on Jan 7.
// No city holidays fall on Wednesday in 2026.

const wednesdayRecycling = [
  "2026-01-07", "2026-01-21",
  "2026-02-04", "2026-02-18",
  "2026-03-04", "2026-03-18",
  "2026-04-01", "2026-04-15", "2026-04-29",
  "2026-05-13", "2026-05-27",
  "2026-06-10", "2026-06-24",
  "2026-07-08", "2026-07-22",
  "2026-08-05", "2026-08-19",
  "2026-09-02", "2026-09-16", "2026-09-30",
  "2026-10-14", "2026-10-28",
  "2026-11-11", "2026-11-25",
  "2026-12-09", "2026-12-23",
]; // 26 dates

const wednesdayYardWaste = [
  "2026-01-14", "2026-01-28",
  "2026-02-11", "2026-02-25",
  "2026-03-11", "2026-03-25",
  "2026-04-08", "2026-04-22",
  "2026-05-06", "2026-05-20",
  "2026-06-03", "2026-06-17",
  "2026-07-01", "2026-07-15", "2026-07-29",
  "2026-08-12", "2026-08-26",
  "2026-09-09", "2026-09-23",
  "2026-10-07", "2026-10-21",
  "2026-11-04", "2026-11-18",
  "2026-12-02", "2026-12-16", "2026-12-30",
]; // 26 dates

const wednesdayHolidays: string[] = []; // 0 — Total Wednesday: 26 + 26 = 52 ✓

// ======================== THURSDAY ========================
// Pattern: Recycling+Garbage and Yard Waste alternate biweekly, starting
// with Recycling on Jan 8 (Jan 1 is a holiday).
// Holidays on Thursday: Jan 1 (New Year's Day), Nov 26 (Thanksgiving)

const thursdayRecycling = [
  "2026-01-08", "2026-01-22",
  "2026-02-05", "2026-02-19",
  "2026-03-05", "2026-03-19",
  "2026-04-02", "2026-04-16", "2026-04-30",
  "2026-05-14", "2026-05-28",
  "2026-06-11", "2026-06-25",
  "2026-07-09", "2026-07-23",
  "2026-08-06", "2026-08-20",
  "2026-09-03", "2026-09-17",
  "2026-10-01", "2026-10-15", "2026-10-29",
  "2026-11-12",
  "2026-12-03", "2026-12-17", "2026-12-31",
]; // 26 dates

const thursdayYardWaste = [
  "2026-01-15", "2026-01-29",
  "2026-02-12", "2026-02-26",
  "2026-03-12", "2026-03-26",
  "2026-04-09", "2026-04-23",
  "2026-05-07", "2026-05-21",
  "2026-06-04", "2026-06-18",
  "2026-07-02", "2026-07-16", "2026-07-30",
  "2026-08-13", "2026-08-27",
  "2026-09-10", "2026-09-24",
  "2026-10-08", "2026-10-22",
  "2026-11-05", "2026-11-19",
  "2026-12-10", "2026-12-24",
]; // 25 dates

const thursdayHolidays = [
  "2026-01-01", // New Year's Day
  "2026-11-26", // Thanksgiving Day
]; // 2 dates — Total Thursday: 26 + 25 + 2 = 53 ✓

// ---------------------------------------------------------------------------
// Assemble all rows
// ---------------------------------------------------------------------------
function buildAllRows(): SeedRow[] {
  const rows: SeedRow[] = [];

  // Monday
  rows.push(...makeDates("monday", "recycling", mondayRecycling));
  rows.push(...makeDates("monday", "yard_waste", mondayYardWaste));
  rows.push(...makeDates("monday", "holiday_skip", mondayHolidays));

  // Tuesday
  rows.push(...makeDates("tuesday", "recycling", tuesdayRecycling));
  rows.push(...makeDates("tuesday", "yard_waste", tuesdayYardWaste));
  rows.push(...makeDates("tuesday", "holiday_skip", tuesdayHolidays));

  // Wednesday
  rows.push(...makeDates("wednesday", "recycling", wednesdayRecycling));
  rows.push(...makeDates("wednesday", "yard_waste", wednesdayYardWaste));
  rows.push(...makeDates("wednesday", "holiday_skip", wednesdayHolidays));

  // Thursday
  rows.push(...makeDates("thursday", "recycling", thursdayRecycling));
  rows.push(...makeDates("thursday", "yard_waste", thursdayYardWaste));
  rows.push(...makeDates("thursday", "holiday_skip", thursdayHolidays));

  return rows;
}

// ---------------------------------------------------------------------------
// Validation: verify every date falls on the expected weekday
// ---------------------------------------------------------------------------
const dayIndex: Record<PickupDay, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
};

function validate(rows: SeedRow[]): void {
  const errors: string[] = [];

  for (const row of rows) {
    const date = new Date(row.collection_date + "T00:00:00");
    const expected = dayIndex[row.pickup_day];

    if (date.getUTCDay() !== expected) {
      errors.push(
        `${row.collection_date} is ${date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })}, expected ${row.pickup_day}`
      );
    }
  }

  if (errors.length > 0) {
    console.error("Validation errors found:");
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Count totals per day
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.pickup_day] = (counts[row.pickup_day] || 0) + 1;
  }

  console.log("Validation passed. Counts per pickup day:");
  for (const [day, count] of Object.entries(counts).sort()) {
    console.log(`  ${day}: ${count} entries`);
  }
  console.log(`  Total: ${rows.length} entries`);
}

// ---------------------------------------------------------------------------
// Seed to Supabase
// ---------------------------------------------------------------------------
async function seed(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
    console.log("Running in validation-only mode.\n");
  }

  const rows = buildAllRows();

  // Always validate first
  validate(rows);

  if (!url || !key) {
    console.log("\nSkipping database insert (no credentials).");
    console.log("Set env vars and re-run to seed Supabase.");
    return;
  }

  const supabase = createClient(url, key);

  // Clear existing data
  console.log("\nClearing existing collection_days...");
  const { error: deleteError } = await supabase
    .from("collection_days")
    .delete()
    .gte("collection_date", "2026-01-01")
    .lte("collection_date", "2026-12-31");

  if (deleteError) {
    console.error("Error clearing existing data:", deleteError);
    process.exit(1);
  }

  // Insert in batches of 100
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("collection_days").insert(batch);

    if (error) {
      console.error(`Error inserting batch at index ${i}:`, error);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${rows.length} rows...`);
  }

  console.log(`\nDone! Seeded ${rows.length} collection_days rows.`);
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
