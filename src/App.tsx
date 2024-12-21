import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
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
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        console.log("Query error:", error);
        
        if (error?.message?.includes('Invalid Refresh Token') || 
            error?.message?.includes('refresh_token_not_found') ||
            error?.status === 412) {
          console.log("Detected auth error, redirecting to auth...");
          
          toast({
            title: "Ошибка авторизации",
            description: "Пожалуйста, войдите снова",
            variant: "destructive"
          });
          
          localStorage.clear();
          window.location.href = '/auth';
          return false;
        }
        
        return failureCount < 3;
      },
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AuthProvider>
                    <AdminLayout />
                  </AuthProvider>
                </ProtectedRoute>
              }
            >
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
    </SessionContextProvider>
  );
}

export default App;