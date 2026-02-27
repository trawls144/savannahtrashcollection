# PRD: Savannah Trash Collection Day Finder
**Version:** 1.0  
**Stack:** Next.js 14 (App Router) · Vercel · Supabase · shadcn/ui  
**Author:** Trevor  
**Status:** Ready for Claude Code

---

## 1. Overview

A public-facing web app that helps Savannah, GA residents instantly see when their trash, recycling, and yard waste will be picked up — both for the current week and current month. An optional address lookup feature uses the city's collection zone map to identify a user's pickup day if they don't already know it.

---

## 2. Goals

- Show the current week's and current month's collection schedule based on a user's selected pickup day
- Highlight garbage, recycling (curbside), and yard waste dates distinctly
- Allow users to look up their pickup day by entering a Savannah address
- Be fast, mobile-friendly, and require zero login or account creation

---

## 3. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + ISR for fast, SEO-friendly pages |
| Hosting | Vercel | Native Next.js support, easy env management |
| Database | Supabase (Postgres) | Store pre-parsed 2026 schedule data; free tier sufficient |
| UI Components | shadcn/ui + Tailwind CSS | Accessible, composable, consistent |
| Address Lookup | Google Maps Geocoding API | Convert address → lat/lng, then check zone |
| Zone Detection | Supabase PostGIS or GeoJSON polygon lookup | Map zone polygons stored and queried by point |

---

## 4. Data Model

### 4.1 Collection Schedule

Pre-parse the 2026 PDF schedules into a database table.

**Table: `collection_days`**

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `pickup_day` | text | `monday`, `tuesday`, `wednesday`, `thursday` |
| `collection_date` | date | The actual calendar date |
| `collection_type` | text | `garbage`, `recycling`, `yard_waste`, `holiday_skip` |

**Data notes from PDFs:**
- Each day-of-week has its own 2026 calendar with highlighted dates
- Yellow = Garbage Collection
- Yellow + recycling icon = Curbside Recycling & Garbage Collection Day
- Green = Yard Waste Collection Day
- Blue = City Holiday (non-collection day — collection shifts)
- All four schedules (Mon/Tue/Wed/Thu) must be fully seeded

### 4.2 Collection Zones (Address Lookup)

**Table: `collection_zones`** *(PostGIS enabled)*

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `pickup_day` | text | `monday`, `tuesday`, `wednesday`, `thursday` |
| `zone_polygon` | geometry(Polygon, 4326) | GeoJSON polygon of the zone boundary |

> **Implementation note:** The Savannah Collection Map PDF shows color-coded zones by pickup day. These polygons need to be digitized into GeoJSON format. Use the map PDF as a reference to manually trace zone boundaries using a tool like geojson.io, then seed them into Supabase with PostGIS. This is a one-time setup step.

---

## 5. Features & Pages

### 5.1 Home Page (`/`)

**Layout:**
- Hero section: App name, tagline ("Know before you roll your cart out")
- Two primary action cards (shadcn `Card` components):
  1. **"I know my pickup day"** → Select from Mon/Tue/Wed/Thu dropdown → go to `/schedule/[day]`
  2. **"Not sure? Look up by address"** → Address input → triggers zone lookup → redirect to `/schedule/[day]`

**Component breakdown:**
- `DaySelector` — shadcn `Select` with the four weekday options
- `AddressLookup` — shadcn `Input` + `Button`, calls `/api/lookup-zone`

---

### 5.2 Schedule Page (`/schedule/[day]`)

**URL params:** `day` = `monday` | `tuesday` | `wednesday` | `thursday`

**Page sections (top to bottom):**

#### Section A: This Week's Collection
- Displays the **current calendar week (Sun–Sat)** as a horizontal 7-day strip
- Uses shadcn `Card` per day; today's date always visible
- Each day tile shows:
  - Day name + date number
  - Badge/pill for collection type if applicable:
    - 🟡 **Garbage** (yellow badge)
    - ♻️ **Recycling + Garbage** (green badge)
    - 🌿 **Yard Waste** (teal badge)
    - 🏛️ **Holiday** (gray badge, "No Collection")
  - Today's tile highlighted with a distinct border/ring

