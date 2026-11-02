import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useUsuarios } from "../hooks/useUsuarios";
import { TIPO_LABEL, TIPO_BADGE } from "../utils/constants";
import { slotsOf } from "../utils/formaciones";
import { buildWaText, waUrl } from "../utils/whatsapp";
import DisponibilidadControl, { DispBotones } from "../components/DisponibilidadControl";
import Matchup from "../components/Matchup";
import ActaInfo from "../components/ActaInfo";
import { ACTAS } from "../data/actas";
import { formatLarga, marcador, participantesDe, textoCuentaAtras, tituloEvento } from "../utils/partido";
import Pitch from "../components/Pitch";
import LineupBuilder from "../components/LineupBuilder";
import CompartirAlineacion from "../components/CompartirAlineacion";

function nombreDe(usuarios, uid) {
  const u = usuarios.find((x) => x.id === uid);
  return u ? `${u.nombre} ${u.apellidos || ""}`.trim() : uid;
}

export default function EventoDetalle() {
  const { id } = useParams();
  const { user, isStaff, isPlayer, loading: authLoading } = useAuth();
  const { usuarios, jugadores } = useUsuarios();
  const [evento, setEvento] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "eventos", id), (snap) => {
      setEvento(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "eventos", id, "disponibilidad"), (snap) => {
      setDisponibilidad(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
    return unsub;
  }, [id]);

  const esPartido = evento?.tipo !== "entrenamiento";

  if (authLoading) return <div className="page">Cargando…</div>;
  if (!evento) return <div className="page">Cargando…</div>;

  const puedeGestionar = isStaff; // admin, entrenador, capitan
  const jugadoresById = Object.fromEntries(usuarios.map((u) => [u.id, u]));

  const disponibles = { si: [], duda: [], no: [] };
  disponibilidad.forEach((d) => disponibles[d.estado]?.push(d.uid));

  const alineacion = evento.alineacion?.slots ? evento.alineacion : null;
  const tieneLineup = alineacion && Object.keys(alineacion.slots).length > 0;

  const resultado = esPartido ? marcador(evento) : null;
  const jugaron = participantesDe(evento, disponibles.si);
  const goleadores = Object.entries(evento.stats || {})
    .filter(([, s]) => s.goles > 0)
    .sort((a, b) => b[1].goles - a[1].goles);
  const titularesSet = tieneLineup ? new Set(Object.values(alineacion.slots)) : new Set();
  const suplentes = (evento.convocados || []).filter((u) => !titularesSet.has(u));

  return (
    <div className="page">
      <div className={`match-hero tipo-${evento.tipo}`}>
        <div className="d-flex gap-2 align-items-center justify-content-center flex-wrap mb-3">
          <span className={`badge ${TIPO_BADGE[evento.tipo]}`}>{TIPO_LABEL[evento.tipo]}</span>
          {evento.modalidad && esPartido && (
            <span className="badge bg-white bg-opacity-10 border border-light border-opacity-25">
              {evento.modalidad === "futbol-sala" ? "Fútbol sala" : "Fútbol 7"}
            </span>
          )}
          {evento.estado === "cancelado" && <span className="badge bg-light text-dark">Cancelado</span>}
          {resultado && (
            <span className={`result-chip result-${resultado.resultado}`}>
              {resultado.resultado === "V" ? "Victoria" : resultado.resultado === "E" ? "Empate" : "Derrota"}
            </span>
          )}
          {evento.estado !== "jugado" && evento.estado !== "cancelado" && (
            <span className="badge bg-white text-dark">{textoCuentaAtras(evento.fecha)}</span>
          )}
        </div>
        {esPartido ? (
          <Matchup evento={evento} size={76} />
        ) : (
          <h1 className="text-white text-center mb-0"><i className="bi bi-stopwatch me-2" />Entrenamiento</h1>
        )}
        <div className="match-hero-meta">
          <span><i className="bi bi-calendar3" /> {formatLarga(evento.fecha)}</span>
          {evento.hora && <span><i className="bi bi-clock" /> {evento.hora}</span>}
          {evento.lugar && <span><i className="bi bi-geo-alt" /> {evento.lugar}</span>}
        </div>
        {goleadores.length > 0 && (
          <div className="match-hero-goals">
            <i className="bi bi-dribbble" />
            {goleadores.map(([uid, s]) => `${nombreDe(usuarios, uid)}${s.goles > 1 ? ` (${s.goles})` : ""}`).join(" · ")}
          </div>
        )}
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          {user && isPlayer && evento.estado !== "jugado" && evento.estado !== "cancelado" && (
            <section className="panel">
              <h2 className="panel-title"><i className="bi bi-hand-thumbs-up-fill" />Tu disponibilidad</h2>
              <DisponibilidadControl eventoId={id} />
            </section>
          )}

          {esPartido && tieneLineup && (
            <section className="panel">
              <h2 className="panel-title">
                <i className="bi bi-diagram-3-fill" />Alineación
                <span className="panel-title-extra">{alineacion.formacion}</span>
              </h2>
              <Pitch formacion={alineacion.formacion} slots={alineacion.slots} jugadoresById={jugadoresById} />
              <div className="lineup-legend">
                {Object.entries(
                  slotsOf(alineacion.formacion).reduce((acc, s) => {
                    const uid = alineacion.slots[s.id];
                    if (!uid) return acc;
                    (acc[s.label] ||= []).push(uid);
                    return acc;
                  }, {})
                ).map(([label, uids]) => (
                  <div key={label}><span className="legend-label">{label}</span>{uids.map((u) => nombreDe(usuarios, u)).join(", ")}</div>
                ))}
                {suplentes.length > 0 && (
                  <div><span className="legend-label">Suplentes</span>{suplentes.map((u) => nombreDe(usuarios, u)).join(", ")}</div>
                )}
              </div>
              {evento.observaciones && (
                <div className="obs-box"><i className="bi bi-chat-left-text me-2" />{evento.observaciones}</div>
              )}
              {puedeGestionar && (
            <CompartirAlineacion
              texto={buildWaText({ evento, jugadoresById })}
              imagen={{
                teamName: "Roda Bonito",
                title: evento.local ? `vs ${evento.rival}` : `${evento.rival} (visitante)`,
                subtitle: `${evento.fecha}${evento.hora ? " · " + evento.hora : ""}`,
                formacion: alineacion.formacion,
                slots: alineacion.slots,
                bench: suplentes,
                jugadoresById,
              }}
            />
          )}
            </section>
          )}

          {ACTAS[evento.id] && <ActaInfo acta={ACTAS[evento.id]} usuarios={usuarios} />}

          {puedeGestionar && (
            <>
              <div className="staff-divider"><i className="bi bi-shield-lock-fill" />Gestión del {esPartido ? "partido" : "entrenamiento"}</div>
              <DisponibilidadStaffEditor eventoId={id} jugadores={jugadores} disponibilidad={disponibilidad} />
              {esPartido && <ConvocatoriaEditor evento={evento} jugadores={jugadores} jugadoresById={jugadoresById} />}
              {esPartido && (
                <AlineacionEditor evento={evento} jugadores={jugadores} disponibles={disponibles.si} jugadoresById={jugadoresById} />
              )}
              {esPartido && <ResultadoEditor evento={evento} jugadores={jugadores} disponibles={disponibles.si} />}
            </>
          )}
        </div>

        <aside className="detail-side">
          {esPartido && (evento.convocados || []).length > 0 && (
            <section className="panel">
              <h2 className="panel-title">
                <i className="bi bi-list-check" />Convocados
                <span className="panel-title-extra">{evento.convocados.length}</span>
              </h2>
              <div className="name-chips">
                {evento.convocados.map((u) => (
                  <span key={u} className="name-chip">
                    {jugadoresById[u]?.dorsal && <b>{jugadoresById[u].dorsal}</b>}
                    {nombreDe(usuarios, u)}
                  </span>
                ))}
              </div>
            </section>
          )}

          {esPartido && evento.estado === "jugado" ? (
            <section className="panel">
              <h2 className="panel-title">
                <i className="bi bi-people-fill" />Jugaron
                <span className="panel-title-extra">{jugaron.length}</span>
              </h2>
              {jugaron.length === 0 && <p className="text-muted small mb-0">Sin datos de quién jugó.</p>}
              <div className="name-chips">
                {jugaron.map((u) => {
                  const s = evento.stats?.[u] || {};
                  return (
                    <span key={u} className="name-chip">
                      {nombreDe(usuarios, u)}
                      {s.goles > 0 && <span className="chip-stat"><i className="bi bi-dribbble" />{s.goles}</span>}
                      {s.asistencias > 0 && <span className="chip-stat"><i className="bi bi-share" />{s.asistencias}</span>}
                    </span>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="panel">
              <h2 className="panel-title"><i className="bi bi-people-fill" />Quién viene</h2>
              <AsistenciaGrupo titulo="Van" tono="si" uids={disponibles.si} usuarios={usuarios} />
              <AsistenciaGrupo titulo="En duda" tono="duda" uids={disponibles.duda} usuarios={usuarios} />
              <AsistenciaGrupo titulo="No van" tono="no" uids={disponibles.no} usuarios={usuarios} />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function AsistenciaGrupo({ titulo, tono, uids, usuarios }) {
  return (
    <div className={`asis-group asis-${tono}`}>
      <div className="asis-head">
        <span>{titulo}</span>
        <span className="asis-count">{uids.length}</span>
      </div>
      {uids.length > 0 ? (
        <div className="name-chips">
          {uids.map((u) => <span key={u} className="name-chip">{nombreDe(usuarios, u)}</span>)}
        </div>
      ) : (
        <div className="text-muted small">—</div>
      )}
    </div>
  );
}

function DisponibilidadStaffEditor({ eventoId, jugadores, disponibilidad }) {
  const estados = Object.fromEntries(disponibilidad.map((d) => [d.uid, d.estado]));
  const sinResponder = jugadores.filter((j) => !estados[j.id]);

  async function marcar(uid, valor) {
    await setDoc(doc(db, "eventos", eventoId, "disponibilidad", uid), {
      estado: valor,
      actualizadoEn: serverTimestamp(),
    });
  }

  return (
    <section className="panel">
      <h2 className="panel-title">
        <i className="bi bi-person-check-fill" />Marcar disponibilidad
        {sinResponder.length > 0 && <span className="panel-title-extra warn">{sinResponder.length} sin responder</span>}
      </h2>
      <p className="text-muted small">Para los que se olvidan de apuntarse: marcá si van, dudan o no van.</p>
      <ul className="list-group list-group-flush">
        {jugadores.map((j) => (
          <li className="list-group-item px-0 d-flex justify-content-between align-items-center flex-wrap gap-2" key={j.id}>
            <span className="fw-medium">
              {!estados[j.id] && <i className="bi bi-circle-fill text-warning me-2 small" title="Sin responder" />}
              {j.nombre} {j.apellidos}
            </span>
            <DispBotones estado={estados[j.id]} onMarcar={(v) => marcar(j.id, v)} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConvocatoriaEditor({ evento, jugadores, jugadoresById }) {
  const [seleccion, setSeleccion] = useState(evento.convocados || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => setSeleccion(evento.convocados || []), [evento.id]);

  function toggle(uid) {
    setSeleccion((prev) => (prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]));
  }

  async function guardar() {
    setSaving(true);
    try {
      await updateDoc(doc(db, "eventos", evento.id), { convocados: seleccion });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel-title">
        <i className="bi bi-list-check" />Convocatoria
        <span className="panel-title-extra">{seleccion.length} elegidos</span>
      </h2>
      <div className="d-flex flex-wrap gap-2">
        {jugadores.map((j) => (
          <label className={`tag-pill ${seleccion.includes(j.id) ? "elegido" : ""}`} key={j.id}>
            <input type="checkbox" className="form-check-input mt-0 me-1" checked={seleccion.includes(j.id)} onChange={() => toggle(j.id)} />
            {j.dorsal ? `${j.dorsal} ` : ""}{j.nombre} {j.apellidos}
          </label>
        ))}
      </div>
      <div className="d-flex gap-2 flex-wrap mt-3">
        <button className="btn btn-primary btn-sm" onClick={guardar} disabled={saving}>
          {saving ? "Guardando…" : "Guardar convocatoria"}
        </button>
        {evento.convocados?.length > 0 && (
          <a
            className="btn btn-sm btn-wa"
            href={waUrl(buildWaText({ evento: { ...evento, convocados: seleccion }, jugadoresById }))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-whatsapp me-1" />
            Enviar por WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}

function AlineacionEditor({ evento, jugadores, disponibles, jugadoresById }) {
  const base = evento.convocados?.length ? evento.convocados : disponibles;
  const pool = base.filter((uid) => jugadores.some((j) => j.id === uid));
  const [formacion, setFormacion] = useState(evento.alineacion?.formacion || "2-3-1");
  const [slots, setSlots] = useState(evento.alineacion?.slots || {});
  const [observaciones, setObservaciones] = useState(evento.observaciones || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormacion(evento.alineacion?.formacion || "2-3-1");
    setSlots(evento.alineacion?.slots || {});
    setObservaciones(evento.observaciones || "");
  }, [evento.id]);

  async function guardar() {
    setSaving(true);
    try {
      await updateDoc(doc(db, "eventos", evento.id), {
        alineacion: { formacion, slots },
        observaciones,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel-title"><i className="bi bi-easel2-fill" />Preparar alineación</h2>
      {pool.length === 0 && <p className="text-muted">No hay jugadores convocados/disponibles todavía.</p>}
      {pool.length > 0 && (
        <LineupBuilder
          formacion={formacion}
          slots={slots}
          pool={pool}
          jugadoresById={jugadoresById}
          onChange={(d) => {
            setFormacion(d.formacion);
            setSlots(d.slots);
          }}
        />
      )}
      <div className="mt-3">
        <label className="form-label">Observaciones</label>
        <textarea className="form-control" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={3} />
      </div>
      <button className="btn btn-primary btn-sm mt-3" onClick={guardar} disabled={saving}>
        {saving ? "Guardando…" : "Guardar alineación"}
      </button>
    </section>
  );
}

const CAMPOS_STATS = [
  ["goles", "Goles"],
  ["asistencias", "Asist."],
  ["amarillas", "Amar."],
  ["rojas", "Roja"],
];

function ResultadoEditor({ evento, jugadores, disponibles }) {
  const [estado, setEstado] = useState(evento.estado);
  const [golesPropios, setGolesPropios] = useState(evento.resultadoLocal ?? "");
  const [golesRival, setGolesRival] = useState(evento.resultadoRival ?? "");
  const [stats, setStats] = useState(evento.stats || {});
  const [jugaronEditado, setJugaronEditado] = useState(null);
  const [saving, setSaving] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    setEstado(evento.estado);
    setGolesPropios(evento.resultadoLocal ?? "");
    setGolesRival(evento.resultadoRival ?? "");
    setStats(evento.stats || {});
    setJugaronEditado(null);
  }, [evento.id]);

  const jugaron = jugaronEditado ?? participantesDe(evento, disponibles);
  const ordenados = [...jugadores].sort((a, b) => jugaron.includes(b.id) - jugaron.includes(a.id));

  const preview = marcador({ ...evento, estado: "jugado", resultadoLocal: golesPropios === "" ? null : golesPropios, resultadoRival: golesRival === "" ? null : golesRival });

  function toggleJugo(uid) {
    setJugaronEditado(jugaron.includes(uid) ? jugaron.filter((u) => u !== uid) : [...jugaron, uid]);
  }

  function setStat(uid, campo, valor) {
    setStats((prev) => ({
      ...prev,
      [uid]: { ...prev[uid], [campo]: Math.max(0, Number(valor) || 0) },
    }));
  }

  async function guardar() {
    setSaving(true);
    setGuardado(false);
    try {
      const statsJugadores = Object.fromEntries(
        Object.entries(stats).filter(
          ([uid, s]) => jugaron.includes(uid) && Object.values(s || {}).some((v) => v > 0)
        )
      );
      await updateDoc(doc(db, "eventos", evento.id), {
        estado,
        resultadoLocal: golesPropios === "" ? null : Number(golesPropios),
        resultadoRival: golesRival === "" ? null : Number(golesRival),
        participantes: jugaron,
        stats: statsJugadores,
      });
      setGuardado(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel-title"><i className="bi bi-clipboard-data-fill" />Resultado y estadísticas</h2>
      <div className="row g-3 mb-2">
        <div className="col-sm-4">
          <label className="form-label">Estado</label>
          <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="programado">Programado</option>
            <option value="jugado">Jugado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="col-6 col-sm-4">
          <label className="form-label">Goles de Roda Bonito</label>
          <input type="number" min="0" className="form-control" value={golesPropios} onChange={(e) => setGolesPropios(e.target.value)} />
        </div>
        <div className="col-6 col-sm-4">
          <label className="form-label text-truncate d-block">Goles de {evento.rival || "rival"}</label>
          <input type="number" min="0" className="form-control" value={golesRival} onChange={(e) => setGolesRival(e.target.value)} />
        </div>
      </div>
      {preview && (
        <p className="small mb-3">
          Se guardará como{" "}
          <span className={`result-chip result-${preview.resultado}`}>
            {preview.resultado === "V" ? "Victoria" : preview.resultado === "E" ? "Empate" : "Derrota"}
          </span>{" "}
          · {tituloEvento(evento).replace(" vs ", ` ${preview.izq}-${preview.der} `)}
        </p>
      )}

      <h3 className="h6 text-uppercase text-muted mt-3 mb-2">
        Quién jugó <span className="fw-normal">({jugaron.length})</span>
      </h3>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Jugó</th>
              <th>Jugador</th>
              {CAMPOS_STATS.map(([, label]) => <th key={label}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {ordenados.map((j) => {
              const jugo = jugaron.includes(j.id);
              return (
                <tr key={j.id} className={jugo ? "" : "opacity-50"}>
                  <td>
                    <input type="checkbox" className="form-check-input" checked={jugo} onChange={() => toggleJugo(j.id)} />
                  </td>
                  <td className="text-nowrap">{j.nombre}</td>
                  {CAMPOS_STATS.map(([campo]) => (
                    <td key={campo}>
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm"
                        style={{ width: 58 }}
                        disabled={!jugo}
                        value={stats[j.id]?.[campo] || 0}
                        onChange={(e) => setStat(j.id, campo, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-primary" onClick={guardar} disabled={saving}>
          {saving ? "Guardando…" : "Guardar resultado"}
        </button>
        {guardado && <span className="text-success small"><i className="bi bi-check-circle-fill me-1" />Guardado</span>}
      </div>
    </section>
  );
}
