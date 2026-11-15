// Dueño: P3 (Mapa). Mapas base de Marte. Dos fuentes según disponibilidad:
//
//   CTX (MRO Context Camera):
//     Esri Living Atlas OnMars — astro.arcgis.com
//     Web Mercator XYZ estándar, PNG, CORS:*, ~6 m/px hasta z=12.
//     Sin transformación de coordenadas.
//
//   MOLA (relieve) y Viking (color fotográfico):
//     NASA Trek — trek.nasa.gov
//     Solo tienen datos hasta z=7 EQ (~1.4°/tile). En lugar de tiles dinámicos
//     (que dan 404 en z>7) se usa el tile exacto que cubre Gale como image source
//     con sus coordenadas reales, igual que hace ortho.ts con la ortofoto HiRISE.
//     MapLibre lo escala bilinealmente → suave, sin pixelado, sin errores de red.

import type { Map as MlMap } from "maplibre-gl";

const ESRI = "https://astro.arcgis.com/arcgis/rest/services/OnMars";

// USGS Astrogeology WMS — genera imágenes a resolución arbitraria, CORS:*
// SRS=EPSG:4326 (lon/lat de Marte tal cual, sin conversión).
// Usamos image source con la bbox del tile de Gale → imagen HD sin pixelado.
// La URL se construye con la bbox exacta del tile Trek que cubre Gale.
const USGS_WMS_BASE = "https://planetarymaps.usgs.gov/cgi-bin/mapserv" +
  "?map=/maps/mars/mars_simp_cyl.map" +
  "&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap" +
  "&SRS=EPSG:4326&STYLES=&FORMAT=image/jpeg" +
  "&WIDTH=1024&HEIGHT=1024";  // 1024×1024 para alta resolución

// ─── Trek tile de Gale ────────────────────────────────────────────────────────
// z=7, row=67, col=225 cubre lon 136.4–137.8°, lat -4.2–-5.6° (confirmado OK).
const T = { z: 7, row: 67, col: 225 };
const TB = {
  west:  T.col       * (360 / 256) - 180,  // 136.40625
  east:  (T.col + 1) * (360 / 256) - 180,  // 137.8125
  north: 90 - T.row       * (180 / 128),   //  -4.21875
  south: 90 - (T.row + 1) * (180 / 128),   //  -5.625
};
const TREK_COORDS: [[number,number],[number,number],[number,number],[number,number]] = [
  [TB.west, TB.north],
  [TB.east, TB.north],
  [TB.east, TB.south],
  [TB.west, TB.south],
];

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type BasemapId = "none" | "ctx" | "mola" | "viking";

type PaintValues = { opacity: number; contrast: number; saturation: number };

export interface BasemapDef {
  id: BasemapId;
  label: string;
  description: string;
  attribution: string;
  /** "tiles" = Esri XYZ (CTX). "image" = Trek tile fijo (MOLA, Viking). */
  kind: "tiles" | "image";
  tilesUrl?: string;   // solo cuando kind="tiles"
  imageUrl?: string;   // solo cuando kind="image"
  minzoom: number;
  maxzoom: number;
  paintSolo:  PaintValues;
  paintBlend: PaintValues;
}

