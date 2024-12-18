import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { fillFormWithTestData } from "@/utils/formTestUtils";
import {
  LayoutDashboard,
  Users,
  Baby,
  UserCircle,
  Users2,
  Calendar,
  Beaker,
  AlertTriangle
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  console.log("Current location:", location.pathname);
  
  const isFormPage = location.pathname.includes('/create') || 
                     location.pathname.includes('/edit');

  const handleFillValidData = () => {
    console.log("Filling form with valid test data");
    fillFormWithTestData(true);
  };

  const handleFillInvalidData = () => {
    console.log("Filling form with invalid test data");
    fillFormWithTestData(false);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-[#FFD6FF] p-4 flex flex-col gap-2">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Главная
          </Button>
        </Link>
        
        <Link to="/users">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Users className="h-4 w-4" />
            Пользователи
          </Button>
        </Link>
        
        <Link to="/nannies">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Baby className="h-4 w-4" />
            Няни
          </Button>
        </Link>
        
        <Link to="/profile">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <UserCircle className="h-4 w-4" />
            Профиль
          </Button>
        </Link>
        
        <Link to="/families">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Users2 className="h-4 w-4" />
            Семьи
          </Button>
        </Link>
        
        <Link to="/appointments">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Calendar className="h-4 w-4" />
            Записи
          </Button>
        </Link>

        {isFormPage && (
          <>
            <div className="h-px bg-gray-200 my-2" />
            
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleFillValidData}
            >
              <Beaker className="h-4 w-4" />
              Тестовые данные
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive"
              onClick={handleFillInvalidData}
            >
              <AlertTriangle className="h-4 w-4" />
              Ошибочные данные
            </Button>
          </>
        )}
      </aside>
      
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;