import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const navItemCls = ({ isActive }) => `nav-link${isActive ? " active fw-semibold" : ""}`;

export default function Nav() {
  const { user, perfil, isPlayer, isStaff, logout } = useAuth();
  const location = useLocation();

  const miFicha = isPlayer && user ? `/jugador/${user.uid}` : null;
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuAbierto) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setMenuAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuAbierto]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top py-2 site-nav">
        <div className="container-fluid px-3 px-lg-4">
          <NavLink className="navbar-brand brand" to="/">
            <img src={logo} alt="" height="38" />
            <span>Roda Bonito</span>
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navOffcanvas"
            aria-expanded={menuAbierto}
            aria-label="Menú"
            onClick={() => setMenuAbierto(true)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="d-none d-lg-flex">
            <ul className="navbar-nav flex-row gap-1 align-items-lg-center">
              <NavItems isStaff={isStaff} user={user} miFicha={miFicha} perfil={perfil} logout={logout} />
            </ul>
          </div>
        </div>
      </nav>

      <div
        className={`offcanvas offcanvas-end text-bg-dark d-lg-none menu-movil ${menuAbierto ? "show" : ""}`}
        tabIndex="-1"
        id="navOffcanvas"
        role="dialog"
        aria-modal={menuAbierto}
        aria-hidden={!menuAbierto}
        aria-labelledby="navOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="navOffcanvasLabel">Menú</h5>
          <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={cerrarMenu} />
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav gap-1">
            <NavItems isStaff={isStaff} user={user} miFicha={miFicha} perfil={perfil} logout={logout} onNavigate={cerrarMenu} />
          </ul>
        </div>
      </div>
      {menuAbierto && <div className="offcanvas-backdrop fade show d-lg-none menu-movil-backdrop" onClick={cerrarMenu} />}

      <nav className="bottom-nav d-lg-none">
        <NavLink to="/" end className={location.pathname === "/" ? "active" : ""}>
          <i className="bi bi-house-door-fill bn-icon" /><span>Inicio</span>
        </NavLink>
        <NavLink to="/calendario">
          <i className="bi bi-calendar3 bn-icon" /><span>Calendario</span>
        </NavLink>
        <NavLink to="/plantilla">
          <i className="bi bi-people-fill bn-icon" /><span>Plantilla</span>
        </NavLink>
        <NavLink to="/anuncios">
          <i className="bi bi-megaphone-fill bn-icon" /><span>Anuncios</span>
        </NavLink>
        <NavLink to={miFicha || "/login"}>
          <i className="bi bi-person-circle bn-icon" /><span>Perfil</span>
        </NavLink>
      </nav>
    </>
  );
}

function NavItems({ isStaff, user, miFicha, perfil, logout, onNavigate }) {
  const dismissAttr = onNavigate ? { onClick: onNavigate } : {};
  return (
    <>
      <li className="nav-item"><NavLink className={navItemCls} to="/" end {...dismissAttr}>Inicio</NavLink></li>
      <li className="nav-item"><NavLink className={navItemCls} to="/calendario" {...dismissAttr}>Calendario</NavLink></li>
      <li className="nav-item"><NavLink className={navItemCls} to="/liga" {...dismissAttr}>Liga</NavLink></li>
      <li className="nav-item"><NavLink className={navItemCls} to="/copa" {...dismissAttr}>Copa</NavLink></li>
      <li className="nav-item"><NavLink className={navItemCls} to="/plantilla" {...dismissAttr}>Plantilla</NavLink></li>
      <li className="nav-item"><NavLink className={navItemCls} to="/estadisticas" {...dismissAttr}>Estadísticas</NavLink></li>
      <li className="nav-item"><NavLink className={navItemCls} to="/anuncios" {...dismissAttr}>Anuncios</NavLink></li>
      <li className="nav-item"><NavLink className={navItemCls} to="/historia" {...dismissAttr}>Historia</NavLink></li>
      {isStaff && <li className="nav-item"><NavLink className={navItemCls} to="/pizarra" {...dismissAttr}>Pizarra</NavLink></li>}
      {isStaff && <li className="nav-item"><NavLink className={navItemCls} to="/admin" {...dismissAttr}>Admin</NavLink></li>}
      {user ? (
        <>
          {miFicha && (
            <li className="nav-item">
              <NavLink className={navItemCls} to={miFicha} {...dismissAttr}>{perfil?.nombre || "Mi ficha"}</NavLink>
            </li>
          )}
          <li className="nav-item">
            <button
              className="btn btn-outline-light btn-sm ms-lg-2 mt-2 mt-lg-0"
              onClick={() => {
                onNavigate?.();
                logout();
              }}
            >
              Salir
            </button>
          </li>
        </>
      ) : (
        <li className="nav-item"><NavLink className={navItemCls} to="/login" {...dismissAttr}>Acceso</NavLink></li>
      )}
    </>
  );
}
