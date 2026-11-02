export const POSICIONES = [
  "Portero",
  "Defensa",
  "Lateral",
  "Centrocampista",
  "Extremo",
  "Delantero",
  "Pívot",
  "Ala",
];

export const TIPO_LABEL = {
  oficial: "Liga",
  copa: "Copa",
  amistoso: "Amistoso",
  entrenamiento: "Entrenamiento",
};

export const ROLE_LABEL = {
  admin: "Admin",
  entrenador: "Entrenador",
  capitan: "Capitán",
  jugador: "Jugador",
};

export const TIPO_BADGE = {
  oficial: "bg-danger",
  copa: "bg-copa",
  amistoso: "bg-success",
  entrenamiento: "bg-secondary",
};

export const ROLE_BADGE = {
  admin: "bg-dark",
  entrenador: "bg-success",
  capitan: "bg-danger",
  jugador: "bg-secondary",
};

export function puedeCrear(tipo, role) {
  if (role === "admin") return true;
  if (tipo === "entrenamiento") return role === "entrenador";
  if (tipo === "oficial" || tipo === "copa") return role === "capitan";
  if (tipo === "amistoso") return role === "capitan" || role === "jugador";
  return false;
}
