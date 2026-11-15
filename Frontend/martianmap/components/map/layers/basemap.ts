// Dueño: P3 (Mapa). Mapas base de Marte (NASA Trek WMTS).
//
// Trek sirve tiles equirectangulares (EQ, latitud lineal).
// MapLibre envía coordenadas Mercator ({z}/{y}/{x}). Dos diferencias:
//   • Columna: Trek tiene 2·2^z columnas; XYZ tiene 2^z  → col_trek = col_xyz * 2
//   • Fila:    Trek usa lat lineal; XYZ usa Mercator       → fila se recalcula
// Solución: `transformRequest` en el constructor del mapa. Las URLs de los tiles
// usan el prefijo "trek-eq://" como marcador; transformRequest las convierte a
// la URL real de trek.nasa.gov con las coordenadas EQ correctas.
//
// CORS: Access-Control-Allow-Origin: * confirmado en trek.nasa.gov.
// Formato: image/jpeg. Zooms disponibles: 0–7.

import type { Map as MlMap, RequestParameters, RequestTransformFunction } from "maplibre-gl";

const TREK = "https://trek.nasa.gov/tiles/Mars/EQ";

/** Prefijo interno. Usamos https:// con hostname ficticio para que MapLibre
 *  lo pase a transformRequest (solo procesa http/https, no esquemas custom). */
export const TREK_PROXY_PREFIX = "https://trek-mars-eq.local/";

export type BasemapId = "none" | "viking" | "mola" | "mola_hrsc";

export interface BasemapDef {
  id: BasemapId;
  label: string;
  description: string;
  layer: string;
  attribution: string;
  maxZoom: number;
}

export const BASEMAPS: Record<BasemapId, BasemapDef> = {
  none: {
    id: "none",
    label: "Ninguno",
    description: "Fondo oscuro (solo capas de misión)",
    layer: "",
    attribution: "",
    maxZoom: 20,
  },
  viking: {
    id: "viking",
    label: "Color Viking",
    description: "Mosaico fotográfico global — Viking VIS (232 m/px)",
    layer: "Mars_Viking_MDIM21_ClrMosaic_global_232m",
    attribution: "NASA/USGS — Viking VIS MDIM 2.1 · trek.nasa.gov",
    maxZoom: 7,
  },
  mola: {
    id: "mola",
    label: "Relieve MOLA",
    description: "Topografía coloreada — MGS MOLA (463 m/px)",
    layer: "Mars_MGS_MOLA_ClrShade_merge_global_463m",
    attribution: "NASA/USGS — MGS MOLA Color Hillshade · trek.nasa.gov",
    maxZoom: 7,
  },
  mola_hrsc: {
    id: "mola_hrsc",
    label: "Relieve MOLA+HRSC",
    description: "Topografía MOLA con detalle Mars Express HRSC (200 m/px)",
    layer: "Mars_MOLA_blend200ppx_HRSC_ClrShade_clon0dd_200mpp_lzw",
    attribution: "NASA/ESA — MOLA + Mars Express HRSC · trek.nasa.gov",
    maxZoom: 7,
  },
};

// ─── Conversión de coordenadas ────────────────────────────────────────────────

/** Convierte fila XYZ (Mercator) → fila EQ (latitud lineal) para el mismo z. */
function mercatorRowToEQ(xyzRow: number, z: number): number {
  const n = Math.pow(2, z);
  // Centro del tile en normalizado [0,1] en Mercator (0=norte, 1=sur)
  const yNorm = (xyzRow + 0.5) / n;
  // Latitud correspondiente en grados
  const lat = Math.atan(Math.sinh(Math.PI * (1 - yNorm * 2))) * (180 / Math.PI);
  // Fila EQ: Trek tiene n filas, fila 0 = norte (+90°)
  return Math.max(0, Math.min(n - 1, Math.floor(((90 - lat) / 180) * n)));
}

/** Convierte columna XYZ → columna EQ Trek (Trek tiene el doble de columnas). */
function mercatorColToEQ(xyzCol: number): number {
  return xyzCol * 2;
}

// ─── transformRequest ─────────────────────────────────────────────────────────

/**
 * Pasar como `transformRequest` al constructor del mapa (MapOptions).
 * Detecta URLs trek-eq://{layer}/{z}/{y}/{x} y las convierte a URLs reales de Trek.
 */
export const trekTransformRequest: RequestTransformFunction = (
  url: string,
): RequestParameters => {
  if (!url.startsWith(TREK_PROXY_PREFIX)) return { url };
  // https://trek-mars-eq.local/{layer}/{z}/{y}/{x}
  const path = url.slice(TREK_PROXY_PREFIX.length);
  const parts = path.split("/");
  const x     = parseInt(parts[parts.length - 1], 10);
  const y     = parseInt(parts[parts.length - 2], 10);
  const z     = parseInt(parts[parts.length - 3], 10);
  const layer = parts.slice(0, -3).join("/");
  const eqRow = mercatorRowToEQ(y, z);
  const eqCol = mercatorColToEQ(x);
  return { url: `${TREK}/${layer}/1.0.0/default/default028mm/${z}/${eqRow}/${eqCol}.jpg` };
};

// ─── applyBasemap ─────────────────────────────────────────────────────────────

/** Añade (o reemplaza) el mapa base. Inserta debajo de todo lo demás. */
export function applyBasemap(map: MlMap, id: BasemapId) {
  if (map.getLayer("basemap")) map.removeLayer("basemap");
  if (map.getSource("basemap")) map.removeSource("basemap");

  const def = BASEMAPS[id];
  if (id === "none" || !def.layer) return;

  map.addSource("basemap", {
    type: "raster",
    tiles: [`${TREK_PROXY_PREFIX}${def.layer}/{z}/{y}/{x}`],
    tileSize: 256,
    attribution: def.attribution,
    minzoom: 0,
    maxzoom: def.maxZoom,
  });

  const firstLayerId = map.getStyle().layers[1]?.id;
  map.addLayer(
    {
      id: "basemap",
      type: "raster",
      source: "basemap",
      paint: { "raster-resampling": "linear", "raster-opacity": 1 },
    },
    firstLayerId,
  );
}
