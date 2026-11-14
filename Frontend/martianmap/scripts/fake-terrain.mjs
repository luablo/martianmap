// Genera public/data/gale/ con TERRENO SINTÉTICO en el formato del contrato
// (CONTEXTO.md §6), para que Ruta y Mapa trabajen sin esperar a los datos reales.
// Los datos reales de P1 sobrescriben estos mismos archivos.
//
//   node scripts/fake-terrain.mjs
//
// Diseño del terreno (malla 750×750 a 4 m = 3×3 km, fila 0 = norte):
//  - Ladera general que sube hacia el sur (Mount Sharp), ~3°.
//  - Lomas suaves (≤ 5°).
//  - ESCARPE diagonal (> 30°) entre la base y Boxwork B-4, con un paso al noreste:
//    la ruta debe rodearlo.
//  - Una loma de ~20° junto al paso: a pie (máx 15°) se rodea, en rover abierto (25°) no.
//  - Zona NO PISAR de roca suelta cerca del objetivo.

import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/data/gale";
const N = 750;
const CELL = 4;
const M_PER_DEG = (3_389_500 * Math.PI) / 180;
const north = -4.7343;
const west = 137.33;
const dLat = CELL / M_PER_DEG;
const dLon = CELL / (M_PER_DEG * Math.cos(((north - (N * dLat) / 2) * Math.PI) / 180));
const bounds = {
  west,
  east: +(west + N * dLon).toFixed(6),
  north,
  south: +(north - N * dLat).toFixed(6),
};
const toLonLat = (col, row) => [
  +(west + (col + 0.5) * dLon).toFixed(6),
  +(north - (row + 0.5) * dLat).toFixed(6),
];

const sig = (x) => 1 / (1 + Math.exp(-x));
const gauss = (c, r, c0, r0, h, sCells) =>
  h * Math.exp(-((c - c0) ** 2 + (r - r0) ** 2) / (2 * sCells ** 2));

function elevation(c, r) {
  let z = r * CELL * 0.05; // sube al sur
  z += 3 * Math.sin((c * CELL) / 160) * Math.cos((r * CELL) / 210); // lomas
  // Escarpe a lo largo de col + row ≈ 720, de col 150 a 470 (paso al noreste)
  const u = c - r;
  const mask = sig((u + 420) / 8) * sig((220 - u) / 8);
  z += 25 * sig((c + r - 720) / 3) * mask;
  // Loma de ~20° junto al paso
  z += gauss(c, r, 520, 205, 60, 22);
  return z;
}

const elev = new Float32Array(N * N);
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) elev[r * N + c] = elevation(c, r);

const slope = new Uint8Array(N * N);
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    const e = (cc, rr) =>
      elev[Math.min(N - 1, Math.max(0, rr)) * N + Math.min(N - 1, Math.max(0, cc))];
    const dzx = (e(c + 1, r) - e(c - 1, r)) / (2 * CELL);
    const dzy = (e(c, r + 1) - e(c, r - 1)) / (2 * CELL);
    const deg = (Math.atan(Math.hypot(dzx, dzy)) * 180) / Math.PI;
    slope[r * N + c] = Math.min(255, Math.round(deg));
  }
}

const base = toLonLat(177, 158);
const poi = (id, name, type, c, r, extra = {}) => ({
  type: "Feature",
  properties: { id, name, type, ...extra },
  geometry: { type: "Point", coordinates: toLonLat(c, r) },
});
const rect = (c0, r0, c1, r1) => [
  [toLonLat(c0, r0), toLonLat(c1, r0), toLonLat(c1, r1), toLonLat(c0, r1), toLonLat(c0, r0)],
];

mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/slope.bin`, slope);
writeFileSync(
  `${OUT}/meta.json`,
  JSON.stringify(
    {
      width: N,
      height: N,
      metersPerPixel: CELL,
      bounds,
      base: { lon: base[0], lat: base[1] },
      sources: ["SINTÉTICO: scripts/fake-terrain.mjs"],
      fake: true,
      files: {},
    },
    null,
    2,
  ),
);
writeFileSync(
  `${OUT}/nogo.geojson`,
  JSON.stringify({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { reason: "Roca suelta (sintético)" },
        geometry: { type: "Polygon", coordinates: rect(600, 440, 680, 500) },
      },
    ],
  }),
);
writeFileSync(
  `${OUT}/pois.geojson`,
  JSON.stringify({
    type: "FeatureCollection",
    features: [
      poi("base", "Base", "base", 177, 158),
      poi("b4", "Boxwork B-4", "target", 562, 528, { description: "Cresta de boxwork" }),
      poi("b2", "Boxwork B-2", "target", 430, 640),
      poi("pov1", "Vista Mastcam", "pov", 300, 300, { sol: 412, camera: "MASTCAM" }),
    ],
  }),
);
writeFileSync(
  `${OUT}/weather.json`,
  JSON.stringify({
    sol: 412,
    tempMinC: -78,
    tempMaxC: -5,
    pressurePa: 750,
    uv: "Moderado",
    source: "SINTÉTICO",
  }),
);

const hist = [0, 0, 0, 0];
for (const s of slope) hist[s < 9 ? 0 : s <= 15 ? 1 : s <= 25 ? 2 : 3]++;
console.log(`Escrito en ${OUT}/ · límites`, bounds);
console.log(
  "Celdas por pendiente: <9°",
  hist[0],
  "· 9–15°",
  hist[1],
  "· 15–25°",
  hist[2],
  "· >25°",
  hist[3],
);
