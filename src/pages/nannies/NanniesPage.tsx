import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import NanniesTable from "./components/NanniesTable";
import NanniesHeader from "./components/NanniesHeader";
import LoadingScreen from "@/components/LoadingScreen";
import type { NannyProfile } from "@/integrations/supabase/types/nanny-types";

const NanniesPage = () => {
  const [showDeleted, setShowDeleted] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: nannies, isLoading: isLoadingNannies, error } = useQuery({
    queryKey: ["nannies", showDeleted],
    queryFn: async () => {
      console.log("Fetching nannies, showDeleted:", showDeleted);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Сессия не найдена при загрузке нянь");
        navigate("/auth");
        return [];
      }

      const { data: nanniesData, error } = await supabase
        .from("nanny_profiles")
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            main_phone
          ),
          nanny_training (*)
        `);

      if (error) {
        console.error("Error fetching nannies:", error);
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

      console.log("Загруженные няни:", nanniesData);
      return nanniesData as NannyProfile[];
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (nannyId: string) => {
      console.log("Attempting to delete nanny:", nannyId);
      
      const { error } = await supabase
        .from("nanny_profiles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", nannyId);

      if (error) {
        console.error("Error in softDeleteMutation:", error);
        throw error;
      }
      
      console.log("Nanny deleted successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nannies"] });
      toast({
        title: "Успешно",
        description: "Няня удалена",
      });
    },
    onError: (error) => {
      console.error("Error deleting nanny:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить няню",
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (nannyId: string) => {
      console.log("Attempting to restore nanny:", nannyId);
      
      const { error } = await supabase
        .from("nanny_profiles")
        .update({ deleted_at: null })
        .eq("id", nannyId);

      if (error) {
        console.error("Error in restoreMutation:", error);
        throw error;
      }
      
      console.log("Nanny restored successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nannies"] });
      toast({
        title: "Успешно",
        description: "Няня восстановлена",
      });
    },
    onError: (error) => {
      console.error("Error restoring nanny:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось восстановить няню",
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
      await softDeleteMutation.mutate(nannyId);
    }
  };

  const handleRestoreNanny = async (nannyId: string) => {
    if (window.confirm("Вы хотите восстановить эту няню?")) {
      await restoreMutation.mutate(nannyId);
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
      <NanniesHeader 
        showDeleted={showDeleted}
        onToggleDeleted={() => setShowDeleted(!showDeleted)}
        onAddNanny={handleAddNanny}
      />
      <NanniesTable
        nannies={nannies}
        onEdit={handleEditNanny}
        onDelete={handleDeleteNanny}
        onRestore={handleRestoreNanny}
      />
    </div>
  );
};

export default NanniesPage;