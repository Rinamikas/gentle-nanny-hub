import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, RotateCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const NanniesPage = () => {
  const [showDeleted, setShowDeleted] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: nannies, isLoading: isLoadingNannies } = useQuery({
    queryKey: ["nannies", showDeleted],
    queryFn: async () => {
      console.log("Fetching nannies, showDeleted:", showDeleted);
      
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
        `)
        .eq("is_deleted", showDeleted);

      if (error) {
        console.error("Error fetching nannies:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить список нянь",
        });
        return [];
      }

      return data;
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (nannyId: string) => {
      const { error } = await supabase
        .from("nanny_profiles")
        .update({ 
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq("id", nannyId);

      if (error) throw error;
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
      const { error } = await supabase
        .from("nanny_profiles")
        .update({ 
          is_deleted: false,
          deleted_at: null
        })
        .eq("id", nannyId);

      if (error) throw error;
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
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {showDeleted ? "Удаленные няни" : "Список нянь"}
          </h1>
          <Button
            variant="outline"
            onClick={() => setShowDeleted(!showDeleted)}
          >
            {showDeleted ? "Показать активных" : "Показать удаленных"}
          </Button>
        </div>
        {!showDeleted && (
          <Button onClick={handleAddNanny} className="bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            Добавить няню
          </Button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ФИО
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Возраст
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Должность
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Контакты
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nannies?.map((nanny) => (
              <tr key={nanny.id} className={nanny.is_deleted ? "bg-gray-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {nanny.photo_url && (
                      <img
                        src={nanny.photo_url}
                        alt={`${nanny.profiles?.first_name} ${nanny.profiles?.last_name}`}
                        className="h-10 w-10 rounded-full mr-3 object-cover"
                      />
                    )}
                    <div>
                      {nanny.profiles?.first_name} {nanny.profiles?.last_name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nanny.birth_date
                    ? new Date().getFullYear() -
                      new Date(nanny.birth_date).getFullYear()
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nanny.position || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>{nanny.profiles?.phone}</div>
                  <div className="text-sm text-gray-500">
                    {nanny.profiles?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nanny.is_deleted ? (
                    <Badge variant="destructive">Удалена</Badge>
                  ) : (
                    <Badge variant="default">Активна</Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {!nanny.is_deleted ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNanny(nanny.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNanny(nanny.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreNanny(nanny.id)}
                      >
                        <RotateCcw className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NanniesPage;