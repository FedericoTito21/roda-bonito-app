import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import { escudoDe, esPropio, nombreEquipo } from "../utils/liga";

function formatActualizado(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Liga() {
  return <PaginaCompeticion tipo="liga" titulo="Liga" />;
}

export function Copa() {
  return <PaginaCompeticion tipo="copa" titulo="Copa" />;
}

function PaginaCompeticion({ tipo, titulo }) {
  const { user, role } = useAuth();
  const [competiciones, setCompeticiones] = useState(null);
  const [actualizando, setActualizando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setCompeticiones(null);
    const q = query(collection(db, "competiciones"), where("tipo", "==", tipo));
    return onSnapshot(q, (snap) => {
      setCompeticiones(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.id < b.id ? 1 : -1)));
    });
  }, [tipo]);

  async function actualizarAhora() {
    setActualizando(true);
    setMensaje("");
    try {
      const ref = await addDoc(collection(db, "solicitudesActualizacion"), {
        uid: user.uid,
        creadoEn: serverTimestamp(),
      });
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          unsub();
          reject(new Error("la federación tardó demasiado en responder"));
        }, 60000);
        const unsub = onSnapshot(ref, (snap) => {
          const estado = snap.get("estado");
          if (!estado) return;
          clearTimeout(timeout);
          unsub();
          if (estado === "ok") resolve();
          else reject(new Error(snap.get("error") || "error desconocido"));
        });
      });
      setMensaje("Clasificación actualizada.");
    } catch (err) {
      setMensaje("No se pudo actualizar: " + err.message);
    } finally {
      setActualizando(false);
    }
  }

  const liga = competiciones?.[0];

  return (
    <div className="page">
      <PageHeader eyebrow={liga ? `Temporada ${liga.temporada}` : "Competición"} title={titulo} subtitle={liga?.nombre}>
        {role === "admin" && (
          <button className="btn btn-outline-danger" onClick={actualizarAhora} disabled={actualizando}>
            <i className={`bi bi-arrow-clockwise me-1 ${actualizando ? "spin" : ""}`} />
            {actualizando ? "Actualizando…" : "Actualizar ahora"}
          </button>
        )}
      </PageHeader>

      {mensaje && <div className="info-strip mb-3"><i className="bi bi-info-circle" />{mensaje}</div>}

      {competiciones === null && <p className="text-muted">Cargando…</p>}
      {competiciones?.length === 0 && (
        <div className="empty-state">
          <i className="bi bi-trophy" />
          <h3>Clasificación en camino</h3>
          <p className="text-muted mb-0">Todavía no se descargó la clasificación de la federación.</p>
        </div>
      )}

      {liga && <Competicion comp={liga} />}
    </div>
  );
}

