interface NannyAvailabilityIndicatorProps {
  status: "available" | "partially" | "unavailable";
}

export function NannyAvailabilityIndicator({ status }: NannyAvailabilityIndicatorProps) {
  const colors = {
    available: "bg-green-500",
    partially: "bg-yellow-500",
    unavailable: "bg-red-500",
  };

  return (
    <div 
      className={`w-2 h-2 rounded-full ${colors[status]}`} 
      title={status === "available" ? "Доступна" : status === "partially" ? "Частично доступна" : "Недоступна"}
    />
  );
}