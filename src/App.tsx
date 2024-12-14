import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminLayout from "./components/AdminLayout";
import UsersPage from "./pages/users/UsersPage";

// Создаем экземпляр QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/*"
            element={
              <AdminLayout>
                <Routes>
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/profile" element={<div>Profile Page</div>} />
                  <Route path="/families" element={<div>Families Page</div>} />
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