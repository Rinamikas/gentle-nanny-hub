import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import NanniesTable from "./components/NanniesTable";
import NanniesHeader from "./components/NanniesHeader";
import LoadingScreen from "@/components/LoadingScreen";

const NanniesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: nannies, isLoading: isLoadingNannies, error } = useQuery({
    queryKey: ["nannies"],
    queryFn: async () => {
      console.log("Загрузка списка нянь...");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Сессия не найдена при загрузке нянь");
        navigate("/auth");
        return [];
      }

      const { data, error } = await supabase
        .from("nanny_profiles")
        .select(`
          *,
          profiles(
            first_name,
            last_name,
            email,
            phone
          )
        `);

      if (error) {
        console.error("Ошибка загрузки нянь:", error);
        if (error.message.includes('JWT')) {
          navigate("/auth");
          return [];
        }
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

  const deleteNannyMutation = useMutation({
    mutationFn: async (nannyId: string) => {
      console.log("Удаление няни:", nannyId);
      
      const { error } = await supabase
        .from("nanny_profiles")
        .delete()
        .eq("id", nannyId);

      if (error) {
        console.error("Ошибка при удалении няни:", error);
        throw error;
      }
      
      console.log("Няня успешно удалена");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nannies"] });
      toast({
        title: "Успешно",
        description: "Няня удалена",
      });
    },
    onError: (error) => {
      console.error("Ошибка удаления няни:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить няню",
      });
    },
  });

  const handleAddNanny = () => {
    navigate("/nannies/create");
  };

  const handleEditNanny = (nannyId: string) => {
    navigate(`/nannies/${nannyId}/edit`);
  };

  const handleDeleteNanny = async (nannyId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту няню?")) {
      await deleteNannyMutation.mutate(nannyId);
    }
  };

  if (isLoadingNannies) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="p-6">Ошибка: {(error as Error).message}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <NanniesHeader onAddNanny={handleAddNanny} />
      <NanniesTable
        nannies={nannies}
        onEdit={handleEditNanny}
        onDelete={handleDeleteNanny}
      />
    </div>
  );
};

export default NanniesPage;