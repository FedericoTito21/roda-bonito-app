import { slotsOf } from "../utils/formaciones";

export default function Pitch({ formacion, slots, jugadoresById, edit, picked, onSlotClick, mini }) {
  return (
    <div className={`pitch ${mini ? "pitch-mini" : ""}`}>
      <i className="pitch-ln pitch-half" />
      <i className="pitch-ln pitch-circ" />
      <i className="pitch-ln pitch-area" />
      <i className="pitch-ln pitch-goal" />
      {slotsOf(formacion).map((s) => {
        const uid = slots[s.id];
        const j = uid ? jugadoresById[uid] : null;
        const esVacio = !j;
        const esPortero = s.label === "POR";
        const Tag = edit ? "button" : "div";
        return (
          <Tag
            key={s.id}
            type={edit ? "button" : undefined}
            className={`pitch-slot ${esVacio ? "vacio" : ""} ${esPortero ? "portero" : ""} ${picked === s.id ? "elegido" : ""}`}
            style={{ left: `${s.left}%`, top: `${s.top}%` }}
            onClick={edit ? () => onSlotClick(s.id) : undefined}
          >
            <span className="pitch-disc">{j ? j.dorsal || "–" : s.label}</span>
            {j && !mini && <span className="pitch-nm">{j.nombre}</span>}
          </Tag>
        );
      })}
    </div>
  );
}
