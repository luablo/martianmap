// Dueño: P3 (Mapa). Capa de pendiente como `image` source sobre los 4 bordes de la zona.
//
// Dos caminos, mismo resultado visible:
//   1. P1 ya entregó meta.files.slope (un PNG ya coloreado con alfa) → se usa esa URL.
//   2. Mientras no exista (datos sintéticos) → se pinta zone.slope (Uint8Array) en un
//      <canvas> con los mismos colores que P1 y se usa como image source (canvas.toDataURL).
//
// Colores (idénticos a data-pipeline/pendiente.py):
//   < 9°  → transparente
//   9–15° → ámbar  #FBBF24
//   > 15° → rojo   #EF4444
//   alfa ~60 % (153) en las celdas pintadas, como en el PNG que exporta P1.
//
// zone.slope es fila por fila desde el norte (fila 0 = norte), columna 0 = oeste.
// El canvas pinta fila 0 arriba; el image source mapea el norte arriba. Coinciden.

import type { Map as MlMap } from "maplibre-gl";
import type { ZoneData } from "@/lib/types";
import { ZONE_URL } from "@/lib/data/zone";

const COLOR_AMBER: readonly [number, number, number] = [0xfb, 0xbf, 0x24]; // #FBBF24
const COLOR_RED: readonly [number, number, number] = [0xef, 0x44, 0x44]; // #EF4444
const FILL_ALPHA = 153; // ~60 %

/** Pinta zone.slope en un canvas y devuelve un data URL, o null si no hay pendiente. */
function slopeToDataURL(zone: ZoneData): string | null {
  if (!zone.slope) return null;
  const { width, height } = zone.meta;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const img = ctx.createImageData(width, height);
  const px = img.data;
  const n = Math.min(zone.slope.length, width * height);
  for (let i = 0; i < n; i++) {
    const s = zone.slope[i];
    const off = i * 4;
    if (s < 9) {
      px[off + 3] = 0; // transparente: no tapa la ortofoto de abajo
    } else {
      const c = s <= 15 ? COLOR_AMBER : COLOR_RED;
      px[off] = c[0];
      px[off + 1] = c[1];
      px[off + 2] = c[2];
      px[off + 3] = FILL_ALPHA;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/**
 * Añade la capa de pendiente. Si no hay ni files.slope ni zone.slope, no hace nada.
 *
 * @param beforeId Inserta la capa debajo de esta (p. ej. "grid") para que las líneas
 *                 de referencia y la ruta queden encima. Por defecto "grid".
 */
export function addSlopeLayer(map: MlMap, zone: ZoneData, beforeId = "grid") {
  const file = zone.meta.files?.slope;
  const url = file ? `${ZONE_URL}/${file}` : slopeToDataURL(zone);
  if (!url) return; // no hay datos de pendiente: no se añade la capa

  const { west, south, east, north } = zone.meta.bounds;
  map.addSource("slope", {
    type: "image",
    url,
    coordinates: [
      [west, north], // sup-izq
      [east, north], // sup-der
      [east, south], // inf-der
      [west, south], // inf-izq
    ],
  });
  map.addLayer(
    {
      id: "slope",
      type: "raster",
      source: "slope",
      // El alfa ya va cocido en el canvas/PNG; aquí no se duplica la opacidad.
      paint: { "raster-resampling": "linear" },
    },
    beforeId,
  );
}
