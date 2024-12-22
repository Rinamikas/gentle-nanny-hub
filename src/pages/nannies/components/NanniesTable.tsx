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
import { Edit2 } from "lucide-react";

interface NanniesTableProps {
  nannies: any[];
}

const NanniesTable = ({ nannies }: NanniesTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Возрастная группа</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nannies.map((nanny) => (
            <TableRow key={nanny.id}>
              <TableCell>
                {nanny.profiles?.first_name} {nanny.profiles?.last_name}
              </TableCell>
              <TableCell>{nanny.profiles?.email}</TableCell>
              <TableCell>{nanny.profiles?.phone}</TableCell>
              <TableCell>{nanny.position}</TableCell>
              <TableCell>{nanny.age_group}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/nannies/${nanny.id}/edit`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default NanniesTable;