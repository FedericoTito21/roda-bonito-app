import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import { hoyISO } from "../utils/partido";

function formatFecha(fecha) {
  if (!fecha) return "";
  const d = new Date(fecha + "T00:00:00");
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

export default function Anuncios() {
  const { user, perfil, role, isStaff } = useAuth();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ titulo: "", contenido: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "anuncios"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAnuncios(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.titulo) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "anuncios"), {
        titulo: form.titulo,
        contenido: form.contenido,
        fecha: hoyISO(),
        autorUid: user.uid,
        autorNombre: perfil?.nombre || user.email,
        autorRole: role,
        createdAt: serverTimestamp(),
      });
      setForm({ titulo: "", contenido: "" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page page-mid">
      <PageHeader eyebrow="Vestuario" title="Anuncios" />

      {isStaff && (
        <form className="panel" onSubmit={handleAdd}>
          <h2 className="panel-title"><i className="bi bi-megaphone-fill" />Nuevo anuncio</h2>
          <div className="mb-3">
            <input
              className="form-control form-control-lg"
              placeholder="Título"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows={3}
              placeholder="¿Qué querés contarle al equipo?"
              value={form.contenido}
              onChange={(e) => setForm({ ...form, contenido: e.target.value })}
            />
          </div>
          <div className="text-end">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              <i className="bi bi-send-fill me-2" />{saving ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </form>
      )}

      {loading && <p>Cargando anuncios…</p>}
      {!loading && anuncios.length === 0 && (
        <p className="text-muted">Todavía no hay anuncios.</p>
      )}

      <div className="vstack gap-3">
        {anuncios.map((a) => (
          <article className="news-card" key={a.id}>
            <div className="news-card-head">
              <span className="player-photo sm">{(a.autorNombre || "R")[0]}</span>
              <div className="flex-fill">
                <div className="fw-semibold lh-sm">{a.autorNombre || "Roda Bonito"}</div>
                <div className="text-muted small">{formatFecha(a.fecha)}</div>
              </div>
              {role === "admin" && (
                <button
                  className="btn btn-sm btn-link text-muted"
                  title="Borrar anuncio"
                  onClick={() => window.confirm("¿Borrar este anuncio?") && deleteDoc(doc(db, "anuncios", a.id))}
                >
                  <i className="bi bi-trash3" />
                </button>
              )}
            </div>
            <h3>{a.titulo}</h3>
            <p className="mb-0" style={{ whiteSpace: "pre-line" }}>{a.contenido}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