function Competicion({ comp }) {
  const propia = comp.clasificacion?.find((f) => esPropio(f.equipo));
  return (
    <>
      {propia && (
        <div className="liga-propia mb-4">
          <div className="liga-propia-pos">
            {comp.clasificacion.some((f) => f.pj > 0) ? (
              <>
                <span>{propia.posicion}º</span>
                <small>de {comp.clasificacion.length}</small>
              </>
            ) : (
              <>
                <span>—</span>
                <small>sin empezar</small>
              </>
            )}
          </div>
          <div className="liga-propia-datos">
            <Dato valor={propia.pts} label="Puntos" destacado />
            <Dato valor={propia.pj} label="Jugados" />
            <Dato valor={`${propia.g}-${propia.e}-${propia.p}`} label="G-E-P" />
            <Dato valor={`${propia.gf}:${propia.gc}`} label="Goles" />
          </div>
        </div>
      )}

      <div className="liga-layout">
        <section className="panel">
          <h2 className="panel-title"><i className="bi bi-list-ol" />Clasificación</h2>
          <div className="table-responsive">
            <table className="table align-middle mb-0 liga-table">
              <thead>
                <tr>
                  <th className="text-center">#</th>
                  <th>Equipo</th>
                  <th className="text-center">PJ</th>
                  <th className="text-center d-none d-sm-table-cell">G</th>
                  <th className="text-center d-none d-sm-table-cell">E</th>
                  <th className="text-center d-none d-sm-table-cell">P</th>
                  <th className="text-center d-none d-md-table-cell">GF</th>
                  <th className="text-center d-none d-md-table-cell">GC</th>
                  <th className="text-center">DIF</th>
                  <th className="text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {comp.clasificacion?.map((f) => (
                  <tr key={f.equipo} className={esPropio(f.equipo) ? "fila-propia" : ""}>
                    <td className="text-center"><span className="liga-pos">{f.posicion}</span></td>
                    <td>
                      <div className="d-flex align-items-center gap-2 min-w-0">
                        <EscudoEquipo nombre={f.equipo} src={f.escudo} />
                        <span className="liga-equipo">{nombreEquipo(f.equipo)}</span>
                      </div>
                    </td>
                    <td className="text-center">{f.pj}</td>
                    <td className="text-center d-none d-sm-table-cell">{f.g}</td>
                    <td className="text-center d-none d-sm-table-cell">{f.e}</td>
                    <td className="text-center d-none d-sm-table-cell">{f.p}</td>
                    <td className="text-center d-none d-md-table-cell">{f.gf}</td>
                    <td className="text-center d-none d-md-table-cell">{f.gc}</td>
                    <td className="text-center">{f.dif > 0 ? `+${f.dif}` : f.dif}</td>
                    <td className="text-center fw-bold fs-6">{f.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div>
          {comp.jornadas?.length > 0 ? (
            <Jornadas jornadas={comp.jornadas} />
          ) : (
            comp.jornada?.partidos?.length > 0 && (
              <section className="panel">
                <h2 className="panel-title"><i className="bi bi-calendar2-week" />{comp.jornada.titulo || "Última jornada"}</h2>
                <ListaPartidos partidos={comp.jornada.partidos} />
              </section>
            )
          )}
          {comp.jornadas?.length > 0 && <NuestrosPartidos jornadas={comp.jornadas} />}
        </div>
      </div>

      <p className="text-muted small mt-2">
        Datos de la federación (
        <a href={comp.url} target="_blank" rel="noopener noreferrer">gespic.com</a>)
        {comp.actualizadoEn && <> · actualizado el {formatActualizado(comp.actualizadoEn)}</>}
        {comp.error && <span className="text-danger"> · último intento con error</span>}
      </p>
    </>
  );
}

const jugada = (j) => j.partidos.some((p) => p.resultado);

function Jornadas({ jornadas }) {
  const ultimaJugada = jornadas.reduce((acc, j, i) => (jugada(j) ? i : acc), 0);
  const [indice, setIndice] = useState(ultimaJugada);
  const j = jornadas[indice];

  return (
    <section className="panel">
      <div className="jornada-nav">
        <button className="btn btn-sm btn-light" disabled={indice === 0} onClick={() => setIndice(indice - 1)} aria-label="Jornada anterior">
          <i className="bi bi-chevron-left" />
        </button>
        <div className="text-center">
          <h2 className="panel-title justify-content-center mb-0">Jornada {j.numero}</h2>
          <div className="text-muted small">
            {j.fecha}
            {!jugada(j) && " · por jugar"}
          </div>
        </div>
        <button className="btn btn-sm btn-light" disabled={indice === jornadas.length - 1} onClick={() => setIndice(indice + 1)} aria-label="Jornada siguiente">
          <i className="bi bi-chevron-right" />
        </button>
      </div>
      <div className="jornada-chips">
        {jornadas.map((x, i) => (
          <button
            key={x.numero}
            className={`jornada-chip ${i === indice ? "active" : ""} ${jugada(x) ? "jugada" : ""}`}
            onClick={() => setIndice(i)}
            title={`Jornada ${x.numero}${x.fecha ? ` · ${x.fecha}` : ""}`}
          >
            {x.numero}
          </button>
        ))}
      </div>
      <ListaPartidos partidos={j.partidos} />
    </section>
  );
}

function ListaPartidos({ partidos }) {
  return (
    <ul className="jornada-list">
      {partidos.map((p, i) => (
        <li key={i} className={esPropio(p.local) || esPropio(p.visitante) ? "propio" : ""}>
          <div className="jornada-equipo local">
            <span>{nombreEquipo(p.local)}</span>
            <EscudoEquipo nombre={p.local} src={p.escudoLocal} />
          </div>
          <div className={`jornada-res ${p.resultado ? "" : "pendiente"}`}>{p.resultado || "vs"}</div>
          <div className="jornada-equipo">
            <EscudoEquipo nombre={p.visitante} src={p.escudoVisitante} />
            <span>{nombreEquipo(p.visitante)}</span>
          </div>
          {(p.fecha || p.campo) && (
            <div className="jornada-fecha">
              {p.fecha}
              {p.campo && ` · ${p.campo}`}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function NuestrosPartidos({ jornadas }) {
  const nuestros = jornadas
    .map((j) => ({ j, p: j.partidos.find((p) => esPropio(p.local) || esPropio(p.visitante)) }))
    .filter((x) => x.p);
  if (nuestros.length === 0) return null;

  return (
    <section className="panel">
      <h2 className="panel-title"><i className="bi bi-shield-fill" />Nuestros partidos</h2>
      <ul className="result-list">
        {nuestros.map(({ j, p }) => {
          const local = esPropio(p.local);
          const rival = local ? p.visitante : p.local;
          let chip = null;
          if (p.resultado) {
            const [gl, gv] = p.resultado.split("-").map(Number);
            const [nos, ellos] = local ? [gl, gv] : [gv, gl];
            const r = nos > ellos ? "V" : nos === ellos ? "E" : "D";
            chip = <span className={`result-chip result-${r}`}>{r} {nos}-{ellos}</span>;
          }
          return (
            <li key={j.numero}>
              <div className="result-row">
                <span className="jornada-num">J{j.numero}</span>
                <EscudoEquipo nombre={rival} src={local ? p.escudoVisitante : p.escudoLocal} />
                <div className="flex-fill min-w-0">
                  <div className="fw-semibold text-truncate">{local ? "vs" : "en"} {nombreEquipo(rival)}</div>
                  <div className="text-muted small">{p.fecha}{p.campo && ` · ${p.campo}`}</div>
                </div>
                {chip || <span className="text-muted small">Por jugar</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EscudoEquipo({ nombre, src }) {
  const [roto, setRoto] = useState(false);
  const url = escudoDe(nombre) || src;
  if (!url || roto) return <span className="liga-escudo vacio"><i className="bi bi-shield-fill" /></span>;
  return <img className="liga-escudo" src={url} alt="" loading="lazy" onError={() => setRoto(true)} />;
}

function Dato({ valor, label, destacado }) {
  return (
    <div className={`liga-dato ${destacado ? "destacado" : ""}`}>
      <span>{valor}</span>
      <small>{label}</small>
    </div>
  );
}
