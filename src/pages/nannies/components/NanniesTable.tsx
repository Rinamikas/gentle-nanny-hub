import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, RotateCcw, Trash2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { PostgrestResponse } from "@supabase/supabase-js";

type Nanny = PostgrestResponse<Database['public']['Tables']['nanny_profiles']['Row']>['data'][0] & {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

interface NanniesTableProps {
  nannies: Nanny[] | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const NanniesTable = ({ nannies, onEdit, onDelete, onRestore }: NanniesTableProps) => {
  return (
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
                        onClick={() => onEdit(nanny.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(nanny.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRestore(nanny.id)}
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
  );
};

export default NanniesTable;