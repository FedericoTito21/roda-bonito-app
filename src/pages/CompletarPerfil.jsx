import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { POSICIONES } from "../utils/constants";
import SubirFoto from "../components/SubirFoto";
import PageHeader from "../components/PageHeader";

export default function CompletarPerfil() {
  const { user, perfil, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: perfil?.nombre || "",
    apellidos: perfil?.apellidos || "",
    posicionPrincipal: perfil?.posicionPrincipal || POSICIONES[0],
    posicionesSecundarias: perfil?.posicionesSecundarias || [],
    altura: perfil?.altura || "",
    peso: perfil?.peso || "",
    dorsal: perfil?.dorsal || "",
    fotoURL: perfil?.fotoURL || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="page">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;

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
    if (!form.nombre || !form.apellidos || !form.altura || !form.peso) {
      setError("Todos los campos marcados son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "usuarios", user.uid), {
        nombre: form.nombre,
        apellidos: form.apellidos,
        posicionPrincipal: form.posicionPrincipal,
        posicionesSecundarias: form.posicionesSecundarias,
        altura: Number(form.altura),
        peso: Number(form.peso),
        dorsal: form.dorsal === "" ? null : Number(form.dorsal),
        fotoURL: form.fotoURL.trim(),
        perfilCompleto: true,
      });
      navigate("/");
    } catch (err) {
      setError("No se pudo guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page narrow">
      <PageHeader
        eyebrow="Bienvenido"
        title="Completa tu ficha"
        subtitle="Antes de confirmar disponibilidad o aparecer en convocatorias, necesitamos estos datos."
      />
      <form className="card card-body shadow-sm p-4" onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          <div className="col-sm-6">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="col-sm-6">
            <label className="form-label">Apellidos</label>
            <input className="form-control" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          </div>
        </div>

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
            <input type="number" className="form-control" value={form.altura} onChange={(e) => setForm({ ...form, altura: e.target.value })} required />
          </div>
          <div className="col-sm-6">
            <label className="form-label">Peso (kg)</label>
            <input type="number" className="form-control" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} required />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Dorsal (opcional)</label>
          <input type="number" className="form-control" min="1" max="99" value={form.dorsal} onChange={(e) => setForm({ ...form, dorsal: e.target.value })} />
        </div>

        <div className="mb-3">
          <label className="form-label d-block">Foto de perfil (opcional)</label>
          <div className="d-flex align-items-center gap-2">
            {form.fotoURL && (
              <div className="ficha-avatar" style={{ width: 56, height: 56, fontSize: 16 }}>
                <img src={form.fotoURL} alt="Vista previa" />
              </div>
            )}
            <SubirFoto uid={user.uid} onUploaded={(url) => setForm({ ...form, fotoURL: url })} />
          </div>
        </div>

        {error && <p className="text-danger small">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar ficha"}
        </button>
      </form>
    </div>
  );
}
