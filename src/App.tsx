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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Если ошибка связана с токеном, не пытаемся повторить запрос
        if (error?.message?.includes('Invalid Refresh Token')) {
          return false;
        }
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