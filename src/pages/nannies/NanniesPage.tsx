import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const NanniesPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: nannies, isLoading: isLoadingNannies } = useQuery({
    queryKey: ["nannies"],
    queryFn: async () => {
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
        .eq("is_deleted", false);

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

  const handleAddNanny = () => {
    // TODO: Implement navigation to add nanny form
    console.log("Add nanny clicked");
  };

  if (isLoadingNannies) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Список нянь</h1>
        <Button onClick={handleAddNanny} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" />
          Добавить няню
        </Button>
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
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nannies?.map((nanny) => (
              <tr key={nanny.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nanny.profiles?.first_name} {nanny.profiles?.last_name}
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    className="text-primary hover:text-primary-dark"
                    onClick={() => console.log("Edit nanny:", nanny.id)}
                  >
                    Редактировать
                  </Button>
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