import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NanniesHeader from "./components/NanniesHeader";
import NanniesTable from "./components/NanniesTable";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "@/hooks/use-toast";

const NanniesPage = () => {
  const navigate = useNavigate();

  const { data: nannies, isLoading } = useQuery({
    queryKey: ["nannies"],
    queryFn: async () => {
      console.log("Загрузка списка нянь...");
      const { data, error } = await supabase
        .from("nanny_profiles")
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            main_phone,
            photo_url
          )
        `);

      if (error) {
        console.error("Ошибка при загрузке нянь:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить список нянь",
        });
        throw error;
      }

      console.log("Загружены няни:", data);
      return data;
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-6">
      <NanniesHeader onCreateClick={() => navigate("/nannies/create")} />
      <NanniesTable nannies={nannies || []} />
    </div>
  );
};

export default NanniesPage;