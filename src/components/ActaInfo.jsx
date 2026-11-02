import { Link } from "react-router-dom";
import Escudo from "./Escudo";

function Equipo({ equipo, usuariosById }) {
  return (
    <div className="acta-equipo">
      <div className="acta-equipo-head">
        <Escudo nombre={equipo.nombre} size={36} />
        <span className="acta-equipo-nombre">{equipo.nombre}</span>
        <span className="acta-equipo-goles">{equipo.goles}</span>
      </div>
      <ul className="acta-jugadores">
        {equipo.jugadores.map((j) => {
          const u = j.uid && usuariosById[j.uid];
          const nombre = u ? `${u.nombre} ${u.apellidos || ""}`.trim() : j.nombre;
          return (
            <li key={`${j.dorsal}-${j.nombre}`}>
              <span className="acta-dorsal">{j.dorsal}</span>
              <span className="flex-fill min-w-0 text-truncate">
                {j.uid ? <Link to={`/jugador/${j.uid}`} className="text-reset fw-semibold">{nombre}</Link> : nombre}
              </span>
              {j.goles > 0 && (
                <span className="acta-evento" title={`${j.goles} gol${j.goles > 1 ? "es" : ""}`}>
                  <i className="bi bi-dribbble" />
                  {j.goles > 1 && j.goles}
                </span>
              )}
              {j.amarillas > 0 && <span className="card-ico amarilla" title="Tarjeta amarilla" />}
              {j.rojas > 0 && <span className="card-ico roja" title="Tarjeta roja" />}
            </li>
          );
        })}
      </ul>
      {equipo.noJugaron?.length > 0 && (
        <div className="acta-extra"><b>No jugaron:</b> {equipo.noJugaron.join(", ")}</div>
      )}
      <div className="acta-extra">
        <b>Delegado:</b> {equipo.delegado} · <b>Entrenador:</b> {equipo.entrenador}
      </div>
    </div>
  );
}

export default function ActaInfo({ acta, usuarios }) {
  const usuariosById = Object.fromEntries(usuarios.map((u) => [u.id, u]));
  return (
    <section className="panel">
      <h2 className="panel-title">
        <i className="bi bi-file-earmark-text-fill" />Acta del partido
        <span className="panel-title-extra">Jornada {acta.jornada}</span>
      </h2>
      <div className="acta-meta">
        <span><i className="bi bi-person-badge" /> Árbitro: <b>{acta.arbitro}</b></span>
        <span><i className="bi bi-geo-alt" /> {acta.campo}</span>
        <span><i className="bi bi-calendar3" /> {acta.fecha} · {acta.hora}</span>
        <span><i className="bi bi-tag" /> {acta.categoria}</span>
      </div>
      <div className="acta-grid">
        <Equipo equipo={acta.local} usuariosById={usuariosById} />
        <Equipo equipo={acta.visitante} usuariosById={usuariosById} />
      </div>
      {acta.observaciones && <div className="obs-box mt-3"><b>Observaciones:</b> {acta.observaciones}</div>}
      <p className="text-muted small mt-3 mb-0">Datos transcritos del acta oficial de la Lliga Comarcal Futbol-7.</p>
    </section>
  );
}
