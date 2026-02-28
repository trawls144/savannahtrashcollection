export type PickupDay = "monday" | "tuesday" | "wednesday" | "thursday";

export type CollectionType =
  | "garbage"
  | "recycling"
  | "yard_waste"
  | "holiday_skip";

export interface CollectionDay {
  id: string;
  pickup_day: PickupDay;
  collection_date: string; // ISO date string YYYY-MM-DD
  collection_type: CollectionType;
}

export interface CollectionZone {
  id: string;
  pickup_day: PickupDay;
  zone_polygon: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface LookupZoneRequest {
  address: string;
}

export interface LookupZoneResponse {
  pickupDay?: PickupDay;
  error?: string;
}
