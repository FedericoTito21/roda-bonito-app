import { ACTAS, uidsRodaEnActa } from "../data/actas";

export const EQUIPO = "Roda Bonito";

export function hoyISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseFecha(fecha) {
  if (!fecha) return null;
  const d = new Date(fecha + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function partesFecha(fecha) {
  const d = parseFecha(fecha);
  if (!d) return { dia: "", mes: "", semana: "" };
  return {
    dia: d.getDate(),
    mes: d.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
    semana: d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", ""),
  };
}

export function formatLarga(fecha) {
  const d = parseFecha(fecha);
  if (!d) return fecha || "";
  const txt = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

export function diasHasta(fecha) {
  const d = parseFecha(fecha);
  if (!d) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((d - hoy) / 86400000);
}

export function textoCuentaAtras(fecha) {
  const n = diasHasta(fecha);
  if (n == null) return "";
  if (n < 0) return "Pendiente de resultado";
  if (n === 0) return "¡Hoy!";
  if (n === 1) return "Mañana";
  return `En ${n} días`;
}

export function equipos(e) {
  return e.local ? [EQUIPO, e.rival] : [e.rival, EQUIPO];
}

export function tituloEvento(e) {
  if (e.tipo === "entrenamiento") return "Entrenamiento";
  const [a, b] = equipos(e);
  return `${a} vs ${b}`;
}

// En la base de datos, resultadoLocal = goles de Roda Bonito y resultadoRival = goles del rival,
// sin importar quién jugó de local. El orden local/visitante solo afecta a cómo se muestra.
export function marcador(e) {
  if (e.estado !== "jugado" || e.resultadoLocal == null || e.resultadoRival == null) return null;
  const propio = Number(e.resultadoLocal);
  const rival = Number(e.resultadoRival);
  const [izq, der] = e.local ? [propio, rival] : [rival, propio];
  return {
    propio,
    rival,
    izq,
    der,
    texto: `${izq}-${der}`,
    resultado: propio > rival ? "V" : propio === rival ? "E" : "D",
  };
}

export function esPartido(e) {
  return e.tipo === "oficial" || e.tipo === "copa" || e.tipo === "amistoso";
}

export function participantesDe(e, disponiblesSi = []) {
  const statsUids = Object.keys(e.stats || {});
  const acta = ACTAS[e.id];
  let base;
  if (acta) base = uidsRodaEnActa(acta);
  else if (Array.isArray(e.participantes)) base = e.participantes;
  else if (e.convocados?.length) base = e.convocados;
  else base = [...Object.values(e.alineacion?.slots || {}), ...disponiblesSi];
  return [...new Set([...base, ...statsUids])];
}

const PALABRAS_MENORES = new Set(["de", "del", "la", "el", "los", "las", "y", "by", "fc", "cf", "cd", "ud"]);

export function iniciales(nombre) {
  const palabras = (nombre || "?").split(/\s+/).filter((p) => p && /[A-Za-zÀ-ÿ0-9]/.test(p[0]));
  const principales = palabras.filter((p) => !PALABRAS_MENORES.has(p.toLowerCase()));
  return (principales.length ? principales : palabras)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export function resumenTemporada(eventos) {
  const r = { pj: 0, v: 0, e: 0, d: 0, gf: 0, gc: 0 };
  eventos.forEach((ev) => {
    if (!esPartido(ev)) return;
    const m = marcador(ev);
    if (!m) return;
    r.pj++;
    r.gf += m.propio;
    r.gc += m.rival;
    if (m.resultado === "V") r.v++;
    else if (m.resultado === "E") r.e++;
    else r.d++;
  });
  return r;
}
