import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkingHoursForm } from "@/components/nannies/WorkingHoursForm";
import { WorkingHoursList } from "@/components/nannies/WorkingHoursList";

interface WorkingHoursSectionProps {
  nannyId?: string;
}

export default function WorkingHoursSection({ nannyId }: WorkingHoursSectionProps) {
  if (!nannyId) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Рабочие часы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <WorkingHoursForm nannyId={nannyId} />
        <WorkingHoursList nannyId={nannyId} />
      </CardContent>
    </Card>
  );
}