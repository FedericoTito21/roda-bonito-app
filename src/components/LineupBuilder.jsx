import { useState } from "react";
import Pitch from "./Pitch";
import { FORMACIONES, slotsOf } from "../utils/formaciones";

export default function LineupBuilder({ formacion, slots, pool, jugadoresById, onChange }) {
  const [picked, setPicked] = useState(null); // { type: "banca", uid } | { type: "slot", slotId }

  const validIds = new Set(slotsOf(formacion).map((s) => s.id));
  const slotsLimpios = Object.fromEntries(
    Object.entries(slots).filter(([k, uid]) => validIds.has(k) && pool.includes(uid))
  );
  const titularesSet = new Set(Object.values(slotsLimpios));
  const banca = pool.filter((uid) => !titularesSet.has(uid));

  function cambiarFormacion(f) {
    const nuevosValidos = new Set(slotsOf(f).map((s) => s.id));
    const nuevos = Object.fromEntries(Object.entries(slotsLimpios).filter(([k]) => nuevosValidos.has(k)));
    setPicked(null);
    onChange({ formacion: f, slots: nuevos });
  }

  function colocar(uid, slotId) {
    const nuevos = { ...slotsLimpios };
    const slotPrevio = Object.keys(nuevos).find((k) => nuevos[k] === uid);
    const ocupante = nuevos[slotId];
    if (slotPrevio) delete nuevos[slotPrevio];
    if (ocupante && slotPrevio) nuevos[slotPrevio] = ocupante;
    nuevos[slotId] = uid;
    setPicked(null);
    onChange({ formacion, slots: nuevos });
  }

  function clickSlot(slotId) {
    if (picked?.type === "banca") {
      colocar(picked.uid, slotId);
      return;
    }
    if (picked?.type === "slot" && picked.slotId !== slotId) {
      const nuevos = { ...slotsLimpios };
      const a = nuevos[picked.slotId];
      const b = nuevos[slotId];
      if (a) {
        if (b) nuevos[picked.slotId] = b;
        else delete nuevos[picked.slotId];
        nuevos[slotId] = a;
      }
      setPicked(null);
      onChange({ formacion, slots: nuevos });
      return;
    }
    if (picked?.type === "slot" && picked.slotId === slotId) {
      setPicked(null);
      return;
    }
    if (slotsLimpios[slotId]) setPicked({ type: "slot", slotId });
  }

  function clickBanca(uid) {
    setPicked((p) => (p?.type === "banca" && p.uid === uid ? null : { type: "banca", uid }));
  }

  function vaciar() {
    setPicked(null);
    onChange({ formacion, slots: {} });
  }

  return (
    <div className="lineup-builder">
      <div className="d-flex justify-content-between align-items-center">
        <span className="text-uppercase small text-muted fw-semibold">Formación</span>
        <span className="text-muted small">{Object.keys(slotsLimpios).length}/7 en el campo</span>
      </div>
      <ul className="nav nav-pills gap-1 flex-wrap mb-0">
        {Object.keys(FORMACIONES).map((f) => (
          <li className="nav-item" key={f}>
            <button
              type="button"
              className={`nav-link py-1 px-3 ${formacion === f ? "active" : "bg-light text-dark"}`}
              onClick={() => cambiarFormacion(f)}
            >
              {f}
            </button>
          </li>
        ))}
      </ul>

      <Pitch formacion={formacion} slots={slotsLimpios} jugadoresById={jugadoresById} edit picked={picked?.type === "slot" ? picked.slotId : null} onSlotClick={clickSlot} />

      <p className="text-muted small mb-0">Tocá a un jugador y luego su puesto en la cancha. Tocá dos titulares para cambiarlos de sitio.</p>

      <div className="bench-zone">
        <span className="text-uppercase small text-muted fw-semibold">Suplentes · {banca.length}</span>
        {banca.length === 0 && <p className="text-muted small mb-0">Todos colocados.</p>}
        {banca.length > 0 && (
          <div className="d-flex flex-wrap gap-2">
            {banca.map((uid) => {
              const j = jugadoresById[uid];
              return (
                <button
                  key={uid}
                  type="button"
                  className={`tag-pill ${picked?.type === "banca" && picked.uid === uid ? "elegido" : ""}`}
                  onClick={() => clickBanca(uid)}
                >
                  <b>{j?.dorsal || "–"}</b> {j?.nombre}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button className="btn btn-outline-danger btn-sm align-self-start" type="button" onClick={vaciar}>Vaciar cancha</button>
    </div>
  );
}
