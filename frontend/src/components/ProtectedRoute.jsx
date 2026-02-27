import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const [token, setToken] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");

    console.log("ProtectedRoute token:", t);

    setToken(t);
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
