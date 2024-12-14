import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import UsersPage from "./pages/users/UsersPage";

function App() {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/families" element={<div>Families Page</div>} />
        </Routes>
      </AdminLayout>
    </Router>
  );
}

export default App;
