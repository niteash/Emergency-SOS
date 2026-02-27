import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SOS from "./pages/student/SOS";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/user" />} />

        <Route path="/user" element={<SOS />} />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/user" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
