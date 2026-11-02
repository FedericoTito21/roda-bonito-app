import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useUsuarios } from "../hooks/useUsuarios";
import Pitch from "../components/Pitch";
import LineupBuilder from "../components/LineupBuilder";
import CompartirAlineacion from "../components/CompartirAlineacion";
import { TIPO_LABEL } from "../utils/constants";
import { esPartido, hoyISO, tituloEvento } from "../utils/partido";
import PageHeader from "../components/PageHeader";

export default function Pizarra() {
  const { user, isStaff, loading: authLoading } = useAuth();
  const { usuarios, jugadores } = useUsuarios();
  const [tableros, setTableros] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [editando, setEditando] = useState(null); // null | "nuevo" | tableroId

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(collection(db, "tableros"), orderBy("creadoEn", "desc")), (snap) => {
      setTableros(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(collection(db, "eventos"), orderBy("fecha", "asc")), (snap) => {
      setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  if (authLoading) return <div className="page">Cargando…</div>;
  if (!user || !isStaff) return <Navigate to="/" replace />;

  const jugadoresById = Object.fromEntries(usuarios.map((u) => [u.id, u]));
  const hoy = hoyISO();
  const proximoPartido = eventos.find(
    (e) => e.fecha >= hoy && e.estado !== "cancelado" && esPartido(e)
  );

  if (editando) {
    const tablero = editando === "nuevo" ? null : tableros.find((t) => t.id === editando);
    return (
      <EditorTablero
        tablero={tablero}
        jugadores={jugadores}
        jugadoresById={jugadoresById}
        proximoPartido={proximoPartido}
        onDone={() => setEditando(null)}
      />
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Staff"
        title="Pizarra"
        subtitle="Prepará alineaciones con toda la plantilla y usalas en cualquier partido con un clic."
      >
        <button className="btn btn-primary" onClick={() => setEditando("nuevo")}>
          <i className="bi bi-plus-lg me-1" />Nueva alineación
        </button>
      </PageHeader>

      {proximoPartido && (
        <div className="info-strip mb-4">
          <i className="bi bi-calendar-event" />
          <div>
            <strong>Próximo partido:</strong> {tituloEvento(proximoPartido)} · {proximoPartido.fecha}
          </div>
          {proximoPartido.alineacion?.slots && Object.keys(proximoPartido.alineacion.slots).length > 0
            ? <span className="badge bg-success ms-auto">Con alineación</span>
            : <span className="badge bg-warning text-dark ms-auto">Sin alineación</span>}
        </div>
      )}

      {tableros.length === 0 && (
        <div className="empty-state">
          <i className="bi bi-easel2" />
          <h3>Pizarra vacía</h3>
          <p className="text-muted">Creá tu primera alineación: elegí la formación y tocá a cada jugador para ubicarlo.</p>
          <button className="btn btn-primary" onClick={() => setEditando("nuevo")}>Crear alineación</button>
        </div>
      )}

      <div className="boards-grid">
        {tableros.map((t) => (
          <div className="board-card" key={t.id}>
            <Pitch formacion={t.formacion} slots={t.slots || {}} jugadoresById={jugadoresById} mini />
            <strong>{t.nombre}</strong>
            <span className="text-muted small">
              {t.formacion} · {Object.keys(t.slots || {}).length}/7
            </span>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-danger btn-sm" onClick={() => setEditando(t.id)}>Editar</button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => window.confirm(`¿Borrar "${t.nombre}"?`) && deleteDoc(doc(db, "tableros", t.id))}
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorTablero({ tablero, jugadores, jugadoresById, proximoPartido, onDone }) {
  const [nombre, setNombre] = useState(tablero?.nombre || "");
  const [formacion, setFormacion] = useState(tablero?.formacion || "2-3-1");
  const [slots, setSlots] = useState(tablero?.slots || {});
  const [saving, setSaving] = useState(false);
  const pool = jugadores.map((j) => j.id);

  async function guardar() {
    setSaving(true);
    try {
      const data = {
        nombre: nombre.trim() || `Alineación ${formacion}`,
        formacion,
        slots,
        creadoEn: tablero?.creadoEn || serverTimestamp(),
      };
      if (tablero) await updateDoc(doc(db, "tableros", tablero.id), data);
      else await addDoc(collection(db, "tableros"), data);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  async function usarEnProximoPartido() {
    if (!proximoPartido) return;
    const convocados = proximoPartido.convocados || [];
    const slotsFiltrados = convocados.length
      ? Object.fromEntries(Object.entries(slots).filter(([, uid]) => convocados.includes(uid)))
      : slots;
    await updateDoc(doc(db, "eventos", proximoPartido.id), { alineacion: { formacion, slots: slotsFiltrados } });
    onDone();
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Pizarra" title={tablero ? "Editar alineación" : "Nueva alineación"} />
      <div className="panel">
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Titular habitual" />
        </div>
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
        <div className="d-flex gap-2 flex-wrap mt-3">
          <button className="btn btn-primary" onClick={guardar} disabled={saving}>
            {saving ? "Guardando…" : "Guardar en la pizarra"}
          </button>
          {proximoPartido && (
            <button className="btn btn-outline-danger" onClick={usarEnProximoPartido}>
              Usar en el próximo partido ({TIPO_LABEL[proximoPartido.tipo]})
            </button>
          )}
          <button className="btn btn-outline-secondary" onClick={onDone}>Cancelar</button>
        </div>
        {Object.keys(slots).length > 0 && (
          <CompartirAlineacion
            texto={`Alineación "${nombre || formacion}" (${formacion})`}
            imagen={{
              teamName: "Roda Bonito",
              title: nombre || "Alineación",
              subtitle: `Formación ${formacion}`,
              formacion,
              slots,
              bench: [],
              jugadoresById,
            }}
          />
        )}
      </div>
    </div>
  );
}
