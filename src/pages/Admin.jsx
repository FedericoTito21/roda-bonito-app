import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useUsuarios } from "../hooks/useUsuarios";
import { ROLE_LABEL, ROLE_BADGE, TIPO_LABEL, TIPO_BADGE } from "../utils/constants";
import PageHeader from "../components/PageHeader";
import { EQUIPO_INICIAL, perfilBase } from "../utils/seedTeam";

function ImportarEquipoInicial({ usuarios }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const pendientes = Object.entries(EQUIPO_INICIAL).filter(
    ([uid]) => !usuarios.some((u) => u.id === uid)
  );

  if (pendientes.length === 0) return null;

  async function importar() {
    setSaving(true);
    try {
      for (const [uid, u] of pendientes) {
        await setDoc(doc(db, "usuarios", uid), perfilBase(u), { merge: true });
      }
      setDone(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel-title"><i className="bi bi-cloud-arrow-down-fill" />Importar plantilla inicial</h2>
      <p className="text-muted small">
        Faltan {pendientes.length} cuentas por dar de alta en la base de datos: {pendientes.map(([, u]) => u.email).join(", ")}.
      </p>
      <button className="btn btn-primary btn-sm" onClick={importar} disabled={saving || done}>
        {done ? "Importado" : saving ? "Importando…" : `Importar ${pendientes.length} cuentas`}
      </button>
    </section>
  );
}

export default function Admin() {
  const { user, role, isStaff, loading } = useAuth();
  const { usuarios } = useUsuarios();
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "eventos"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [user]);

  if (loading) return <div className="page">Cargando…</div>;
  if (!user || !isStaff) return <Navigate to="/" replace />;

  return (
    <div className="page">
      <PageHeader eyebrow={`${user.email} · ${ROLE_LABEL[role]}`} title="Administración" />

      {role === "admin" && <ImportarEquipoInicial usuarios={usuarios} />}

      <section className="panel">
        <h2 className="panel-title">
          <i className="bi bi-people-fill" />Usuarios
          <span className="panel-title-extra">{usuarios.length}</span>
        </h2>
        <ul className="list-group list-group-flush mb-2">
          {usuarios.map((u) => (
            <li className="list-group-item px-0 d-flex align-items-center gap-3" key={u.id}>
              <span className="player-photo sm">
                {u.fotoURL ? <img src={u.fotoURL} alt="" /> : (u.nombre || "?")[0]}
              </span>
              <div className="flex-fill min-w-0">
                <Link to={`/jugador/${u.id}`} className="fw-semibold text-reset">{u.nombre} {u.apellidos}</Link>
                <div className="text-muted small text-truncate">{u.email}</div>
              </div>
              <span className={`badge ${ROLE_BADGE[u.role]}`}>{ROLE_LABEL[u.role]}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted small mb-0">
          Para cambiar el rol de alguien, entrá a su ficha y usá "Editar".
        </p>
      </section>

      {role === "admin" && (
        <section className="panel">
          <h2 className="panel-title">
            <i className="bi bi-calendar3" />Eventos
            <span className="panel-title-extra">{eventos.length}</span>
          </h2>
          <ul className="list-group list-group-flush">
            {eventos.map((e) => (
              <li className="list-group-item px-0 d-flex justify-content-between align-items-center gap-2" key={e.id}>
                <Link to={`/evento/${e.id}`} className="text-reset d-flex align-items-center gap-2 min-w-0">
                  <span className="text-muted small text-nowrap">{e.fecha}</span>
                  <span className={`badge ${TIPO_BADGE[e.tipo]}`}>{TIPO_LABEL[e.tipo]}</span>
                  <span className="text-truncate">{e.rival ? `vs ${e.rival}` : ""}</span>
                </Link>
                <button
                  className="btn btn-sm btn-link text-muted"
                  title="Borrar evento"
                  onClick={() => window.confirm(`¿Borrar el evento del ${e.fecha}?`) && deleteDoc(doc(db, "eventos", e.id))}
                >
                  <i className="bi bi-trash3" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
