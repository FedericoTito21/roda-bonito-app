import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

export default function SubirFoto({ uid, onUploaded }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Tiene que ser una imagen.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB.");
      return;
    }
    setError("");
    setSubiendo(true);
    try {
      const path = `fotos/${uid}/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      onUploaded(url);
    } catch (err) {
      setError("No se pudo subir: " + err.message);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div>
      <label className="btn btn-outline-danger btn-sm" style={{ cursor: "pointer", display: "inline-flex" }}>
        <i className="bi bi-camera-fill me-1" />
        {subiendo ? "Subiendo…" : "Subir foto"}
        <input type="file" accept="image/*" onChange={handleFile} disabled={subiendo} style={{ display: "none" }} />
      </label>
      {error && <p className="text-danger small mt-1">{error}</p>}
    </div>
  );
}
