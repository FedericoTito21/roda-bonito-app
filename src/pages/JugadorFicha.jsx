import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { POSICIONES, ROLE_LABEL, ROLE_BADGE, TIPO_BADGE } from "../utils/constants";
import { BLOQUE_CLASE, bloqueDe } from "../utils/posicionBloques";
import { usePartidosJugados } from "../hooks/usePartidosJugados";
import SubirFoto from "../components/SubirFoto";
import PageHeader from "../components/PageHeader";

export default function JugadorFicha() {
  const { uid } = useParams();
  const { user, role } = useAuth();
  const [jugador, setJugador] = useState(null);
  const [editando, setEditando] = useState(false);
  const { partidos, loading: partidosLoading } = usePartidosJugados();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "usuarios", uid), (snap) => {
      setJugador(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return unsub;
  }, [uid]);

  if (!jugador) return <div className="page">Cargando…</div>;

  const esPropia = user?.uid === uid;
  const puedeEditar = esPropia || role === "admin";

  const historial = partidos.filter((e) => e.participantes.includes(uid));
  const resultados = historial.reduce(
    (acc, e) => {
      if (e.marcador) acc[e.marcador.resultado]++;
      return acc;
    },
    { V: 0, E: 0, D: 0 }
  );

  const totales = historial.reduce(
    (acc, e) => {
      const s = e.stats?.[uid];
      if (s) {
        acc.goles += s.goles || 0;
        acc.asistencias += s.asistencias || 0;
        acc.amarillas += s.amarillas || 0;
        acc.rojas += s.rojas || 0;
      }
      return acc;
    },
    { goles: 0, asistencias: 0, amarillas: 0, rojas: 0 }
  );

  if (editando) {
    return (
      <EditarFicha
        jugador={jugador}
        esAdminEditandoOtro={role === "admin" && !esPropia}
        onCancel={() => setEditando(false)}
        onSaved={() => setEditando(false)}
      />
    );
  }

  return (
    <div className="page fade-in">
      <div className={`ficha-hero pos-block-${BLOQUE_CLASE[bloqueDe(jugador)] || "gris"}`}>
        {jugador.dorsal && <span className="ficha-hero-num">{jugador.dorsal}</span>}
        <div className="ficha-avatar">
          {jugador.fotoURL ? <img src={jugador.fotoURL} alt={jugador.nombre} /> : (jugador.nombre || "?")[0]}
        </div>
        <div className="ficha-hero-info">
          <div className="d-flex gap-2 flex-wrap mb-2">
            {jugador.isPlayer && jugador.posicionPrincipal && (
              <span className="pos-tag">{jugador.posicionPrincipal}</span>
            )}
            {jugador.role !== "jugador" && (
              <span className={`badge ${ROLE_BADGE[jugador.role]}`}>{ROLE_LABEL[jugador.role]}</span>
            )}
          </div>
          <h1 className="mb-1">{jugador.nombre} {jugador.apellidos}</h1>
          {jugador.isPlayer && (jugador.posicionesSecundarias || []).length > 0 && (
            <div className="ficha-sec">También: {jugador.posicionesSecundarias.join(" · ")}</div>
          )}
        </div>
        {puedeEditar && (
          <button className="btn btn-outline-light btn-sm ficha-edit" onClick={() => setEditando(true)}>
            <i className="bi bi-pencil-fill me-1" />Editar
          </button>
        )}
      </div>

      {jugador.isPlayer && (
        <div className="stat-grid">
          <StatBox valor={historial.length} label="Partidos" icon="bi-calendar-check" />
          <StatBox valor={totales.goles} label="Goles" icon="bi-bullseye" destacado />
          <StatBox valor={totales.asistencias} label="Asistencias" icon="bi-share" />
          <StatBox valor={jugador.altura ? `${jugador.altura}` : "—"} unidad={jugador.altura ? "cm" : ""} label="Altura" icon="bi-arrows-vertical" />
          <StatBox valor={jugador.peso ? `${jugador.peso}` : "—"} unidad={jugador.peso ? "kg" : ""} label="Peso" icon="bi-speedometer2" />
          <StatBox valor={totales.amarillas + totales.rojas} label="Tarjetas" icon="bi-file-fill" />
        </div>
      )}

      {jugador.isPlayer && (
        <section className="panel">
          <h2 className="panel-title">
            <i className="bi bi-clock-history" />Historial de partidos
            {historial.length > 0 && (
              <span className="panel-title-extra">
                {resultados.V}V · {resultados.E}E · {resultados.D}D
              </span>
            )}
          </h2>
          {partidosLoading && <p className="text-muted mb-0">Cargando partidos…</p>}
          {!partidosLoading && historial.length === 0 && <p className="text-muted mb-0">Todavía no tiene partidos registrados.</p>}
          {!partidosLoading && historial.length > 0 && <TablaHistorial partidos={historial} uid={uid} />}
        </section>
      )}
    </div>
  );
}

