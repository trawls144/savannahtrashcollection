/**
 * Seed script for Savannah collection zone polygons.
 *
 * The Savannah-Collection-Map.pdf shows four color-coded zones:
 *   - Pink/Salmon (south & southeast) → Thursday
 *   - Purple/Lavender (northwest & central) → Monday
 *   - Green/Lime (northeast) → Tuesday
 *   - Yellow/Olive (east-central) → Wednesday
 *
 * These zone boundaries need to be digitized into GeoJSON polygons
 * using a tool like geojson.io, then stored in Supabase with PostGIS.
 *
 * Steps to complete this script:
 * 1. Enable PostGIS extension in Supabase: CREATE EXTENSION IF NOT EXISTS postgis;
 * 2. Create the collection_zones table:
 *    CREATE TABLE collection_zones (
 *      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *      pickup_day text NOT NULL,
 *      zone_polygon geometry(Polygon, 4326) NOT NULL
 *    );
 *    CREATE INDEX idx_zones_polygon ON collection_zones USING GIST (zone_polygon);
 * 3. Trace zone boundaries from the map PDF using geojson.io
 * 4. Add the GeoJSON coordinates below
 * 5. Run this script to seed the zones
 *
 * Alternative: Check https://data.savannah.gov for existing sanitation zone shapefiles.
 *
 * Usage:
 *   npx tsx scripts/seed-zones.ts
 */

import { createClient } from "@supabase/supabase-js";

interface ZoneData {
  pickup_day: string;
  coordinates: number[][][]; // GeoJSON Polygon coordinates
}

// TODO: Replace with actual digitized zone boundaries from the map PDF
const zones: ZoneData[] = [
  {
    pickup_day: "monday",
    coordinates: [
      // Placeholder — trace the purple/lavender zone from Savannah-Collection-Map.pdf
      // using geojson.io and paste coordinates here
    ],
  },
  {
    pickup_day: "tuesday",
    coordinates: [
      // Placeholder — trace the green/lime zone
    ],
  },
  {
    pickup_day: "wednesday",
    coordinates: [
      // Placeholder — trace the yellow/olive zone
    ],
  },
  {
    pickup_day: "thursday",
    coordinates: [
      // Placeholder — trace the pink/salmon zone
    ],
  },
];

async function seed(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    console.log("Set env vars and re-run to seed Supabase.");
    console.log(
      "\nNote: Zone polygons still need to be digitized from the map PDF."
    );
    console.log("Use geojson.io to trace the zone boundaries and add coordinates above.");
    return;
  }

  const hasCoordinates = zones.every((z) => z.coordinates.length > 0);
  if (!hasCoordinates) {
    console.log("Zone coordinates are empty — please digitize the map boundaries first.");
    console.log("Use geojson.io to trace zones from Savannah-Collection-Map.pdf");
    return;
  }

  const supabase = createClient(url, key);

  // Clear existing zones
  console.log("Clearing existing collection_zones...");
  const { error: deleteError } = await supabase
    .from("collection_zones")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

  if (deleteError) {
    console.error("Error clearing zones:", deleteError);
    process.exit(1);
  }

  // Insert zones using PostGIS
  for (const zone of zones) {
    const geojson = {
      type: "Polygon",
      coordinates: zone.coordinates,
    };

    const { error } = await supabase.from("collection_zones").insert({
      pickup_day: zone.pickup_day,
      zone_polygon: JSON.stringify(geojson),
    });

    if (error) {
      console.error(`Error inserting ${zone.pickup_day} zone:`, error);
      process.exit(1);
    }

    console.log(`  Inserted ${zone.pickup_day} zone`);
  }

  console.log("\nDone! Seeded 4 collection zones.");
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
