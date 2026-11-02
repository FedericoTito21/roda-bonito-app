import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export const OPCIONES_DISP = [
  { valor: "si", label: "Voy", icon: "bi-check-lg" },
  { valor: "duda", label: "Duda", icon: "bi-question-lg" },
  { valor: "no", label: "No voy", icon: "bi-x-lg" },
];

export function DispBotones({ estado, onMarcar, dark, compact }) {
  return (
    <div className={`disponibilidad-row ${dark ? "dark" : ""} ${compact ? "compact" : ""}`}>
      {OPCIONES_DISP.map((o) => (
        <button
          key={o.valor}
          type="button"
          className={`disp-btn ${o.valor} ${estado === o.valor ? "active" : ""}`}
          onClick={() => onMarcar(o.valor)}
        >
          <i className={`bi ${o.icon}`} />
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function DisponibilidadControl({ eventoId, dark }) {
  const { user, isPlayer } = useAuth();
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    if (!user || !isPlayer) return;
    const ref = doc(db, "eventos", eventoId, "disponibilidad", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setEstado(snap.exists() ? snap.data().estado : null);
    });
    return unsubscribe;
  }, [eventoId, user, isPlayer]);

  if (!user || !isPlayer) return null;

  async function marcar(valor) {
    setEstado(valor);
    await setDoc(doc(db, "eventos", eventoId, "disponibilidad", user.uid), {
      estado: valor,
      actualizadoEn: serverTimestamp(),
    });
  }

  return <DispBotones estado={estado} onMarcar={marcar} dark={dark} />;
}
