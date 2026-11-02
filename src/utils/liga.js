import logo from "../assets/logo.png";

export const esPropio = (nombre) => /roda\s+bonito/i.test(nombre || "");

const normalizar = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Fragmento del nombre normalizado → escudo en /public/escudos.
const ESCUDOS = [
  ["puerto alegre", "/escudos/inter_de_puerto_alegre.webp"],
  ["amigos de zizou", "/escudos/elecmont_amigos_de_zizou.webp"],
  ["fisiolab", "/escudos/fc_fisiolab.webp"],
  ["tecnocasa", "/escudos/tecnocasa_delta_montajes.webp"],
  ["princes", "/escudos/vilanova_sant_princes.webp"],
  ["rayo de vilanova", "/escudos/rayo_de_vilanova.webp"],
  ["huevones", "/escudos/huevones_fc.webp"],
  ["metaltech", "/escudos/metaltech_garraf.webp"],
  ["bajitos", "/escudos/bajitosyfuriosos.webp"],
];

export function escudoDe(nombre) {
  if (esPropio(nombre)) return logo;
  const n = normalizar(nombre);
  return ESCUDOS.find(([fragmento]) => n.includes(fragmento))?.[1] || null;
}

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
