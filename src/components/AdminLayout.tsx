import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { fillFormWithTestData } from "@/utils/formTestUtils";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  Baby,
  UserCircle,
  Users2,
  Calendar,
  Beaker,
  AlertTriangle,
  LogOut
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const { handleLogout, isLoading } = useSessionHandler();
  const { session } = useSessionContext();
  
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      console.log("Загрузка данных текущего пользователя");
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Ошибка при загрузке профиля:", error);
        throw error;
      }

      console.log("Загружен профиль:", profile);
      return profile;
    },
    enabled: !!session?.user?.id
  });
  
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
      <aside className="w-64 bg-[#FFD6FF] p-4 flex flex-col">
        <div className="flex-1 flex flex-col gap-2">
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
        </div>

        <div className="mt-4 space-y-2">
          {currentUser && (
            <div className="text-sm text-gray-600 px-2">
              <div>{currentUser.first_name} {currentUser.last_name}</div>
              <div className="truncate">{currentUser.email}</div>
            </div>
          )}
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4" />
            {isLoading ? "Выход..." : "Выйти"}
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;