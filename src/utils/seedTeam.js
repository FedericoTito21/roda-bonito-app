// Altas iniciales de la plantilla de Roda Bonito (UID reales de Firebase Auth).
export const EQUIPO_INICIAL = {
  CNVQrFs9HahXlygR7UVSdC7awrS2: { email: "jugador1@ejemplo.com", role: "capitan", isPlayer: true, nombre: "Eric" },
  EouVNLs7kfTt6z0rnNUrZrQtWpu1: { email: "jugador2@ejemplo.com", role: "entrenador", isPlayer: false, nombre: "Yoe" },
  Z4S3QX5PQOexTQVRdk6un7Gp3gv1: { email: "jugador3@ejemplo.com", role: "jugador", isPlayer: true, nombre: "Yuri" },
  VSgQ97w8RoNVAqBThzEGBC0qn3F2: { email: "jugador4@ejemplo.com", role: "jugador", isPlayer: true, nombre: "Ramon" },
  BuhnRaNeqtU4C1bT77AwsDcaXyA2: { email: "jugador5@ejemplo.com", role: "jugador", isPlayer: true, nombre: "G. Salgado" },
  qfAHOnb054ZlpRFq3scNWYxuFl53: { email: "jugador6@ejemplo.com", role: "jugador", isPlayer: true, nombre: "Nano" },
  yOCQhvhP8ZNRjFUJtzqkICQcFkm1: { email: "jugador7@ejemplo.com", role: "jugador", isPlayer: true, nombre: "David" },
  kIJand0YoJRzRqjvSXSA9iBgpqa2: { email: "jugador8@ejemplo.com", role: "jugador", isPlayer: true, nombre: "Arnau" },
  "2pwytKcrDJae9MIPvmpyV8DKeaX2": { email: "jugador9@ejemplo.com", role: "jugador", isPlayer: true, nombre: "Alan" },
};

export function perfilBase(u) {
  const base = {
    email: u.email,
    role: u.role,
    isPlayer: u.isPlayer,
    nombre: u.nombre,
    apellidos: "",
  };
  if (!u.isPlayer) return base;
  return {
    ...base,
    posicionPrincipal: "",
    posicionesSecundarias: [],
    altura: null,
    peso: null,
    perfilCompleto: false,
  };
}
