import { slotsOf } from "./formaciones";

function pnum(uid, jugadoresById) {
  const j = jugadoresById[uid];
  if (!j) return "?";
  return `${j.dorsal ? j.dorsal + " " : ""}${j.nombre} ${j.apellidos || ""}`.trim();
}

function formatFecha(fecha) {
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  const cap = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  return cap.charAt(0).toUpperCase() + cap.slice(1);
}

export function buildWaText({ evento, jugadoresById, teamName = "Roda Bonito" }) {
  const esPartido = evento.tipo !== "entrenamiento";
  const L = [];
  const tipoLabel = esPartido ? (evento.convocatoriaPublicada ? "CONVOCATORIA" : "PARTIDO") : "ENTRENAMIENTO";
  L.push(`⚽ *${tipoLabel} · ${teamName}*`);

  const titulo = esPartido ? `vs ${evento.rival || "rival por confirmar"}` : "Entrenamiento";
  const sufijoLocal = esPartido ? ` (${evento.local === false ? "visitante" : "local"})` : "";
  L.push(`${titulo} · ${formatFecha(evento.fecha)}${evento.hora ? " · " + evento.hora : ""}${sufijoLocal}`);
  if (evento.lugar) L.push(`📍 ${evento.lugar}`);

  const al = evento.alineacion;
  const tieneAlineacion = al && al.slots && Object.keys(al.slots).length > 0;

  if (tieneAlineacion) {
    L.push("", `*Titulares (${al.formacion})*`);
    const porLinea = new Map();
    for (const s of slotsOf(al.formacion)) {
      const uid = al.slots[s.id];
      if (!uid) continue;
      if (!porLinea.has(s.label)) porLinea.set(s.label, []);
      porLinea.get(s.label).push(uid);
    }
    for (const [label, uids] of porLinea) {
      L.push(`${label}: ${uids.map((u) => pnum(u, jugadoresById)).join(", ")}`);
    }
    const titularesSet = new Set(Object.values(al.slots));
    const banquillo = (evento.convocados || []).filter((uid) => !titularesSet.has(uid));
    if (banquillo.length) L.push("", `*Suplentes:* ${banquillo.map((u) => pnum(u, jugadoresById)).join(", ")}`);
  } else if (evento.convocados && evento.convocados.length) {
    L.push("", `*Convocados (${evento.convocados.length})*`, evento.convocados.map((u) => pnum(u, jugadoresById)).join(", "));
  }

  L.push("", `Confirmá disponibilidad en la web: ${window.location.origin}`);
  return L.join("\n");
}

export function waUrl(texto) {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
