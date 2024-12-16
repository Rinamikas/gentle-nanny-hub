import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AuthPage from "./pages/auth/AuthPage";
import UsersPage from "./pages/users/UsersPage";
import NanniesPage from "./pages/nannies/NanniesPage";
import NannyForm from "./pages/nannies/components/NannyForm";
import ProfilePage from "./pages/profile/ProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<AdminLayout />}>
          <Route path="users" element={<UsersPage />} />
          <Route path="nannies" element={<NanniesPage />} />
          <Route path="nannies/create" element={<NannyForm />} />
          <Route path="nannies/:id/edit" element={<NannyForm />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;