import { Link } from "react-router-dom";

export default function RequiereLogin() {
  return (
    <p className="text-muted">
      Esta sección es solo para miembros del equipo. <Link to="/login">Iniciá sesión</Link> para verla.
    </p>
  );
}
