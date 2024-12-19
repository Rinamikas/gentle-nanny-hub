interface NannyAvailabilityIndicatorProps {
  status: "available" | "partially" | "unavailable";
}

export function NannyAvailabilityIndicator({ status }: NannyAvailabilityIndicatorProps) {
  const colors = {
    available: "bg-green-500",
    partially: "bg-yellow-500",
    unavailable: "bg-red-500",
  };

  const titles = {
    available: "Доступна",
    partially: "Частично доступна",
    unavailable: "Недоступна",
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-2 h-2 rounded-full ${colors[status]}`} 
        title={titles[status]}
      />
      <span className="text-sm text-gray-500">{titles[status]}</span>
    </div>
  );
}