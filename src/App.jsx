import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import PerfilGate from "./components/PerfilGate";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Calendario from "./pages/Calendario";
import CrearEvento from "./pages/CrearEvento";
import EventoDetalle from "./pages/EventoDetalle";
import Plantilla from "./pages/Plantilla";
import JugadorFicha from "./pages/JugadorFicha";
import CompletarPerfil from "./pages/CompletarPerfil";
import Estadisticas from "./pages/Estadisticas";
import Anuncios from "./pages/Anuncios";
import Historia from "./pages/Historia";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Pizarra from "./pages/Pizarra";
import Liga, { Copa } from "./pages/Liga";
import logo from "./assets/logo.png";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <main>
          <PerfilGate>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/crear-evento" element={<CrearEvento />} />
              <Route path="/evento/:id" element={<EventoDetalle />} />
              <Route path="/plantilla" element={<Plantilla />} />
              <Route path="/jugador/:uid" element={<JugadorFicha />} />
              <Route path="/completar-perfil" element={<CompletarPerfil />} />
              <Route path="/estadisticas" element={<Estadisticas />} />
              <Route path="/liga" element={<Liga />} />
              <Route path="/copa" element={<Copa />} />
              <Route path="/anuncios" element={<Anuncios />} />
              <Route path="/historia" element={<Historia />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/pizarra" element={<Pizarra />} />
            </Routes>
          </PerfilGate>
        </main>
        <footer className="site-footer">
          <img src={logo} alt="" />
          <div>
            <strong>Roda Bonito</strong>
            <span>Fútbol 7 · Rojo y negro · © {new Date().getFullYear()}</span>
          </div>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}
