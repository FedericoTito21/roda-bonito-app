import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { TIPO_LABEL, TIPO_BADGE, puedeCrear } from "../utils/constants";
import { equipos, hoyISO, marcador, partesFecha, tituloEvento } from "../utils/partido";
import Escudo from "../components/Escudo";
import DisponibilidadControl from "../components/DisponibilidadControl";
import PageHeader from "../components/PageHeader";

const FILTROS = ["todos", "oficial", "copa", "amistoso", "entrenamiento"];

export default function Calendario() {
  const { user, role } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    const q = query(collection(db, "eventos"), orderBy("fecha", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const hoy = hoyISO();
  const visibles = eventos.filter((e) => filtro === "todos" || e.tipo === filtro);
  const proximos = visibles.filter((e) => (!e.fecha || e.fecha >= hoy) && e.estado !== "jugado");
  const pasados = visibles.filter((e) => !proximos.includes(e));

  const puedeCrearAlgo = role && (
    puedeCrear("oficial", role) || puedeCrear("copa", role) || puedeCrear("amistoso", role) || puedeCrear("entrenamiento", role)
  );

  return (
    <div className="page">
      <PageHeader eyebrow="Temporada" title="Calendario">
        {user && puedeCrearAlgo && (
          <Link className="btn btn-primary" to="/crear-evento">
            <i className="bi bi-plus-lg me-1" />Nuevo evento
          </Link>
        )}
      </PageHeader>

      <div className="filter-bar mb-4">
        {FILTROS.map((t) => (
          <button
            key={t}
            className={`filter-chip ${filtro === t ? "active" : ""}`}
            onClick={() => setFiltro(t)}
          >
            {t === "todos" ? "Todos" : TIPO_LABEL[t]}
          </button>
        ))}
      </div>

      {loading && <p>Cargando…</p>}
      {!loading && visibles.length === 0 && <p className="text-muted">No hay eventos para mostrar.</p>}

      {proximos.length > 0 && (
        <>
          <h2 className="section-title">Próximos</h2>
          <div className="event-list">
            {proximos.map((e) => <EventoCard key={e.id} evento={e} />)}
          </div>
        </>
      )}

      {pasados.length > 0 && (
        <>
          <h2 className="section-title">Pasados</h2>
          <div className="event-list">
            {pasados.slice().reverse().map((e) => <EventoCard key={e.id} evento={e} pasado />)}
          </div>
        </>
      )}
    </div>
  );
}

function EventoCard({ evento, pasado }) {
  const f = partesFecha(evento.fecha);
  const m = marcador(evento);
  return (
    <div className={`event-card tipo-${evento.tipo} ${pasado ? "pasado" : ""} ${evento.estado === "cancelado" ? "cancelado" : ""}`}>
      <Link className="event-card-main" to={`/evento/${evento.id}`}>
        <div className="date-block">
          <span className="date-week">{f.semana}</span>
          <span className="date-day">{f.dia}</span>
          <span className="date-month">{f.mes}</span>
        </div>
        <div className="event-card-body">
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <span className={`badge ${TIPO_BADGE[evento.tipo]}`}>
              {TIPO_LABEL[evento.tipo]}
              {evento.jornada ? ` · J${evento.jornada}` : ""}
            </span>
            {evento.estado === "cancelado" && <span className="badge bg-light text-dark border">Cancelado</span>}
          </div>
          {evento.tipo === "entrenamiento" ? (
            <div className="event-title">{tituloEvento(evento)}</div>
          ) : (
            <div className="event-teams event-title">
              {equipos(evento).map((nombre, i) => (
                <div className="event-team" key={i}>
                  <Escudo nombre={nombre} size={24} />
                  <span className="event-team-nombre">{nombre}</span>
                  {m && <b className="event-team-goles">{i === 0 ? m.izq : m.der}</b>}
                </div>
              ))}
            </div>
          )}
          <div className="card-meta">
            {evento.hora && <span><i className="bi bi-clock" /> {evento.hora}</span>}
            {evento.lugar && <span><i className="bi bi-geo-alt" /> {evento.lugar}</span>}
            {evento.modalidad && evento.tipo !== "entrenamiento" && (
              <span><i className="bi bi-dribbble" /> {evento.modalidad === "futbol-sala" ? "Fútbol sala" : "Fútbol 7"}</span>
            )}
          </div>
        </div>
        {m ? (
          <div className={`event-score result-${m.resultado}`} title={m.resultado === "V" ? "Victoria" : m.resultado === "E" ? "Empate" : "Derrota"}>
            {m.resultado}
          </div>
        ) : (
          <i className="bi bi-chevron-right event-chevron" />
        )}
      </Link>
      {!pasado && evento.estado !== "cancelado" && (
        <div className="event-card-foot">
          <DisponibilidadControl eventoId={evento.id} />
        </div>
      )}
    </div>
  );
}
