"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PickupDay } from "@/types";

const days: { value: PickupDay; label: string }[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
];

export function DaySelector() {
  const router = useRouter();

  return (
    <Select
      onValueChange={(value) => {
        router.push(`/schedule/${value}`);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select your pickup day" />
      </SelectTrigger>
      <SelectContent>
        {days.map((d) => (
          <SelectItem key={d.value} value={d.value}>
            {d.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
