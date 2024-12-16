import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminLayout from "./components/AdminLayout";
import UsersPage from "./pages/users/UsersPage";
import AuthPage from "./pages/auth/AuthPage";
import NanniesPage from "./pages/nannies/NanniesPage";
import NannyForm from "./pages/nannies/components/NannyForm";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/*"
            element={
              <AdminLayout>
                <Routes>
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/profile" element={<div>Profile Page</div>} />
                  <Route path="/families" element={<div>Families Page</div>} />
                  <Route path="/nannies" element={<NanniesPage />} />
                  <Route path="/nannies/create" element={<NannyForm />} />
                  <Route path="/nannies/:id/edit" element={<NannyForm />} />
                </Routes>
              </AdminLayout>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;