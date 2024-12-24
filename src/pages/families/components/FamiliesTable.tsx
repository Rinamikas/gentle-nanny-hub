import { useNavigate } from "react-router-dom";
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
import { Edit, Star, Diamond, Phone } from "lucide-react";
import type { ParentProfile } from "@/integrations/supabase/types";
import { localizeParentStatus } from "@/utils/localization";

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

  const formatPhoneLink = (phone: string | null) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    return `tel:${cleanPhone}`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ФИО родителя</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Контактные номера</TableHead>
          <TableHead>Дети</TableHead>
          <TableHead>Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {families.map((family) => {
          console.log("Rendering family:", family);
          const displayName = family.profiles?.first_name && family.profiles?.last_name
            ? `${family.profiles.first_name} ${family.profiles.last_name}`
            : "Имя не указано";

          return (
            <TableRow key={family.id}>
              <TableCell>{displayName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusIcon status={family.status} />
                  <Badge
                    variant={
                      family.status === "diamond" ? "default" : "secondary"
                    }
                  >
                    {localizeParentStatus(family.status)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {family.profiles?.main_phone && (
                    <a 
                      href={formatPhoneLink(family.profiles.main_phone)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Phone className="w-4 h-4" />
                      {family.profiles.main_phone}
                    </a>
                  )}
                  {family.emergency_phone && (
                    <a 
                      href={formatPhoneLink(family.emergency_phone)}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                    >
                      <Phone className="w-4 h-4" />
                      {family.emergency_phone}
                    </a>
                  )}
                </div>
              </TableCell>
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