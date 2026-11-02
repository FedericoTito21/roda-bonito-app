import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { puedeCrear, TIPO_LABEL } from "../utils/constants";
import PageHeader from "../components/PageHeader";

const TIPOS = ["oficial", "copa", "amistoso", "entrenamiento"];
const TIPO_ICON = { oficial: "bi-trophy-fill", copa: "bi-award-fill", amistoso: "bi-emoji-smile-fill", entrenamiento: "bi-stopwatch-fill" };

export default function CrearEvento() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const tiposPermitidos = TIPOS.filter((t) => puedeCrear(t, role));

  const [form, setForm] = useState({
    tipo: tiposPermitidos[0] || "",
    modalidad: "futbol7",
    rival: "",
    fecha: "",
    hora: "",
    lugar: "",
    local: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(form.tipo)) {
      setForm((f) => ({ ...f, tipo: tiposPermitidos[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (loading) return <div className="page">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (tiposPermitidos.length === 0) {
    return (
      <div className="page">
        <h1>Nuevo evento</h1>
        <p className="text-muted">Tu rol no tiene permiso para crear eventos.</p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!puedeCrear(form.tipo, role)) {
      setError("No tenés permiso para crear este tipo de evento.");
      return;
    }
    if (!form.fecha) {
      setError("La fecha es obligatoria.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = {
        tipo: form.tipo,
        fecha: form.fecha,
        hora: form.hora,
        lugar: form.lugar,
        estado: "programado",
        creadoPor: user.uid,
        creadoPorRole: role,
        createdAt: serverTimestamp(),
      };
      if (form.tipo !== "entrenamiento") {
        data.modalidad = form.modalidad;
        data.rival = form.rival;
        data.local = form.local;
        data.resultadoLocal = null;
        data.resultadoRival = null;
        data.convocados = [];
        data.alineacion = { titulares: [], suplentes: [], posiciones: {} };
        data.observaciones = "";
        data.stats = {};
      }
      const ref = await addDoc(collection(db, "eventos"), data);
      navigate(`/evento/${ref.id}`);
    } catch (err) {
      setError("No se pudo crear el evento: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page narrow">
      <PageHeader eyebrow="Calendario" title="Nuevo evento" />
      <form className="card card-body shadow-sm p-4" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label">Tipo</label>
          <div className="type-picker">
            {tiposPermitidos.map((t) => (
              <button
                type="button"
                key={t}
                className={`type-option tipo-${t} ${form.tipo === t ? "active" : ""}`}
                onClick={() => setForm({ ...form, tipo: t })}
              >
                <i className={`bi ${TIPO_ICON[t]}`} />
                {TIPO_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {form.tipo !== "entrenamiento" && (
          <>
            <div className="mb-3">
              <label className="form-label">Rival</label>
              <input className="form-control" value={form.rival} onChange={(e) => setForm({ ...form, rival: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Modalidad</label>
              <select className="form-select" value={form.modalidad} onChange={(e) => setForm({ ...form, modalidad: e.target.value })}>
                <option value="futbol7">Fútbol 7</option>
                <option value="futbol-sala">Fútbol sala</option>
              </select>
            </div>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" role="switch" id="localCheck" checked={form.local} onChange={(e) => setForm({ ...form, local: e.target.checked })} />
              <label className="form-check-label" htmlFor="localCheck">Jugamos como local</label>
            </div>
          </>
        )}

        <div className="row g-3 mb-3">
          <div className="col-sm-6">
            <label className="form-label">Fecha</label>
            <input type="date" className="form-control" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
          </div>
          <div className="col-sm-6">
            <label className="form-label">Hora</label>
            <input type="time" className="form-control" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Sitio</label>
          <input className="form-control" value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} placeholder="Polideportivo, pista…" />
        </div>

        {error && <p className="text-danger small">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Creando…" : "Crear evento"}
        </button>
      </form>
    </div>
  );
}
