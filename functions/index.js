import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger, setGlobalOptions } from "firebase-functions/v2";
import { parseCalendario, parseClasificacion, parseJornada } from "./gespic.js";
import { planSincronizacion } from "./eventos.js";

initializeApp();
setGlobalOptions({ region: "europe-west1", maxInstances: 2 });

// Las URLs salen de https://cegarraf.gespic.com/competicions
const COMPETICIONES = [
  {
    id: "liga-2026-2027",
    tipo: "liga",
    nombre: "Primera División",
    temporada: "2026/2027",
    url: "https://cegarraf.gespic.com/classificacio/2026-2027/ceg/futbol/senior/primera-divisio",
    calendarioUrl: "https://cegarraf.gespic.com/calendari/2026-2027/ceg/futbol/senior/primera-divisio",
  },
  {
    id: "copa-2027-grupo-d",
    tipo: "copa",
    nombre: "La Copa 2027 · Grupo D",
    temporada: "2026/2027",
    url: "https://cegarraf.gespic.com/classificacio/2026-2027/ceg/futbol/senior/la-copa-2027/grup-d",
    calendarioUrl: "https://cegarraf.gespic.com/calendari/2026-2027/ceg/futbol/senior/la-copa-2027/grup-d",
  },
];

async function descargar(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "RodaBonitoWeb/1.0 (+https://roda-bonito.web.app)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}

// Si la federación deja de mostrar un resultado que ya teníamos guardado, se conserva el guardado.
function conservarResultados(nuevas, anteriores = []) {
  const previos = new Map();
  anteriores.forEach((j) =>
    j.partidos?.forEach((p) => p.resultado && previos.set(`${j.numero}|${p.local}|${p.visitante}`, p.resultado))
  );
  return nuevas.map((j) => ({
    ...j,
    partidos: j.partidos.map((p) => ({
      ...p,
      resultado: p.resultado || previos.get(`${j.numero}|${p.local}|${p.visitante}`) || null,
    })),
  }));
}

async function sincronizarCalendario(comp, jornadas) {
  const db = getFirestore();
  const snap = await db.collection("eventos").get();
  const eventos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const acciones = planSincronizacion(comp, jornadas, eventos);
  if (acciones.length === 0) return { creados: 0, actualizados: 0 };
  const batch = db.batch();
  for (const a of acciones) {
    const docRef = db.collection("eventos").doc(a.id);
    if (a.tipo === "crear") batch.set(docRef, { ...a.datos, createdAt: FieldValue.serverTimestamp() });
    else batch.update(docRef, a.datos);
  }
  await batch.commit();
  const creados = acciones.filter((a) => a.tipo === "crear").length;
  logger.info(`Calendario ${comp.id}: ${creados} creados, ${acciones.length - creados} actualizados`);
  return { creados, actualizados: acciones.length - creados };
}

async function actualizarCompeticion(comp) {
  const ref = getFirestore().collection("competiciones").doc(comp.id);
  const base = { tipo: comp.tipo, nombre: comp.nombre, temporada: comp.temporada, url: comp.url, calendarioUrl: comp.calendarioUrl || null };
  try {
    const html = await descargar(comp.url);
    const clasificacion = parseClasificacion(html, comp.url);
    if (clasificacion.length === 0) throw new Error("No se encontró la tabla de clasificación");
    const jornada = parseJornada(html, comp.url);

    let jornadas = null;
    if (comp.calendarioUrl) {
      const nuevas = parseCalendario(await descargar(comp.calendarioUrl), comp.calendarioUrl);
      if (nuevas.length === 0) throw new Error("No se encontraron jornadas en el calendario");
      const anterior = await ref.get();
      jornadas = conservarResultados(nuevas, anterior.get("jornadas"));
    }

    await ref.set({
      ...base,
      clasificacion,
      jornada,
      jornadas,
      actualizadoEn: FieldValue.serverTimestamp(),
      ultimoIntento: FieldValue.serverTimestamp(),
      error: null,
    });
    const calendario = jornadas ? await sincronizarCalendario(comp, jornadas) : null;
    return { id: comp.id, ok: true, equipos: clasificacion.length, jornadas: jornadas?.length ?? 0, calendario };
  } catch (err) {
    logger.error(`Error actualizando ${comp.id}`, err);
    await ref.set({ ...base, ultimoIntento: FieldValue.serverTimestamp(), error: String(err.message || err) }, { merge: true });
    return { id: comp.id, ok: false, error: String(err.message || err) };
  }
}

const actualizarTodas = () => Promise.all(COMPETICIONES.map(actualizarCompeticion));

export const actualizarCompeticionesProgramado = onSchedule(
  { schedule: "0 12 * * 2", timeZone: "Europe/Madrid" },
  async () => {
    const r = await actualizarTodas();
    logger.info("Competiciones actualizadas", r);
  }
);

// El botón "Actualizar ahora" crea un documento aquí (las reglas solo se lo permiten al admin).
// Se usa un trigger de Firestore porque la política de la organización no permite funciones invocables públicas.
export const procesarSolicitudActualizacion = onDocumentCreated(
  { document: "solicitudesActualizacion/{id}", region: "us-central1" },
  async (event) => {
    const ref = event.data.ref;
    const uid = event.data.get("uid");
    const usuario = uid ? await getFirestore().collection("usuarios").doc(uid).get() : null;
    if (!usuario || usuario.get("role") !== "admin") {
      await ref.update({ estado: "error", error: "Solo el admin puede actualizar la clasificación." });
      return;
    }
    const resultados = await actualizarTodas();
    const fallo = resultados.find((r) => !r.ok);
    await ref.update({
      estado: fallo ? "error" : "ok",
      error: fallo ? fallo.error : null,
      resultados,
      terminadoEn: FieldValue.serverTimestamp(),
    });
  }
);
