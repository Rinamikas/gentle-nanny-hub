import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Star, Diamond } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ParentProfile } from "@/integrations/supabase/types";

interface FamiliesTableProps {
  families: ParentProfile[];
}

const StatusIcon = ({ status }: { status: string | null }) => {
  switch (status) {
    case "star":
      return <Star className="w-4 h-4 text-yellow-500" />;
    case "diamond":
      return <Diamond className="w-4 h-4 text-blue-500" />;
    default:
      return null;
  }
};

const FamiliesTable = ({ families }: FamiliesTableProps) => {
  console.log("FamiliesTable received families:", families);
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ФИО родителя</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Контактные номера</TableHead>
          <TableHead>Адрес</TableHead>
          <TableHead>Дети</TableHead>
          <TableHead>Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {families.map((family) => {
          console.log("Rendering family:", family);
          return (
            <TableRow key={family.id}>
              <TableCell>
                {family.profiles?.first_name} {family.profiles?.last_name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusIcon status={family.status} />
                  <Badge
                    variant={
                      family.status === "diamond" ? "default" : "secondary"
                    }
                  >
                    {family.status === "diamond"
                      ? "Бриллиант"
                      : family.status === "star"
                      ? "Звезда"
                      : "Обычный"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div>{family.profiles?.phone}</div>
                  {family.additional_phone && (
                    <div className="text-sm text-gray-500">
                      {family.additional_phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{family.address}</TableCell>
              <TableCell>
                {family.children?.map((child) => (
                  <div key={child.id}>{child.first_name}</div>
                ))}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/families/${family.id}/edit`)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default FamiliesTable;
