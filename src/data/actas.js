// Datos transcritos de las actas oficiales de la Lliga Comarcal Futbol-7, indexados por id de evento.
// Solo figuran los jugadores con dorsal en el acta (los que jugaron); `noJugaron` son inscritos sin dorsal.
// `uid` enlaza a la ficha del jugador de Roda Bonito.

const RODA = {
  gerard: "BuhnRaNeqtU4C1bT77AwsDcaXyA2",
  jordi: "FahXy6T8QlRYiXYbfgRnP5LntIY2",
  jon: "maclHWkDCUUdhTJ7Im4aG9HtA6Y2",
  eric: "CNVQrFs9HahXlygR7UVSdC7awrS2",
  david: "yOCQhvhP8ZNRjFUJtzqkICQcFkm1",
  arnau: "kIJand0YoJRzRqjvSXSA9iBgpqa2",
  yuri: "Z4S3QX5PQOexTQVRdk6un7Gp3gv1",
  nano: "qfAHOnb054ZlpRFq3scNWYxuFl53",
  ramon: "VSgQ97w8RoNVAqBThzEGBC0qn3F2",
  nico: "ICxGkXJgJtWljpOQL7zLwjvJydG2",
  alan: "2pwytKcrDJae9MIPvmpyV8DKeaX2",
  federico: "Ln7QGfUMyOhixOETgqbkDZy9Tkh1",
  carlos: "ky4UEZNIEOf1IdMrElNR5VfiAlh2",
};

export const ACTAS = {
  // Jornada 1 · Rayo de Vilanova 9-1 Roda Bonito FC
  mlt30rsYfyxXbN8boOVq: {
    jornada: 1,
    categoria: "Primera",
    fecha: "19/10/2026",
    hora: "22:30",
    campo: "Annex 4",
    arbitro: "Víctor",
    local: {
      nombre: "Rayo de Vilanova",
      goles: 9,
      jugadores: [
        { nombre: "Eloi Mellinas", dorsal: 1 },
        { nombre: "Xavier Hernandez", dorsal: 20, goles: 1, amarillas: 1 },
        { nombre: "Marc Quesada", dorsal: 7 },
        { nombre: "Isaac Valades", dorsal: 15, goles: 1 },
        { nombre: "Hugo Aranda", dorsal: 4 },
        { nombre: "Joan Paul Fabregas", dorsal: 9, goles: 2 },
        { nombre: "Daniel Reñe", dorsal: 10 },
        { nombre: "Erik Garcia", dorsal: 22, goles: 1 },
        { nombre: "Carlos Gonzalez", dorsal: 3 },
        { nombre: "Lucas Saenz", dorsal: 6, goles: 4 },
      ],
      noJugaron: ["Victor Vicente", "Andres Lopez"],
      delegado: "Xavier Hernandez",
      entrenador: "Oscar Galindo",
    },
    visitante: {
      nombre: "Roda Bonito FC",
      goles: 1,
      jugadores: [
        { nombre: "Gerard Salgado", uid: RODA.gerard, dorsal: 8, goles: 1 },
        { nombre: "Jordi Carmona", uid: RODA.jordi, dorsal: 10 },
        { nombre: "Jon Fedi", uid: RODA.jon, dorsal: 2 },
        { nombre: "Arnau Solé", uid: RODA.arnau, dorsal: 7 },
        { nombre: "Yuri Diaz", uid: RODA.yuri, dorsal: 6 },
        { nombre: "Fernando Bueno", uid: RODA.nano, dorsal: 11, amarillas: 1 },
        { nombre: "Ramon Rius", uid: RODA.ramon, dorsal: 19 },
        { nombre: "Alan Poveda", uid: RODA.alan, dorsal: 4 },
        { nombre: "Federico Tito", uid: RODA.federico, dorsal: 3 },
      ],
      noJugaron: ["Eric Ciruelo", "David Lopez", "Nico De Manincor", "Carlos Parra"],
      delegado: "Eric Ciruelo",
      entrenador: "Yoe Pacios",
    },
    observaciones: "",
  },

  // Jornada 2 · Roda Bonito FC 1-2 Inter de Puerto Alegre
  poPMwjk5Qzx373PZYDF4: {
    jornada: 2,
    categoria: "Primera",
    fecha: "26/10/2026",
    hora: "22:30",
    campo: "Annex 4",
    arbitro: "Santi San Nicolás",
    local: {
      nombre: "Roda Bonito FC",
      goles: 1,
      jugadores: [
        { nombre: "Gerard Salgado", uid: RODA.gerard, dorsal: 8 },
        { nombre: "Jordi Carmona", uid: RODA.jordi, dorsal: 10 },
        { nombre: "Jon Fedi", uid: RODA.jon, dorsal: 2 },
        { nombre: "David Lopez", uid: RODA.david, dorsal: 13 },
        { nombre: "Arnau Solé", uid: RODA.arnau, dorsal: 7 },
        { nombre: "Yuri Diaz", uid: RODA.yuri, dorsal: 6 },
        { nombre: "Fernando Bueno", uid: RODA.nano, dorsal: 11, goles: 1, amarillas: 1 },
        { nombre: "Ramon Rius", uid: RODA.ramon, dorsal: 19 },
        { nombre: "Federico Tito", uid: RODA.federico, dorsal: 3 },
        { nombre: "Carlos Parra", uid: RODA.carlos, dorsal: 4 },
      ],
      noJugaron: ["Eric Ciruelo", "Nico De Manincor", "Alan Poveda"],
      delegado: "Eric Ciruelo",
      entrenador: "Yoe Pacios",
    },
    visitante: {
      nombre: "Inter de Puerto Alegre",
      goles: 2,
      jugadores: [
        { nombre: "Ferran Alemany Sadurní", dorsal: 29 },
        { nombre: "Martí Díaz Romero", dorsal: 18 },
        { nombre: "Jordi Espejo García", dorsal: 60 },
        { nombre: "Adrian Maza Camacho", dorsal: 22 },
        { nombre: "David Menor Arenas", dorsal: 17, amarillas: 1 },
        { nombre: "Adrian Redondo Guerrero", dorsal: 10, goles: 1 },
        { nombre: "Álex Álvarez García", dorsal: 28 },
        { nombre: "David Miguel Arias Lopez", dorsal: 0 },
        { nombre: "Marc Saez Capdet", dorsal: 77, goles: 1 },
      ],
      noJugaron: ["Gerard Sáez Capdet", "Àlex Carbonell Cuellar"],
      delegado: "Martí Díaz Romero",
      entrenador: "Àlex Carbonell Cuellar",
    },
    observaciones: "",
  },
};

export function uidsRodaEnActa(acta) {
  return [...acta.local.jugadores, ...acta.visitante.jugadores].filter((j) => j.uid).map((j) => j.uid);
}
