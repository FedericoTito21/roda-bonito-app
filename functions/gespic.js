import * as cheerio from "cheerio";

const limpiar = (s) => (s || "").replace(/\s+/g, " ").trim();
const num = (s) => {
  const n = parseInt(limpiar(s), 10);
  return Number.isNaN(n) ? 0 : n;
};

function absoluta(src, base) {
  if (!src) return null;
  try {
    return new URL(src, base).href;
  } catch {
    return null;
  }
}

function escudo($, el, base) {
  const img = $(el).find("img").first();
  return absoluta(img.attr("src"), base);
}

// Columnas de cada fila de .table-rank:
// 0 pos · 1 escudo · 2 equipo · 3-6 PJ/PG/PE/PP · 7-10 casa · 11-14 fuera · 15 GF · 16 GC · 17 DIF · 18 Pts
export function parseClasificacion(html, base) {
  const $ = cheerio.load(html);
  const filas = [];
  $("table.table-rank tbody tr").each((_, tr) => {
    const td = $(tr).children("td");
    if (td.length < 19) return;
    const equipo = limpiar($(td[2]).text());
    if (!equipo) return;
    filas.push({
      posicion: num($(td[0]).text()),
      equipo,
      escudo: escudo($, td[1], base),
      pj: num($(td[3]).text()),
      g: num($(td[4]).text()),
      e: num($(td[5]).text()),
      p: num($(td[6]).text()),
      gf: num($(td[15]).text()),
      gc: num($(td[16]).text()),
      dif: num($(td[17]).text()),
      pts: num($(td[18]).text()),
    });
  });
  return filas;
}

// Página "calendari": una tabla .table-matchday por jornada.
// Columnas de cada fila: 0 local · 1 escudo local · 2 resultado/fecha/campo · 3 escudo visitante · 4 visitante
export function parseCalendario(html, base) {
  const $ = cheerio.load(html);
  const jornadas = [];
  $("table.table-matchday").each((_, tabla) => {
    const cabecera = limpiar($(tabla).find("thead th").first().text());
    const m = cabecera.match(/Jornada\s+(\d+)(?:\s*\((\d{2}-\d{2}-\d{4})\))?/i);
    if (!m) return;
    const partidos = [];
    $(tabla).find("tbody tr").each((_, tr) => {
      const td = $(tr).children("td");
      if (td.length < 5) return;
      const local = limpiar($(td[0]).text());
      const visitante = limpiar($(td[4]).text());
      if (!local || !visitante) return;
      const marcador = limpiar($(td[2]).find(".match-score").text());
      partidos.push({
        local,
        visitante,
        escudoLocal: escudo($, td[1], base),
        escudoVisitante: escudo($, td[3], base),
        resultado: /^\d+\s*-\s*\d+$/.test(marcador) ? marcador.replace(/\s/g, "") : null,
        fecha: limpiar($(td[2]).find(".match-schedule").text()),
        campo: limpiar($(td[2]).find(".match-field").text()).replace(/^Camp\s*/i, ""),
      });
    });
    jornadas.push({ numero: Number(m[1]), fecha: m[2] || null, partidos });
  });
  return jornadas.sort((a, b) => a.numero - b.numero);
}

export function parseJornada(html, base) {
  const $ = cheerio.load(html);
  const tabla = $("table.table-matchday").first();
  if (!tabla.length) return null;
  const titulo = limpiar(tabla.find("thead").first().find("th").first().text());
  const partidos = [];
  tabla.find("tbody tr").each((_, tr) => {
    const td = $(tr).children("td");
    if (td.length < 4) return;
    const local = limpiar($(td[0]).find("a").first().text() || $(td[0]).text());
    const visitante = limpiar($(td[2]).find("a").first().text() || $(td[2]).text());
    if (!local || !visitante) return;
    const resultado = limpiar($(td[1]).text());
    partidos.push({
      local,
      visitante,
      escudoLocal: escudo($, td[0], base),
      escudoVisitante: escudo($, td[2], base),
      resultado: /^\d+\s*-\s*\d+$/.test(resultado) ? resultado.replace(/\s/g, "") : null,
      fecha: limpiar($(td[3]).text()),
    });
  });
  return { titulo, partidos };
}
