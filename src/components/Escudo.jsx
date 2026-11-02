import { iniciales } from "../utils/partido";
import { escudoDe } from "../utils/liga";

export default function Escudo({ nombre, size = 56 }) {
  const style = { width: size, height: size, fontSize: size * 0.36 };
  const url = escudoDe(nombre);
  if (url) {
    return (
      <div className="escudo escudo-propio" style={style}>
        <img src={url} alt={nombre} />
      </div>
    );
  }
  return (
    <div className="escudo escudo-rival" style={style} aria-hidden="true">
      {iniciales(nombre)}
    </div>
  );
}
