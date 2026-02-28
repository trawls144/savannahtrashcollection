import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DaySelector } from "@/components/DaySelector";
import { AddressLookup } from "@/components/AddressLookup";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Savannah Trash Collection
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Know before you roll your cart out
        </p>
      </div>

      {/* Action cards */}
      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
        {/* Card 1: Known pickup day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">I know my pickup day</CardTitle>
            <CardDescription>
              Select your day to see this week&apos;s and this month&apos;s
              schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DaySelector />
          </CardContent>
        </Card>

        {/* Card 2: Address lookup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Not sure?</CardTitle>
            <CardDescription>
              Look up your pickup day by entering your Savannah address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressLookup />
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8 sm:my-12" />

      {/* Collection rules summary */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Collection Rules</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recycling</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Yes:</strong> Hard plastic #1-7, glass,
                aluminum/tin/steel cans, paper, cardboard
              </p>
              <p>
                <strong>No:</strong> Plastic bags, paint cans, styrofoam,
                electronics, yard waste
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Yard Waste</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Brown Bag:</strong> Biodegradable bags, max 32 gal, 15
                bag limit
              </p>
              <p>
                <strong>Stack It:</strong> Bundles under 4ft long, 12&quot;
                diameter, 40 lbs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
