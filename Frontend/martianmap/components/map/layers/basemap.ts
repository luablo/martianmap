// Dueño: P3 (Mapa). Mapas base de Marte (NASA Trek WMTS) como image source.
//
// ESTRATEGIA: image source (no tiles dinámicos)
// Trek solo tiene hasta z=7 EQ (~1.4°/tile, 256×256px). La zona de Gale (~0.11°)
// cabe en ~20px de un tile → con tiles dinámicos MapLibre pide z=13 → 404 →
// degrada al z=7 y lo estira ×64 → pixelado brutal.
//
// Solución: image source con las coordenadas reales del tile exacto que cubre Gale
// (z=7, row=67, col=225), igual que hace ortho.ts con la ortofoto HiRISE.
// MapLibre escala bilinealmente: sin límite de zoom, sin pixelado.
//
// Al cambiar de mapa base se usa `updateImage` (no se recrea la fuente) para evitar
// el parpadeo y el bug de recreación de sources con type="image" en MapLibre 6.
//
// CORS: Access-Control-Allow-Origin: * confirmado en trek.nasa.gov.

import type { Map as MlMap } from "maplibre-gl";

const TREK = "https://trek.nasa.gov/tiles/Mars/EQ";

// ─── Tile de Gale (z=7, row=67, col=225) ─────────────────────────────────────
// Trek EQ z=7: 256 columnas (2^8) × 128 filas (2^7). Fila 0 = norte.
// Bbox:  west=col*(360/256)−180,  east=(col+1)*(360/256)−180
//        north=90−row*(180/128),  south=90−(row+1)*(180/128)
const TILE = { z: 7, row: 67, col: 225 };
const TILE_BOUNDS = {
  west:  TILE.col       * (360 / 256) - 180,  // 136.40625°
  east:  (TILE.col + 1) * (360 / 256) - 180,  // 137.8125°
  north: 90 - TILE.row       * (180 / 128),   //  -4.21875°
  south: 90 - (TILE.row + 1) * (180 / 128),   //  -5.625°
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type BasemapId = "none" | "viking" | "mola" | "mola_hrsc";

export interface BasemapDef {
  id: BasemapId;
  label: string;
  description: string;
  layer: string;        // nombre de la capa en Trek; vacío si id==="none"
  attribution: string;
  /** Paint cuando NO hay ortofoto HiRISE encima. */
  paintSolo:  { opacity: number; contrast: number; saturation: number };
  /** Paint cuando SÍ hay ortofoto encima (el basemap da contexto suave). */
  paintBlend: { opacity: number; contrast: number; saturation: number };
}

export const BASEMAPS: Record<BasemapId, BasemapDef> = {
  none: {
    id: "none", label: "Ninguno",
    description: "Fondo oscuro (solo capas de misión)",
    layer: "", attribution: "",
    paintSolo:  { opacity: 0,    contrast: 0,    saturation: 0    },
    paintBlend: { opacity: 0,    contrast: 0,    saturation: 0    },
  },
  viking: {
    id: "viking", label: "Color Viking",
    description: "Mosaico fotográfico global — Viking VIS (232 m/px)",
    layer: "Mars_Viking_MDIM21_ClrMosaic_global_232m",
    attribution: "NASA/USGS — Viking VIS MDIM 2.1 · trek.nasa.gov",
    paintSolo:  { opacity: 1,    contrast: 0.3,  saturation: 0.45 },
    paintBlend: { opacity: 0.55, contrast: 0.15, saturation: 0.2  },
  },
  mola: {
    id: "mola", label: "Relieve MOLA",
    description: "Topografía coloreada — MGS MOLA (463 m/px)",
    layer: "Mars_MGS_MOLA_ClrShade_merge_global_463m",
    attribution: "NASA/USGS — MGS MOLA Color Hillshade · trek.nasa.gov",
    paintSolo:  { opacity: 1,    contrast: 0.25, saturation: 0.5  },
    paintBlend: { opacity: 0.45, contrast: 0.1,  saturation: 0.3  },
  },
  mola_hrsc: {
    id: "mola_hrsc", label: "Relieve MOLA+HRSC",
    description: "Topografía MOLA con detalle Mars Express HRSC (200 m/px)",
    layer: "Mars_MOLA_blend200ppx_HRSC_ClrShade_clon0dd_200mpp_lzw",
    attribution: "NASA/ESA — MOLA + Mars Express HRSC · trek.nasa.gov",
    paintSolo:  { opacity: 1,    contrast: 0.3,  saturation: 0.45 },
    paintBlend: { opacity: 0.5,  contrast: 0.15, saturation: 0.25 },
  },
};

// ─── URL del tile ─────────────────────────────────────────────────────────────

function tileUrl(layer: string): string {
  return `${TREK}/${layer}/1.0.0/default/default028mm/${TILE.z}/${TILE.row}/${TILE.col}.jpg`;
}

// ─── Coordenadas del image source ─────────────────────────────────────────────

// MapLibre ImageSource espera [lon,lat][] en sentido horario desde la esquina sup-izq.
const COORDS: [[number,number],[number,number],[number,number],[number,number]] = [
  [TILE_BOUNDS.west, TILE_BOUNDS.north],  // sup-izq
  [TILE_BOUNDS.east, TILE_BOUNDS.north],  // sup-der
  [TILE_BOUNDS.east, TILE_BOUNDS.south],  // inf-der
  [TILE_BOUNDS.west, TILE_BOUNDS.south],  // inf-izq
];

// ─── Estado interno ───────────────────────────────────────────────────────────

// La fuente "basemap" se crea UNA VEZ por instancia de mapa y luego se actualiza.
// Usamos un WeakSet para no retener referencias al mapa después de que se destruya.
const _initializedMaps = new WeakSet<MlMap>();

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Inicializa la fuente y la capa "basemap" la primera vez, o actualiza la imagen
 * si ya existen. Se inserta justo encima del fondo "bg", debajo de todo lo demás.
 */
export function applyBasemap(map: MlMap, id: BasemapId, orthoActive = false) {
  const def = BASEMAPS[id];
  const paint = orthoActive ? def.paintBlend : def.paintSolo;

  if (id === "none" || !def.layer) {
    // Ocultar la capa si ya existe; no destruirla para mantener el estado.
    if (map.getLayer("basemap")) {
      map.setPaintProperty("basemap", "raster-opacity", 0);
    }
    return;
  }

  if (!_initializedMaps.has(map) || !map.getSource("basemap")) {
    // Primera vez en este mapa: crear fuente + capa.
    if (map.getLayer("basemap"))   map.removeLayer("basemap");
    if (map.getSource("basemap"))  map.removeSource("basemap");

    map.addSource("basemap", {
      type: "image",
      url: tileUrl(def.layer),
      coordinates: COORDS,
    });

    const firstLayerId = map.getStyle().layers[1]?.id;
    map.addLayer(
      {
        id: "basemap",
        type: "raster",
        source: "basemap",
        paint: {
          "raster-resampling": "linear",
          "raster-opacity":    paint.opacity,
          "raster-contrast":   paint.contrast,
          "raster-saturation": paint.saturation,
        },
      },
      firstLayerId,
    );
    _initializedMaps.add(map);
  } else {
    // Ya existe: actualizar imagen sin recrear la fuente (sin parpadeo).
    // updateImage reemplaza la URL y dispara una nueva petición.
    (map.getSource("basemap") as unknown as {
      updateImage(opts: { url: string; coordinates?: typeof COORDS }): void;
    }).updateImage({ url: tileUrl(def.layer), coordinates: COORDS });

    updateBasemapPaint(map, id, orthoActive);
  }
}

/** Actualiza solo los valores de paint (opacidad, contraste, saturación). */
export function updateBasemapPaint(map: MlMap, id: BasemapId, orthoActive: boolean) {
  if (!map.getLayer("basemap")) return;
  const paint = BASEMAPS[id][orthoActive ? "paintBlend" : "paintSolo"];
  map.setPaintProperty("basemap", "raster-opacity",    paint.opacity);
  map.setPaintProperty("basemap", "raster-contrast",   paint.contrast);
  map.setPaintProperty("basemap", "raster-saturation", paint.saturation);
}
