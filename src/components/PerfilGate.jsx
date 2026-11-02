import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EXCLUIDAS = ["/completar-perfil", "/login"];

export default function PerfilGate({ children }) {
  const { perfilIncompleto, loading } = useAuth();
  const location = useLocation();

  if (loading) return children;
  if (perfilIncompleto && !EXCLUIDAS.includes(location.pathname)) {
    return <Navigate to="/completar-perfil" replace />;
  }
  return children;
}
