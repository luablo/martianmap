// Dueño: P3. Zonas "NO PISAR": rayado diagonal real + borde rojo + etiqueta "NO PISAR".
//
// El rayado es un patrón de canvas 12×12 (45°, 6px rojo a 45 % / 6px transparente,
// igual que .hatch-danger de globals.css) registrado con map.addImage y usado como
// fill-pattern. Nunca solo color: el rojo va rayado y con texto "NO PISAR" (daltonismo,
// visor empañado). La etiqueta es un marcador HTML en el centro de cada polígono (no
// necesita glyphs en el estilo).

import type { Feature, MultiPolygon, Polygon } from "geojson";
import { Map as MlMap, Marker } from "maplibre-gl";
import type { NoGo } from "@/lib/types";

const TILE = 12;

/** Registra el patrón de rayado "nogo-hatch" (idempotente). */
function addHatchPattern(map: MlMap) {
  if (map.hasImage("nogo-hatch")) return;
  const canvas = document.createElement("canvas");
  canvas.width = TILE;
  canvas.height = TILE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(TILE, TILE);
  const px = img.data;
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const off = (y * TILE + x) * 4;
      // 45°: t recorre 0..11 a lo largo de la diagonal. 6px rojo / 6px transparente.
      const t = (((y - x) % TILE) + TILE) % TILE;
      if (t < 6) {
        px[off] = 0xef; // #EF4444
        px[off + 1] = 0x44;
        px[off + 2] = 0x44;
        px[off + 3] = 115; // ~45 % (como --color-danger al 45 %)
      } else {
        px[off + 3] = 0; // transparente: se ve la capa de abajo entre líneas
      }
    }
  }
  map.addImage(
    "nogo-hatch",
    { width: TILE, height: TILE, data: new Uint8Array(img.data) },
    { pixelRatio: 1 },
  );
}

/** Centro (bbox) de un polígono o multipolígono, para poner la etiqueta. */
function featureCenter(f: Feature<Polygon | MultiPolygon>): [number, number] | null {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  let any = false;
  const visit = (node: unknown): void => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === "number" && typeof node[1] === "number") {
      minLon = Math.min(minLon, node[0] as number);
      maxLon = Math.max(maxLon, node[0] as number);
      minLat = Math.min(minLat, node[1] as number);
      maxLat = Math.max(maxLat, node[1] as number);
      any = true;
    } else {
      for (const child of node) visit(child);
    }
  };
  visit(f.geometry.coordinates);
  return any ? [(minLon + maxLon) / 2, (minLat + maxLat) / 2] : null;
}

export function addNoGoLayer(map: MlMap, nogo: NoGo) {
  addHatchPattern(map);

  map.addSource("nogo", { type: "geojson", data: nogo });
  // Relleno rayado: fill-pattern aplica el patrón "nogo-hatch" en toda la poligonal.
  map.addLayer({
    id: "nogo-fill",
    type: "fill",
    source: "nogo",
    paint: { "fill-pattern": "nogo-hatch" },
  });
  // Borde rojo que encuadra la zona prohibida.
  map.addLayer({
    id: "nogo-line",
    type: "line",
    source: "nogo",
    paint: { "line-color": "#ef4444", "line-width": 1.5 },
  });

  // Etiqueta "NO PISAR" en el centro de cada polígono (marcador HTML, sin glyphs).
  for (const f of nogo.features) {
    const c = featureCenter(f);
    if (!c) continue;
    const el = document.createElement("div");
    el.className = "marker-nogo";
    el.textContent = "NO PISAR";
    new Marker({ element: el, anchor: "center" }).setLngLat(c).addTo(map);
  }
}
