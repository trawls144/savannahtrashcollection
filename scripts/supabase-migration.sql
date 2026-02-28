-- Savannah Trash Collection — Supabase Migration
-- Run this in the Supabase SQL Editor to set up the database.

-- 1. Enable PostGIS (required for zone polygon queries)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Collection Days table
CREATE TABLE IF NOT EXISTS collection_days (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pickup_day text NOT NULL CHECK (pickup_day IN ('monday', 'tuesday', 'wednesday', 'thursday')),
  collection_date date NOT NULL,
  collection_type text NOT NULL CHECK (collection_type IN ('garbage', 'recycling', 'yard_waste', 'holiday_skip')),
  UNIQUE (pickup_day, collection_date, collection_type)
);

CREATE INDEX IF NOT EXISTS idx_collection_days_lookup
  ON collection_days (pickup_day, collection_date);

-- 3. Collection Zones table (PostGIS)
CREATE TABLE IF NOT EXISTS collection_zones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pickup_day text NOT NULL CHECK (pickup_day IN ('monday', 'tuesday', 'wednesday', 'thursday')),
  zone_polygon geometry(Polygon, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_zones_polygon
  ON collection_zones USING GIST (zone_polygon);

-- 4. RPC function for point-in-polygon lookup
CREATE OR REPLACE FUNCTION lookup_zone(lon double precision, lat double precision)
RETURNS TABLE (pickup_day text)
LANGUAGE sql
STABLE
AS $$
  SELECT cz.pickup_day
  FROM collection_zones cz
  WHERE ST_Contains(cz.zone_polygon, ST_SetSRID(ST_MakePoint(lon, lat), 4326))
  LIMIT 1;
$$;

-- 5. Row Level Security
ALTER TABLE collection_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_zones ENABLE ROW LEVEL SECURITY;

-- Allow public read access (no auth required)
CREATE POLICY "Allow public read on collection_days"
  ON collection_days FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on collection_zones"
  ON collection_zones FOR SELECT
  USING (true);
