import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { esPropio } from "../utils/liga";
import { db } from "../firebase";
import { TIPO_LABEL, TIPO_BADGE } from "../utils/constants";
import { esPartido, formatLarga, hoyISO, marcador, partesFecha, resumenTemporada, textoCuentaAtras } from "../utils/partido";
import DisponibilidadControl from "../components/DisponibilidadControl";
import Matchup from "../components/Matchup";
import logo from "../assets/logo.png";

const RESULTADO_TXT = { V: "Victoria", E: "Empate", D: "Derrota" };

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [liga, setLiga] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "eventos"), orderBy("fecha", "asc")), (snap) => {
      setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "anuncios"), orderBy("fecha", "desc"), limit(3)), (snap) => {
      setAnuncios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "competiciones"), where("tipo", "==", "liga"));
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.id < b.id ? 1 : -1));
      setLiga(docs[0] || null);
    });
  }, []);

  const filaLiga = liga?.clasificacion?.find((f) => esPropio(f.equipo));
  const hoy = hoyISO();
  const proximos = eventos.filter((e) => e.fecha >= hoy && e.estado !== "cancelado" && e.estado !== "jugado");
  const proximoPartido = proximos.find(esPartido);
  const restoProximos = proximos.filter((e) => e.id !== proximoPartido?.id).slice(0, 5);
  const ultimoJugado = [...eventos].reverse().find((e) => e.tipo !== "entrenamiento" && marcador(e));
  const temporada = resumenTemporada(eventos.filter((e) => e.tipo === "oficial"));

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <img className="hero-logo" src={logo} alt="Escudo Roda Bonito" />
          <div>
            <div className="hero-eyebrow">Club de fútbol 7</div>
            <h1>Roda Bonito</h1>
            <p className="hero-sub">Calendario, convocatorias, plantilla y estadísticas del equipo.</p>
            <div className="d-flex gap-2 flex-wrap">
              <Link className="btn btn-primary" to="/calendario"><i className="bi bi-calendar3 me-2" />Calendario</Link>
              <Link className="btn btn-outline-light" to="/plantilla"><i className="bi bi-people-fill me-2" />Plantilla</Link>
            </div>
          </div>
        </div>
        <div className="hero-record-title">Liga · partidos oficiales</div>
        <div className="hero-record">
          <RecordItem valor={temporada.pj} label="Jugados" />
          <RecordItem valor={temporada.v} label="Victorias" tono="v" />
          <RecordItem valor={temporada.e} label="Empates" tono="e" />
          <RecordItem valor={temporada.d} label="Derrotas" tono="d" />
          <RecordItem valor={`${temporada.gf}:${temporada.gc}`} label="Goles" />
        </div>
      </section>

      <div className="dash-grid fade-in">
        <div className="dash-card next-match">
          <div className="dash-card-head">
            <h2>Próximo partido</h2>
            {proximoPartido && <span className="countdown">{textoCuentaAtras(proximoPartido.fecha)}</span>}
          </div>
          {!proximoPartido && <p className="text-white-50 mb-0">No hay partidos programados todavía.</p>}
          {proximoPartido && (
            <>
              <Link to={`/evento/${proximoPartido.id}`} className="text-reset d-block next-match-body">
                <Matchup evento={proximoPartido} size={68} />
                <div className="next-match-meta">
                  <span><i className="bi bi-calendar3" /> {formatLarga(proximoPartido.fecha)}</span>
                  {proximoPartido.hora && <span><i className="bi bi-clock" /> {proximoPartido.hora}</span>}
                  {proximoPartido.lugar && <span><i className="bi bi-geo-alt" /> {proximoPartido.lugar}</span>}
                </div>
              </Link>
              <DisponibilidadControl eventoId={proximoPartido.id} dark />
            </>
          )}
        </div>

        <div className="d-flex flex-column gap-3">
          {filaLiga && (
            <Link to="/liga" className="dash-card last-result text-reset">
              <div className="dash-card-head mb-2">
                <h2>Liga</h2>
                <span className="small fw-semibold text-danger">Clasificación <i className="bi bi-chevron-right" /></span>
              </div>
              <div className="home-liga">
                <span className="home-liga-pos">{filaLiga.posicion}º</span>
                <span className="text-muted small">de {liga.clasificacion.length}</span>
                <span className="home-liga-pts">{filaLiga.pts} pts</span>
                <span className="text-muted small ms-auto">{filaLiga.g}G {filaLiga.e}E {filaLiga.p}P</span>
              </div>
            </Link>
          )}
          {ultimoJugado && (
            <Link to={`/evento/${ultimoJugado.id}`} className="dash-card last-result text-reset">
              <div className="dash-card-head">
                <h2>Último resultado</h2>
                <span className={`result-chip result-${marcador(ultimoJugado).resultado}`}>
                  {RESULTADO_TXT[marcador(ultimoJugado).resultado]}
                </span>
              </div>
              <Matchup evento={ultimoJugado} size={44} />
            </Link>
          )}

          <div className="dash-card flex-fill">
            <div className="dash-card-head">
              <h2>Próximas fechas</h2>
              <Link to="/calendario" className="small fw-semibold">Ver todo</Link>
            </div>
            {restoProximos.length === 0 && <p className="text-muted mb-0">Sin más eventos por ahora.</p>}
            <ul className="mini-list">
              {restoProximos.map((e) => {
                const f = partesFecha(e.fecha);
                return (
                  <li key={e.id}>
                    <Link to={`/evento/${e.id}`}>
                      <span className="mini-date"><b>{f.dia}</b>{f.mes}</span>
                      <span className="flex-fill text-truncate">
                        {e.tipo === "entrenamiento" ? "Entrenamiento" : `vs ${e.rival}`}
                      </span>
                      <span className={`tipo-dot ${TIPO_BADGE[e.tipo]}`} title={TIPO_LABEL[e.tipo]} />
                      <span className="text-muted small text-nowrap d-none d-sm-inline">{TIPO_LABEL[e.tipo]}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="dash-card dash-wide">
          <div className="dash-card-head">
            <h2>Últimos anuncios</h2>
            <Link to="/anuncios" className="small fw-semibold">Ver todos</Link>
          </div>
          {anuncios.length === 0 && <p className="text-muted mb-0">Todavía no hay anuncios.</p>}
          <div className="news-grid">
            {anuncios.map((a) => (
              <Link to="/anuncios" className="news-item text-reset" key={a.id}>
                <div className="news-meta">
                  {a.autorNombre && <span className="announcement-author">{a.autorNombre}</span>}
                  <span>{a.fecha}</span>
                </div>
                <h3>{a.titulo}</h3>
                <p>{a.contenido}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordItem({ valor, label, tono }) {
  return (
    <div className={`record-item ${tono ? `record-${tono}` : ""}`}>
      <span className="record-value">{valor}</span>
      <span className="record-label">{label}</span>
    </div>
  );
}
