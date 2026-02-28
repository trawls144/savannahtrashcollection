import { getSupabase } from "./supabase";
import { formatDate } from "./dateUtils";
import type { CollectionDay, PickupDay } from "@/types";

/**
 * Fetch collection days for a specific pickup day within a date range.
 * Returns an empty array if Supabase is not configured.
 */
export async function getCollectionDays(
  pickupDay: PickupDay,
  startDate: Date,
  endDate: Date
): Promise<CollectionDay[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("collection_days")
    .select("*")
    .eq("pickup_day", pickupDay)
    .gte("collection_date", formatDate(startDate))
    .lte("collection_date", formatDate(endDate))
    .order("collection_date", { ascending: true });

  if (error) {
    console.error("Error fetching collection days:", error);
    return [];
  }

  return data as CollectionDay[];
}

/**
 * Fetch all collection days for a pickup day in a given month.
 */
export async function getMonthCollectionDays(
  pickupDay: PickupDay,
  year: number,
  month: number
): Promise<CollectionDay[]> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  return getCollectionDays(pickupDay, startDate, endDate);
}