#### Section B: This Month's Calendar
- Full month grid calendar view (Sun–Sat columns)
- Same badge/pill system for collection types
- Uses shadcn `Badge` and a custom calendar grid component (not react-day-picker — build a simple one to allow custom rendering per cell)
- Non-current-month days grayed out
- Today's date circled

**Data fetching:**
- On page load, query Supabase for all `collection_days` where `pickup_day = [day]` and `collection_date` falls within current month
- Cache aggressively (ISR with 24hr revalidation — schedule never changes mid-day)

---

### 5.3 API Routes

#### `POST /api/lookup-zone`
- **Request body:** `{ address: string }`
- **Logic:**
  1. Call Google Maps Geocoding API with the address
  2. Validate result is within Savannah, GA bounds (rough bounding box check)
  3. Query Supabase: `SELECT pickup_day FROM collection_zones WHERE ST_Contains(zone_polygon, ST_SetSRID(ST_MakePoint(lng, lat), 4326))`
  4. Return `{ pickupDay: "thursday" }` or `{ error: "Address not found in service area" }`
- **Error states:** Address not in Savannah, geocoding failure, address not in any zone

---

## 6. UI/UX Design Specs

### Color Legend (consistent throughout)
| Collection Type | Color | shadcn Badge Variant |
|---|---|---|
| Garbage only | Yellow (`#FCD34D`) | Custom yellow |
| Recycling + Garbage | Green (`#4ADE80`) | Custom green |
| Yard Waste | Teal (`#2DD4BF`) | Custom teal |
| Holiday / No Collection | Gray (`#9CA3AF`) | Secondary |

### Key shadcn Components Used
- `Card`, `CardContent`, `CardHeader` — main layout containers
- `Badge` — collection type indicators
- `Select` — day picker on home page
- `Input`, `Button` — address lookup form
- `Separator` — section dividers
- `Skeleton` — loading states
- `Alert` — error messages (address not found, etc.)
- `Tooltip` — explain what recycling day means on hover

### Responsive Design
- Mobile-first
- Week strip: horizontal scroll on mobile, full row on desktop
- Month calendar: always full grid, cells shrink on mobile (date number + icon only)

---

## 7. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Maps (server-side only)
GOOGLE_MAPS_API_KEY=
```

---

## 8. Project Structure

```
/app
  /page.tsx                   # Home page
  /schedule
    /[day]
      /page.tsx               # Schedule page
  /api
    /lookup-zone
      /route.ts               # Address → zone API route

/components
  /DaySelector.tsx
  /AddressLookup.tsx
  /WeekStrip.tsx              # This week's 7-day view
  /MonthCalendar.tsx          # Full month grid
  /CollectionBadge.tsx        # Reusable badge for collection types
  /ZoneLookupResult.tsx       # Result card after address lookup

/lib
  /supabase.ts                # Supabase client
  /schedule.ts                # Data fetching helpers
  /dateUtils.ts               # Week/month calculation helpers

/scripts
  /seed-schedule.ts           # One-time script to seed all 2026 schedule data
  /seed-zones.ts              # One-time script to seed zone GeoJSON polygons

/types
  /index.ts                   # Shared TypeScript types
