export const FORMACIONES = {
  "2-3-1": [2, 3, 1],
  "3-2-1": [3, 2, 1],
  "3-1-2": [3, 1, 2],
  "2-2-2": [2, 2, 2],
  "1-3-2": [1, 3, 2],
  "2-1-2-1": [2, 1, 2, 1],
};

const LINE_NAMES = {
  2: ["POR", "DEF", "DEL"],
  3: ["POR", "DEF", "MED", "DEL"],
  4: ["POR", "DEF", "MCD", "MED", "DEL"],
};

export function slotsOf(formacion) {
  const lines = [1, ...(FORMACIONES[formacion] || FORMACIONES["2-3-1"])];
  const L = lines.length - 1;
  const names = LINE_NAMES[L] || LINE_NAMES[3];
  return lines.flatMap((n, li) =>
    Array.from({ length: n }, (_, i) => ({
      id: `${li}-${i}`,
      label: names[li],
      top: li === 0 ? 88 : 70 - (li - 1) * (52 / Math.max(1, L - 1)),
      left: ((i + 1) / (n + 1)) * 100,
    }))
  );
}
