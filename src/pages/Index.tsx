import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "@/components/dashboard/StatsCard";
import NannyRatingChart from "@/components/dashboard/NannyRatingChart";
import { Users, Calendar, TrendingUp } from "lucide-react";

const Index = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      console.log("Загружаем статистику дашборда...");
      
      // Получаем общее количество заявок
      const { count: appointmentsCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      // Получаем количество новых семей за последние 30 дней
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newFamiliesCount } = await supabase
        .from("parent_profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Получаем топ нянь по количеству заявок
      const { data: nannyRatings } = await supabase
        .from("appointments")
        .select(`
          nanny_id,
          nanny_profiles!inner(
            profiles!inner(
              first_name,
              last_name
            )
          )
        `)
        .eq("status", "completed");

      // Группируем заявки по няням
      const nanniesMap = new Map();
      nannyRatings?.forEach((appointment) => {
        const nanny = appointment.nanny_profiles.profiles;
        const name = `${nanny.first_name} ${nanny.last_name}`;
        nanniesMap.set(name, (nanniesMap.get(name) || 0) + 1);
      });

      // Преобразуем в массив для графика
      const topNannies = Array.from(nanniesMap.entries())
        .map(([name, appointments]) => ({ name, appointments }))
        .sort((a, b) => b.appointments - a.appointments)
        .slice(0, 5);

      return {
        appointmentsCount: appointmentsCount || 0,
        newFamiliesCount: newFamiliesCount || 0,
        topNannies
      };
    }
  });

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Добро пожаловать в панель управления</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Всего заявок"
          value={stats?.appointmentsCount || 0}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Новых семей"
          value={stats?.newFamiliesCount || 0}
          description="За последние 30 дней"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Средний рост"
          value="+12.3%"
          description="По сравнению с прошлым месяцем"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <NannyRatingChart data={stats?.topNannies || []} />
    </div>
  );
};

export default Index;