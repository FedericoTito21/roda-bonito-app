import { useState } from "react";
import { buildLineupImage, shareOrDownloadImage } from "../utils/lineupImage";
import { waUrl } from "../utils/whatsapp";

export default function CompartirAlineacion({ texto, imagen }) {
  const [generando, setGenerando] = useState(false);

  async function compartirImagen() {
    setGenerando(true);
    try {
      const blob = await buildLineupImage(imagen);
      if (!blob) return;
      await shareOrDownloadImage(blob, "alineacion.png", texto);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="d-flex gap-2 flex-wrap mt-2">
      <a className="btn btn-sm btn-wa" href={waUrl(texto)} target="_blank" rel="noopener noreferrer">
        <i className="bi bi-whatsapp me-1" />
        Enviar por WhatsApp
      </a>
      <button className="btn btn-outline-danger btn-sm" type="button" onClick={compartirImagen} disabled={generando}>
        <i className="bi bi-image-fill me-1" />
        {generando ? "Generando…" : "Compartir imagen"}
      </button>
    </div>
  );
}
