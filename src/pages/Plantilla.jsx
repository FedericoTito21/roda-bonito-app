import { Link } from "react-router-dom";
import { useUsuarios } from "../hooks/useUsuarios";
import { ROLE_LABEL, ROLE_BADGE } from "../utils/constants";
import { ORDEN_BLOQUES, BLOQUE_CLASE, bloqueDe } from "../utils/posicionBloques";
import PageHeader from "../components/PageHeader";

export default function Plantilla() {
  const { jugadores, loading } = useUsuarios();

  const bloques = ORDEN_BLOQUES.map((nombre) => ({
    nombre,
    jugadores: jugadores
      .filter((j) => bloqueDe(j) === nombre)
      .sort((a, b) => (a.dorsal || 999) - (b.dorsal || 999)),
  })).filter((b) => b.jugadores.length > 0);

  return (
    <div className="page">
      <PageHeader eyebrow={loading ? "Equipo" : `${jugadores.length} jugadores`} title="Plantilla" />

      {loading && <p>Cargando plantilla…</p>}
      {!loading && jugadores.length === 0 && (
        <p className="text-muted">Todavía no hay jugadores cargados.</p>
      )}

      {bloques.map((bloque) => (
        <section key={bloque.nombre} className={`pos-block pos-block-${BLOQUE_CLASE[bloque.nombre]}`}>
          <h2 className="pos-block-h">
            <span className="pos-dot" />
            {bloque.nombre}
            <span className="pos-count">{bloque.jugadores.length}</span>
          </h2>
          <div className="player-grid">
            {bloque.jugadores.map((j) => (
              <Link className="player-card" to={`/jugador/${j.id}`} key={j.id}>
                {j.dorsal && <span className="player-card-num">{j.dorsal}</span>}
                <div className="player-photo">
                  {j.fotoURL ? <img src={j.fotoURL} alt={j.nombre} /> : <span>{(j.nombre || "?")[0]}</span>}
                </div>
                <div className="player-name">{j.nombre} {j.apellidos}</div>
                <div className="player-position">{j.posicionPrincipal || "Sin posición"}</div>
                {j.role !== "jugador" && (
                  <span className={`badge ${ROLE_BADGE[j.role]} mt-2`}>{ROLE_LABEL[j.role]}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