```

---

## 9. Data Seeding Reference

Use this data to build the seed script for `collection_days`. The following is extracted from the 2026 PDF schedules.

### Monday Schedule (2026)
**Garbage collection** every Monday unless holiday.  
**Recycling + Garbage** (biweekly): Jan 5, Jan 19, Feb 2, Feb 16, Mar 2, Mar 16, Mar 30, Apr 6, Apr 20, May 4, May 18, Jun 1, Jun 15, Jun 29, Jul 6, Jul 20, Aug 3, Aug 17, Sep 7, Sep 21, Oct 5, Oct 19, Nov 2, Nov 16, Nov 30, Dec 7, Dec 21  
**Yard Waste**: Jan 12, Jan 26, Feb 9, Feb 23, Mar 9, Mar 23, Apr 13, Apr 27, May 11, May 25, Jun 8, Jun 22, Jul 13, Jul 27, Aug 10, Aug 24, Sep 14, Sep 28, Oct 12, Oct 26, Nov 9, Nov 23, Dec 14, Dec 28  
**Holidays (no collection)**: Jan 19 (MLK), May 25 (Memorial Day), Jul 4 (Independence Day — observe), Sep 7 (Labor Day), Nov 26 (Thanksgiving), Dec 25 (Christmas)

> **Note for Claude Code:** Seed scripts should parse ALL four day-of-week PDFs completely. The seed data above is illustrative — Claude Code should reference the full calendar images provided and seed every highlighted date for all 12 months across all four pickup days (Monday, Tuesday, Wednesday, Thursday). The PDFs are the source of truth.

### Key Collection Rules (from PDFs — include in app UI)
- **Carts must be at curb by 7:00 AM**
- **Bulk items** collected same day as trash, weekly, no scheduling required. Free if under 5 min service time.
- **Yard Waste Rule 1 (Brown Bag):** Leaves/grass/sticks in biodegradable bags (15 bag limit), max 32 gallons
- **Yard Waste Rule 2 (Can It):** Max 32 gallon container, no garbage/recycling carts
- **Yard Waste Rule 3 (Stack It):** Bundles under 4ft long, 12" diameter, 40 lbs, removable in under 5 min
- **Recycling YES:** Hard plastic #1-7, glass, aluminum/tin/steel cans, paper/newspaper/magazines/junk mail, cardboard (liquid containers + dry)
- **Recycling NO:** Plastic bags, paint cans, clothing/bedding, toys/electronics, styrofoam, furniture/plastic chairs, yard waste, aluminum foil

---

## 10. Stretch Goals (Post-MVP)

| Feature | Notes |
|---|---|
| Push/email reminders | "Remind me the night before pickup" — would require user accounts or email capture |
| iCal export | Generate `.ics` file for user's pickup day so they can add to calendar |
| Holiday delay logic | Auto-calculate shifted collection when a holiday falls on pickup day |
| Multi-year support | Currently seeded for 2026 only; add 2027 when city releases schedule |
| Interactive zone map | Embed a Mapbox/Google Map showing the colored collection zones |

---

## 11. Deployment Checklist

- [ ] Initialize Next.js 14 app with App Router and TypeScript
- [ ] Install and configure shadcn/ui
- [ ] Set up Supabase project, enable PostGIS extension
- [ ] Create and run `seed-schedule.ts` for all four day schedules
- [ ] Digitize zone map polygons from PDF → GeoJSON → run `seed-zones.ts`
- [ ] Enable Google Maps Geocoding API, restrict to server-side usage
- [ ] Deploy to Vercel, set all environment variables
- [ ] Test address lookup with known Savannah addresses from each zone
- [ ] Verify current-week and current-month highlights render correctly for each pickup day
- [ ] Mobile responsiveness QA

---

## 12. Notes for Claude Code

1. **Start with the schedule data first.** Build and run the seed script before any UI work so you can test with real data.
2. **Zone polygons are the hardest part.** The PDF map shows color-coded zones but isn't machine-readable. You'll need to either: (a) use a hardcoded GeoJSON file traced from the map, or (b) find a Savannah open data GIS source. Check `https://data.savannah.gov` for any existing sanitation zone shapefiles before manually digitizing.
3. **The address lookup is server-side only.** Never expose the Google Maps API key to the client.
4. **Cache the schedule queries.** The 2026 data never changes — use Next.js `fetch` cache or React `cache()` with long TTLs.
5. **shadcn/ui setup:** Run `npx shadcn@latest init` and add components as needed: `npx shadcn@latest add card badge select input button separator skeleton alert tooltip`
