export const BLOQUE_DE_POSICION = {
  Portero: "Porteros",
  Defensa: "Defensas",
  Lateral: "Defensas",
  Centrocampista: "Medios",
  Ala: "Medios",
  Extremo: "Delanteros",
  Pívot: "Delanteros",
  Delantero: "Delanteros",
};

export const ORDEN_BLOQUES = ["Porteros", "Defensas", "Medios", "Delanteros", "Sin posición"];

export const BLOQUE_CLASE = {
  Porteros: "amarillo",
  Defensas: "azul",
  Medios: "verde",
  Delanteros: "rojo",
  "Sin posición": "gris",
};

export function bloqueDe(jugador) {
  return BLOQUE_DE_POSICION[jugador.posicionPrincipal] || "Sin posición";
}
