import { Badge } from "@/components/ui/badge";
import type { CollectionType } from "@/types";

const collectionLabels: Record<CollectionType, string> = {
  garbage: "Garbage",
  recycling: "Recycling + Garbage",
  yard_waste: "Yard Waste",
  holiday_skip: "No Collection",
};

const collectionEmojis: Record<CollectionType, string> = {
  garbage: "\uD83D\uDFE1",
  recycling: "\u267B\uFE0F",
  yard_waste: "\uD83C\uDF3F",
  holiday_skip: "\uD83C\uDFDB\uFE0F",
};

const badgeVariantMap: Record<
  CollectionType,
  "garbage" | "recycling" | "yard_waste" | "holiday"
> = {
  garbage: "garbage",
  recycling: "recycling",
  yard_waste: "yard_waste",
  holiday_skip: "holiday",
};

interface CollectionBadgeProps {
  type: CollectionType;
  compact?: boolean;
}

export function CollectionBadge({
  type,
  compact = false,
}: CollectionBadgeProps) {
  return (
    <Badge variant={badgeVariantMap[type]}>
      <span className="mr-1">{collectionEmojis[type]}</span>
      {compact ? null : collectionLabels[type]}
    </Badge>
  );
}
