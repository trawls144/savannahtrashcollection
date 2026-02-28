import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Rough bounding box for Savannah, GA metro area
const SAVANNAH_BOUNDS = {
  south: 31.9,
  north: 32.15,
  west: -81.25,
  east: -81.0,
};

function isInSavannah(lat: number, lng: number): boolean {
  return (
    lat >= SAVANNAH_BOUNDS.south &&
    lat <= SAVANNAH_BOUNDS.north &&
    lng >= SAVANNAH_BOUNDS.west &&
    lng <= SAVANNAH_BOUNDS.east
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Please enter an address." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Address lookup is not configured yet." },
        { status: 503 }
      );
    }

    // Geocode the address
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ", Savannah, GA")}&key=${apiKey}`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (
      geocodeData.status !== "OK" ||
      !geocodeData.results ||
      geocodeData.results.length === 0
    ) {
      return NextResponse.json(
        { error: "Could not find that address. Please try again." },
        { status: 404 }
      );
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;

    // Check if within Savannah bounds
    if (!isInSavannah(lat, lng)) {
      return NextResponse.json(
        {
          error:
            "This address appears to be outside the Savannah service area.",
        },
        { status: 400 }
      );
    }

    // Query Supabase for the collection zone containing this point
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Database is not configured yet." },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // PostGIS point-in-polygon query
    const { data, error } = await supabase.rpc("lookup_zone", {
      lon: lng,
      lat: lat,
    });

    if (error) {
      console.error("Zone lookup error:", error);
      return NextResponse.json(
        { error: "Could not determine your pickup zone." },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            "Your address was found but is not in a collection zone. It may be outside the city limits.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ pickupDay: data[0].pickup_day });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
