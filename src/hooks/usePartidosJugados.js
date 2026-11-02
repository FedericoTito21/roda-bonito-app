import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { esPartido, marcador, participantesDe } from "../utils/partido";

// Partidos (oficiales y amistosos) ya jugados, del más reciente al más antiguo,
// cada uno con `participantes` y `marcador` resueltos.
export function usePartidosJugados() {
  const [eventos, setEventos] = useState([]);
  const [siPorEvento, setSiPorEvento] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "eventos"), where("estado", "==", "jugado"));
    return onSnapshot(q, (snap) => {
      setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter(esPartido));
      setLoading(false);
    });
  }, []);

  const sinLista = eventos.filter((e) => !Array.isArray(e.participantes) && !e.convocados?.length);
  const claveSinLista = sinLista.map((e) => e.id).join(",");

  useEffect(() => {
    if (!claveSinLista) return;
    let cancelado = false;
    Promise.all(
      claveSinLista.split(",").map(async (id) => {
        const snap = await getDocs(collection(db, "eventos", id, "disponibilidad"));
        return [id, snap.docs.filter((d) => d.data().estado === "si").map((d) => d.id)];
      })
    ).then((pares) => {
      if (!cancelado) setSiPorEvento((prev) => ({ ...prev, ...Object.fromEntries(pares) }));
    });
    return () => {
      cancelado = true;
    };
  }, [claveSinLista]);

  const partidos = eventos
    .map((e) => ({ ...e, participantes: participantesDe(e, siPorEvento[e.id]), marcador: marcador(e) }))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  const esperandoAsistencia = sinLista.some((e) => !(e.id in siPorEvento));
  return { partidos, loading: loading || esperandoAsistencia };
}
