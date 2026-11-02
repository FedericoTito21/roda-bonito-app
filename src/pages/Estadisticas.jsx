import { useState } from "react";
import { Link } from "react-router-dom";
import { useUsuarios } from "../hooks/useUsuarios";
import { usePartidosJugados } from "../hooks/usePartidosJugados";
import { resumenTemporada } from "../utils/partido";
import { TIPO_BADGE, TIPO_LABEL } from "../utils/constants";
import PageHeader from "../components/PageHeader";
import Escudo from "../components/Escudo";

const FILTROS = [
  { valor: "oficial", label: "Liga" },
  { valor: "copa", label: "Copa" },
  { valor: "amistoso", label: "Amistosos" },
  { valor: "todos", label: "Todos" },
];

export default function Estadisticas() {
  const { usuarios } = useUsuarios();
  const { partidos, loading } = usePartidosJugados();
  const [filtro, setFiltro] = useState("oficial");

  const visibles = partidos.filter((e) => filtro === "todos" || e.tipo === filtro);
  const t = resumenTemporada(visibles);

  const acumulado = {};
  visibles.forEach((e) => {
    e.participantes.forEach((uid) => {
      const s = e.stats?.[uid] || {};
      const a = (acumulado[uid] ||= { goles: 0, asistencias: 0, amarillas: 0, rojas: 0, partidos: 0 });
      a.partidos += 1;
      a.goles += s.goles || 0;
      a.asistencias += s.asistencias || 0;
      a.amarillas += s.amarillas || 0;
      a.rojas += s.rojas || 0;
    });
  });

  const ranking = Object.entries(acumulado)
    .map(([uid, data]) => ({ uid, ...data, usuario: usuarios.find((u) => u.id === uid) }))
    .filter((r) => r.usuario)
    .sort((a, b) => b.goles - a.goles || b.asistencias - a.asistencias || b.partidos - a.partidos);

  const pct = (n) => (t.pj ? Math.round((n / t.pj) * 100) : 0);

  return (
    <div className="page">
      <PageHeader eyebrow="Temporada" title="Estadísticas" />

      <div className="filter-bar mb-4">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            className={`filter-chip ${filtro === f.valor ? "active" : ""}`}
            onClick={() => setFiltro(f.valor)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="stat-grid mb-3">
        <div className="stat-box"><div className="stat-value">{t.pj}</div><div className="stat-label">Partidos</div></div>
        <div className="stat-box tono-v"><div className="stat-value">{t.v}</div><div className="stat-label">Victorias</div></div>
        <div className="stat-box tono-e"><div className="stat-value">{t.e}</div><div className="stat-label">Empates</div></div>
        <div className="stat-box tono-d"><div className="stat-value">{t.d}</div><div className="stat-label">Derrotas</div></div>
        <div className="stat-box"><div className="stat-value">{t.gf}</div><div className="stat-label">Goles a favor</div></div>
        <div className="stat-box"><div className="stat-value">{t.gc}</div><div className="stat-label">Goles en contra</div></div>
      </div>

      {t.pj > 0 && (
        <div className="record-bar mb-4" aria-label="Reparto de resultados">
          {t.v > 0 && <span className="rb-v" style={{ width: `${pct(t.v)}%` }}>{pct(t.v)}% V</span>}
          {t.e > 0 && <span className="rb-e" style={{ width: `${pct(t.e)}%` }}>{pct(t.e)}% E</span>}
          {t.d > 0 && <span className="rb-d" style={{ width: `${pct(t.d)}%` }}>{pct(t.d)}% D</span>}
        </div>
      )}

      {loading && <p className="text-muted">Cargando partidos…</p>}

      {!loading && (
        <div className="stats-layout">
          <section className="panel">
            <h2 className="panel-title">
              <i className="bi bi-list-ol" />Resultados
              <span className="panel-title-extra">{visibles.length}</span>
            </h2>
            {visibles.length === 0 && <p className="text-muted mb-0">Todavía no hay partidos jugados.</p>}
            <ul className="result-list">
              {visibles.map((e) => {
                const m = e.marcador;
                return (
                  <li key={e.id}>
                    <Link to={`/evento/${e.id}`}>
                      <Escudo nombre={e.rival} size={34} />
                      <div className="flex-fill min-w-0">
                        <div className="fw-semibold text-truncate">vs {e.rival}</div>
                        <div className="text-muted small">
                          {e.fecha} · {e.local ? "Local" : "Visitante"}
                          {filtro === "todos" && (
                            <span className={`tipo-dot d-inline-block ms-2 ${TIPO_BADGE[e.tipo]}`} title={TIPO_LABEL[e.tipo]} />
                          )}
                        </div>
                      </div>
                      {m ? (
                        <span className={`result-chip result-${m.resultado}`}>
                          {m.resultado} {m.propio}-{m.rival}
                        </span>
                      ) : (
                        <span className="text-muted small">Sin resultado</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel">
            <h2 className="panel-title"><i className="bi bi-trophy-fill" />Jugadores</h2>
            {ranking.length === 0 && <p className="text-muted mb-0">Todavía no hay estadísticas registradas.</p>}
            {ranking.length > 0 && (
              <div className="table-responsive">
                <table className="table align-middle mb-0 ranking-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Jugador</th>
                      <th className="text-center">PJ</th>
                      <th className="text-center">G</th>
                      <th className="text-center">A</th>
                      <th className="text-center d-none d-sm-table-cell">Tarj.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((r, i) => (
                      <tr key={r.uid}>
                        <td><span className={`rank ${r.goles > 0 ? `rank-${i + 1}` : ""}`}>{i + 1}</span></td>
                        <td>
                          <Link to={`/jugador/${r.uid}`} className="d-flex align-items-center gap-2 text-reset fw-semibold">
                            <span className="player-photo sm d-none d-sm-flex">
                              {r.usuario.fotoURL ? <img src={r.usuario.fotoURL} alt="" /> : (r.usuario.nombre || "?")[0]}
                            </span>
                            {r.usuario.nombre} {r.usuario.apellidos}
                          </Link>
                        </td>
                        <td className="text-center">{r.partidos}</td>
                        <td className="text-center fw-bold fs-5">{r.goles}</td>
                        <td className="text-center">{r.asistencias}</td>
                        <td className="text-center d-none d-sm-table-cell text-nowrap">
                          {r.amarillas > 0 && <span className="card-ico amarilla">{r.amarillas}</span>}
                          {r.rojas > 0 && <span className="card-ico roja">{r.rojas}</span>}
                          {r.amarillas + r.rojas === 0 && <span className="text-muted">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
