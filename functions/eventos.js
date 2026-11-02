// Sincroniza los partidos de Roda Bonito de cada competición con la colección "eventos" del calendario.
// Los eventos ya creados a mano se vinculan por tipo + fecha; a partir de ahí se siguen por `fedKey`.

const esPropio = (nombre) => /roda\s+bonito/i.test(nombre || "");

const MINUSCULAS = new Set(["de", "del", "la", "el", "y", "by", "los", "las"]);
const SIGLAS = new Set(["FC", "CF", "CD", "UD", "SD", "CE", "UE", "AE", "E."]);

export function nombreEquipo(nombre) {
  return (nombre || "")
    .split(" ")
    .map((p, i) => {
      if (SIGLAS.has(p.toUpperCase())) return p.toUpperCase();
      const l = p.toLowerCase();
      if (i > 0 && MINUSCULAS.has(l)) return l;
      return l.charAt(0).toUpperCase() + l.slice(1);
    })
    .join(" ");
}

// "19-11-2026 22:30" → { fecha: "2026-11-19", hora: "22:30" }
function fechaHora(texto, respaldo) {
  const m = (texto || respaldo || "").match(/(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{1,2}:\d{2}))?/);
  if (!m) return null;
  return { fecha: `${m[3]}-${m[2]}-${m[1]}`, hora: m[4] || "" };
}

export function planSincronizacion(comp, jornadas, eventos) {
  const tipoEvento = comp.tipo === "copa" ? "copa" : "oficial";
  const usados = new Set();
  const acciones = [];

  for (const j of jornadas || []) {
    for (const p of j.partidos) {
      const local = esPropio(p.local);
      if (!local && !esPropio(p.visitante)) continue;
      const fh = fechaHora(p.fecha, j.fecha);
      if (!fh) continue;

      const fedKey = `${comp.id}|J${j.numero}`;
      const lugar = p.campo ? `Camp ${p.campo}` : "";
      let resultado = null;
      if (p.resultado) {
        const [gl, gv] = p.resultado.split("-").map(Number);
        resultado = local ? { nos: gl, ellos: gv } : { nos: gv, ellos: gl };
      }

      const existente =
        eventos.find((e) => e.fedKey === fedKey) ||
        eventos.find((e) => !e.fedKey && !usados.has(e.id) && e.tipo === tipoEvento && e.fecha === fh.fecha);

      if (existente) {
        usados.add(existente.id);
        const cambios = {};
        if (existente.fedKey !== fedKey) cambios.fedKey = fedKey;
        if (existente.competicionId !== comp.id) cambios.competicionId = comp.id;
        if (existente.jornada !== j.numero) cambios.jornada = j.numero;
        if (existente.fecha !== fh.fecha) cambios.fecha = fh.fecha;
        if (fh.hora && existente.hora !== fh.hora) cambios.hora = fh.hora;
        if (lugar && existente.lugar !== lugar) cambios.lugar = lugar;
        if (resultado && existente.resultadoLocal == null && existente.estado !== "cancelado") {
          cambios.resultadoLocal = resultado.nos;
          cambios.resultadoRival = resultado.ellos;
          cambios.estado = "jugado";
        }
        if (Object.keys(cambios).length) acciones.push({ tipo: "actualizar", id: existente.id, datos: cambios });
        continue;
      }

      acciones.push({
        tipo: "crear",
        id: `fed-${comp.id}-j${j.numero}`,
        datos: {
          tipo: tipoEvento,
          modalidad: "futbol7",
          rival: nombreEquipo(local ? p.visitante : p.local),
          local,
          fecha: fh.fecha,
          hora: fh.hora,
          lugar,
          estado: resultado ? "jugado" : "programado",
          resultadoLocal: resultado ? resultado.nos : null,
          resultadoRival: resultado ? resultado.ellos : null,
          convocados: [],
          alineacion: {},
          observaciones: "",
          stats: {},
          fedKey,
          competicionId: comp.id,
          jornada: j.numero,
          creadoPor: "federacion",
          creadoPorRole: "sistema",
        },
      });
    }
  }
  return acciones;
}
