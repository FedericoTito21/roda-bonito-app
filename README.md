# Roda Bonito FC · App del equipo

Aplicación web para gestionar un equipo amateur de fútbol 7 que juega en la Lliga Comarcal del Garraf. Los jugadores pueden consultar el calendario, confirmar si están disponibles, ver las alineaciones y seguir sus estadísticas y la clasificación de la liga.

🔗 **Demo:** https://roda-bonito.web.app

## Funcionalidades

- **Inicio de sesión y perfiles**: autenticación con Firebase Auth, roles (admin, capitán, entrenador, jugador) y una ficha por jugador con su foto, posiciones y datos físicos.
- **Calendario y eventos**: creación de partidos y entrenamientos, y control de la disponibilidad de cada jugador.
- **Pizarra táctica**: constructor de alineaciones sobre un campo, con varias formaciones. La alineación se exporta como imagen y se comparte por WhatsApp.
- **Clasificación de la liga**: una Cloud Function lee la clasificación y el calendario oficiales de la federación (web de gespic) y los guarda en Firestore.
- **Estadísticas**: goles, partidos jugados y otros datos sacados de las actas oficiales.
- **Anuncios e historia** del club.
- **Panel de administración** para dar de alta a la plantilla.

## Tecnologías

| Parte | Tecnología |
| --- | --- |
| Frontend | React 19, React Router 7, Vite |
| Estilos | Bootstrap 5 (personalizado con SCSS), Bootstrap Icons |
| Backend | Firebase: Firestore, Authentication, Storage y Hosting |
| Funciones servidor | Firebase Cloud Functions (Node.js) con Cheerio para leer HTML |
| Seguridad | Reglas de Firestore y Storage por rol |
| Calidad de código | Oxlint |

## Estructura

```
src/
  components/   Componentes reutilizables (campo, alineaciones, navegación…)
  pages/        Una página por ruta (Calendario, Liga, Plantilla, Pizarra…)
  context/      Contexto de autenticación y roles
  hooks/        Hooks propios para leer datos de Firestore
  utils/        Formaciones, cálculos de la liga, generación de imágenes…
functions/      Cloud Functions (lectura de la clasificación oficial)
firestore.rules Reglas de seguridad de la base de datos
storage.rules   Reglas de seguridad para la subida de fotos
```

## Ejecutar en local

1. Copia `.env.example` a `.env` y rellénalo con la configuración de tu proyecto de Firebase.
2. Instala las dependencias y arranca el servidor de desarrollo:

```bash
npm install
npm run dev
```

## Autor

Federico Mathias
