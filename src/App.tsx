import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminLayout from "./components/AdminLayout";
import AuthPage from "./pages/auth/AuthPage";
import UsersPage from "./pages/users/UsersPage";
import NanniesPage from "./pages/nannies/NanniesPage";
import NannyForm from "./pages/nannies/components/NannyForm";
import ProfilePage from "./pages/profile/ProfilePage";
import FamiliesPage from "./pages/families/FamiliesPage";
import FamilyForm from "./pages/families/components/FamilyForm";
import AppointmentsPage from "./pages/appointments/AppointmentsPage";
import Index from "./pages/Index";
import { toast } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        console.log("Query error:", error);
        
        // Проверяем наличие ошибки refresh token
        if (error?.message?.includes('Invalid Refresh Token') || 
            error?.message?.includes('refresh_token_not_found')) {
          console.log("Detected refresh token error, redirecting to auth...");
          
          // Показываем уведомление пользователю
          toast({
            title: "Ошибка авторизации",
            description: "Пожалуйста, войдите снова",
            variant: "destructive"
          });
          
          // Перенаправляем на страницу авторизации
          window.location.href = '/auth';
          return false;
        }
        
        // Для других ошибок пробуем повторить запрос
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Index />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="nannies" element={<NanniesPage />} />
            <Route path="nannies/create" element={<NannyForm />} />
            <Route path="nannies/:id/edit" element={<NannyForm />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="families" element={<FamiliesPage />} />
            <Route path="families/create" element={<FamilyForm />} />
            <Route path="families/:id/edit" element={<FamilyForm />} />
            <Route path="appointments" element={<AppointmentsPage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;