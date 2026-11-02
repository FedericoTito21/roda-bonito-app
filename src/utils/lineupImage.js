import { slotsOf } from "./formaciones";

const FONT = "system-ui, 'Segoe UI', Arial, sans-serif";

function clip(ctx, text, max) {
  let s = String(text ?? "");
  if (ctx.measureText(s).width <= max) return s;
  while (s.length > 1 && ctx.measureText(s + "…").width > max) s = s.slice(0, -1);
  return s + "…";
}

export async function buildLineupImage({ teamName, title, subtitle, formacion, slots, bench, jugadoresById }) {
  const W = 1080, H = 1350;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");

  x.fillStyle = "#15141a";
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < W; i += 136) {
    x.fillStyle = "#1f1d26";
    x.fillRect(i + 68, 0, 68, 236);
  }
  x.fillStyle = "#d81c34";
  x.fillRect(0, 236, W, 6);

  x.textAlign = "left";
  x.textBaseline = "alphabetic";
  x.fillStyle = "#ffffff";
  x.font = `800 68px ${FONT}`;
  x.fillText(clip(x, (teamName || "").toUpperCase(), W - 120), 60, 108);
  x.fillStyle = "#ff4d5e";
  x.font = `700 42px ${FONT}`;
  x.fillText(clip(x, (title || "").toUpperCase(), W - 120), 60, 164);
  x.fillStyle = "rgba(255,255,255,.85)";
  x.font = `500 32px ${FONT}`;
  x.fillText(clip(x, subtitle || "", W - 120), 60, 210);

  const px = 60, py = 276, pw = W - 120, ph = 860;
  for (let i = 0; i < 10; i++) {
    x.fillStyle = i % 2 ? "#2F8550" : "#2A7A49";
    x.fillRect(px, py + (i * ph) / 10, pw, ph / 10 + 1);
  }
  x.strokeStyle = "rgba(255,255,255,.85)";
  x.lineWidth = 5;
  x.strokeRect(px, py, pw, ph);
  x.beginPath();
  x.arc(px + pw / 2, py, pw * 0.17, 0, Math.PI);
  x.stroke();
  x.strokeRect(px + pw * 0.22, py + ph * 0.8, pw * 0.56, ph * 0.2);
  x.strokeRect(px + pw * 0.38, py + ph * 0.94, pw * 0.24, ph * 0.06);

  x.textAlign = "center";
  for (const s of slotsOf(formacion)) {
    const uid = slots[s.id];
    const j = uid ? jugadoresById[uid] : null;
    if (!j) continue;
    const cx = px + (pw * s.left) / 100;
    const cy = py + (ph * (s.label === "POR" ? 83 : s.top)) / 100;
    x.beginPath();
    x.arc(cx, cy, 54, 0, Math.PI * 2);
    x.fillStyle = s.label === "POR" ? "#F2F2F2" : "#d81c34";
    x.fill();
    x.lineWidth = 6;
    x.strokeStyle = "#ffffff";
    x.stroke();
    x.fillStyle = s.label === "POR" ? "#15141a" : "#ffffff";
    x.font = `900 54px ${FONT}`;
    x.textBaseline = "middle";
    x.fillText(String(j.dorsal || "–"), cx, cy + 3);
    x.font = `700 36px ${FONT}`;
    x.textBaseline = "alphabetic";
    x.shadowColor = "rgba(0,0,0,.6)";
    x.shadowBlur = 8;
    x.fillStyle = "#ffffff";
    x.fillText(clip(x, j.nombre, 260), cx, cy + 96);
    x.shadowBlur = 0;
    x.shadowColor = "transparent";
  }

  x.textAlign = "left";
  x.fillStyle = "#ff4d5e";
  x.font = `700 34px ${FONT}`;
  x.fillText(bench && bench.length ? "SUPLENTES" : "", 60, 1196);
  x.textAlign = "right";
  x.font = `800 44px ${FONT}`;
  x.fillText(formacion, W - 60, 1196);

  if (bench && bench.length) {
    x.textAlign = "left";
    x.fillStyle = "#ffffff";
    x.font = `500 34px ${FONT}`;
    const words = bench.map((uid) => {
      const j = jugadoresById[uid];
      return j ? `${j.dorsal ? j.dorsal + " " : ""}${j.nombre}` : "?";
    });
    let line = "", y = 1246;
    for (const w of words) {
      const t = line ? `${line}, ${w}` : w;
      if (x.measureText(t).width > W - 120 && line) {
        x.fillText(line + ",", 60, y);
        y += 46;
        line = w;
        if (y > 1320) break;
      } else {
        line = t;
      }
    }
    if (line && y <= 1320) x.fillText(line, 60, y);
  }

  return new Promise((resolve) => c.toBlob(resolve, "image/png"));
}

export async function shareOrDownloadImage(blob, filename, texto) {
  if (!blob) return "error";
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: texto || "" });
      return "compartido";
    } catch (err) {
      if (err?.name === "AbortError") return "cancelado";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "descargado";
}
