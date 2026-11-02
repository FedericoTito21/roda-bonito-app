import Escudo from "./Escudo";
import { equipos, marcador } from "../utils/partido";

export default function Matchup({ evento, size = 64 }) {
  const [a, b] = equipos(evento);
  const m = marcador(evento);
  return (
    <div className="matchup">
      <div className="matchup-team">
        <Escudo nombre={a} size={size} />
        <span className="matchup-name">{a}</span>
      </div>
      <div className="matchup-center">
        {m ? (
          <span className="matchup-score">
            {m.izq}<span className="matchup-sep">-</span>{m.der}
          </span>
        ) : (
          <span className="matchup-vs">VS</span>
        )}
      </div>
      <div className="matchup-team">
        <Escudo nombre={b} size={size} />
        <span className="matchup-name">{b}</span>
      </div>
    </div>
  );
}