function TablaHistorial({ partidos, uid }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th>Partido</th>
            <th className="text-center">Res.</th>
            <th className="text-center">Goles</th>
            <th className="text-center">Asist.</th>
          </tr>
        </thead>
        <tbody>
          {partidos.map((e) => {
            const m = e.marcador;
            const s = e.stats?.[uid] || {};
            return (
              <tr key={e.id}>
                <td>
                  <Link to={`/evento/${e.id}`} className="text-reset fw-semibold d-block lh-sm">
                    vs {e.rival}
                  </Link>
                  <span className="text-muted small">
                    {e.fecha} · {e.local ? "Local" : "Visitante"}
                  </span>
                  <span className={`tipo-dot d-inline-block ms-2 ${TIPO_BADGE[e.tipo]}`} title={e.tipo} />
                </td>
                <td className="text-center">
                  {m ? (
                    <span className={`result-chip result-${m.resultado}`}>
                      {m.resultado} {m.propio}-{m.rival}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="text-center fw-bold">{s.goles || 0}</td>
                <td className="text-center">{s.asistencias || 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatBox({ valor, unidad, label, icon, destacado }) {
  return (
    <div className={`stat-box ${destacado ? "destacado" : ""}`}>
      <i className={`bi ${icon} stat-icon`} />
      <div className="stat-value">{valor}{unidad && <small>{unidad}</small>}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function EditarFicha({ jugador, esAdminEditandoOtro, onCancel, onSaved }) {
  const [form, setForm] = useState({
    nombre: jugador.nombre || "",
    apellidos: jugador.apellidos || "",
    posicionPrincipal: jugador.posicionPrincipal || POSICIONES[0],
    posicionesSecundarias: jugador.posicionesSecundarias || [],
    altura: jugador.altura || "",
    peso: jugador.peso || "",
    dorsal: jugador.dorsal || "",
    fotoURL: jugador.fotoURL || "",
    role: jugador.role,
    isPlayer: jugador.isPlayer,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleSecundaria(pos) {
    setForm((f) => ({
      ...f,
      posicionesSecundarias: f.posicionesSecundarias.includes(pos)
        ? f.posicionesSecundarias.filter((p) => p !== pos)
        : [...f.posicionesSecundarias, pos],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = {
        nombre: form.nombre,
        apellidos: form.apellidos,
        fotoURL: form.fotoURL.trim(),
        perfilCompleto: true,
      };
      if (jugador.isPlayer) {
        data.posicionPrincipal = form.posicionPrincipal;
        data.posicionesSecundarias = form.posicionesSecundarias;
        data.altura = form.altura === "" ? null : Number(form.altura);
        data.peso = form.peso === "" ? null : Number(form.peso);
        data.dorsal = form.dorsal === "" ? null : Number(form.dorsal);
      }
      if (esAdminEditandoOtro) {
        data.role = form.role;
        data.isPlayer = form.isPlayer;
      }
      await updateDoc(doc(db, "usuarios", jugador.id), data);
      onSaved();
    } catch (err) {
      setError("No se pudo guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page narrow fade-in">
      <PageHeader eyebrow={`${jugador.nombre || ""} ${jugador.apellidos || ""}`} title="Editar ficha" />
      <form className="card card-body shadow-sm p-4" onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          <div className="col-sm-6">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="col-sm-6">
            <label className="form-label">Apellidos</label>
            <input className="form-control" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label d-block">Foto de perfil</label>
          <div className="d-flex align-items-center gap-2">
            {form.fotoURL && (
              <div className="ficha-avatar" style={{ width: 56, height: 56, fontSize: 16 }}>
                <img src={form.fotoURL} alt="Vista previa" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
            )}
            <SubirFoto uid={jugador.id} onUploaded={(url) => setForm({ ...form, fotoURL: url })} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">o pegá el link de una imagen</label>
          <input
            type="url"
            className="form-control"
            placeholder="https://..."
            value={form.fotoURL}
            onChange={(e) => setForm({ ...form, fotoURL: e.target.value })}
          />
        </div>

        {jugador.isPlayer && (
          <>
            <div className="mb-3">
              <label className="form-label">Posición principal</label>
              <select className="form-select" value={form.posicionPrincipal} onChange={(e) => setForm({ ...form, posicionPrincipal: e.target.value })}>
                {POSICIONES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label d-block">Posiciones secundarias</label>
              <div className="d-flex flex-wrap gap-2">
                {POSICIONES.map((p) => (
                  <label className="tag-pill" key={p}>
                    <input type="checkbox" className="form-check-input mt-0 me-1" checked={form.posicionesSecundarias.includes(p)} onChange={() => toggleSecundaria(p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label">Altura (cm)</label>
                <input type="number" className="form-control" value={form.altura} onChange={(e) => setForm({ ...form, altura: e.target.value })} />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Peso (kg)</label>
                <input type="number" className="form-control" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Dorsal</label>
              <input type="number" className="form-control" min="1" max="99" value={form.dorsal} onChange={(e) => setForm({ ...form, dorsal: e.target.value })} />
            </div>
          </>
        )}

        {esAdminEditandoOtro && (
          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(e) => {
                const role = e.target.value;
                setForm({ ...form, role, isPlayer: role !== "entrenador" });
              }}
            >
              <option value="admin">Admin</option>
              <option value="entrenador">Entrenador</option>
              <option value="capitan">Capitán</option>
              <option value="jugador">Jugador</option>
            </select>
          </div>
        )}

        {error && <p className="text-danger small">{error}</p>}
        <div className="d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
          <button className="btn btn-outline-secondary" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