export const BASEMAPS: Record<BasemapId, BasemapDef> = {
  none: {
    id: "none", label: "Ninguno",
    description: "Fondo oscuro (solo capas de misión)",
    attribution: "", kind: "tiles",
    minzoom: 0, maxzoom: 20,
    paintSolo:  { opacity: 0, contrast: 0, saturation: 0 },
    paintBlend: { opacity: 0, contrast: 0, saturation: 0 },
  },
  ctx: {
    id: "ctx", label: "CTX (MRO)",
    description: "MRO Context Camera — ~6 m/px · Esri OnMars",
    attribution: "NASA/JPL/MSSS — MRO CTX · Esri Living Atlas",
    kind: "tiles",
    tilesUrl: `${ESRI}/CTX/MapServer/tile/{z}/{y}/{x}`,
    minzoom: 1, maxzoom: 12,
    paintSolo:  { opacity: 1,    contrast: 0.2,  saturation: 0    },
    paintBlend: { opacity: 0.5,  contrast: 0.1,  saturation: 0    },
  },
  mola: {
    id: "mola", label: "Relieve MOLA",
    description: "Topografía coloreada MGS MOLA · USGS Astrogeology",
    attribution: "NASA/USGS — MGS MOLA Color Hillshade · planetarymaps.usgs.gov",
    // WMS con bbox del tile de Gale → imagen 1024×1024 sin pixelado.
    kind: "image",
    imageUrl: `${USGS_WMS_BASE}&LAYERS=MOLA_color&BBOX=${TB.west},${TB.south},${TB.east},${TB.north}`,
    minzoom: 0, maxzoom: 20,
    paintSolo:  { opacity: 1,    contrast: 0.25, saturation: 0.5  },
    paintBlend: { opacity: 0.45, contrast: 0.1,  saturation: 0.3  },
  },
  viking: {
    id: "viking", label: "Color Viking",
    description: "Mosaico Viking VIS MDIM · USGS Astrogeology",
    attribution: "NASA/USGS — Viking MDIM 2.1 · planetarymaps.usgs.gov",
    kind: "image",
    imageUrl: `${USGS_WMS_BASE}&LAYERS=MDIM21&BBOX=${TB.west},${TB.south},${TB.east},${TB.north}`,
    minzoom: 0, maxzoom: 20,
    paintSolo:  { opacity: 1,    contrast: 0.2,  saturation: 0.35 },
    paintBlend: { opacity: 0.5,  contrast: 0.1,  saturation: 0.15 },
  },
};

// ─── Helpers internos ─────────────────────────────────────────────────────────

function addSource(map: MlMap, def: BasemapDef) {
  if (def.kind === "image" && def.imageUrl) {
    map.addSource("basemap", {
      type: "image",
      url: def.imageUrl,
      coordinates: TREK_COORDS,
    });
  } else if (def.kind === "tiles" && def.tilesUrl) {
    map.addSource("basemap", {
      type: "raster",
      tiles: [def.tilesUrl],
      tileSize: 256,
      attribution: def.attribution,
      minzoom: def.minzoom,
      maxzoom: def.maxzoom,
    });
  }
}

function addLayer(map: MlMap, paint: PaintValues) {
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
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Añade (o reemplaza) el mapa base. Se inserta debajo de todo lo demás.
 * @param orthoActive true si la ortofoto HiRISE está activa encima.
 */
export function applyBasemap(map: MlMap, id: BasemapId, orthoActive = false) {
  const def = BASEMAPS[id];
  const paint = orthoActive ? def.paintBlend : def.paintSolo;

  if (id === "none") {
    if (map.getLayer("basemap")) map.setPaintProperty("basemap", "raster-opacity", 0);
    return;
  }

  // Siempre recrear al cambiar (image y raster sources no tienen updateTiles/updateImage
  // fiable entre tipos diferentes).
  if (map.getLayer("basemap"))  map.removeLayer("basemap");
  if (map.getSource("basemap")) map.removeSource("basemap");

  addSource(map, def);
  addLayer(map, paint);
}

/** Actualiza solo los valores de paint sin recrear la fuente. */
export function updateBasemapPaint(map: MlMap, id: BasemapId, orthoActive: boolean) {
  if (!map.getLayer("basemap")) return;
  const paint = BASEMAPS[id][orthoActive ? "paintBlend" : "paintSolo"];
  map.setPaintProperty("basemap", "raster-opacity",    paint.opacity);
  map.setPaintProperty("basemap", "raster-contrast",   paint.contrast);
  map.setPaintProperty("basemap", "raster-saturation", paint.saturation);
}
