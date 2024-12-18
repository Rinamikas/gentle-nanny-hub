import { cn } from "@/lib/utils";

type AvailabilityStatus = "available" | "partially" | "unavailable";

interface NannyAvailabilityIndicatorProps {
  status: AvailabilityStatus;
  className?: string;
}

export function NannyAvailabilityIndicator({ status, className }: NannyAvailabilityIndicatorProps) {
  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full",
        {
          "bg-green-500": status === "available",
          "bg-yellow-500": status === "partially",
          "bg-red-500": status === "unavailable",
        },
        className
      )}
    />
  );
}