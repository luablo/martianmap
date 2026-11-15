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
  /**
   * "image"  = una sola imagen con bbox fija (MOLA, Viking vía USGS WMS).
   * "stitch" = mosaicos de Esri en lon/lat unidos en un canvas (CTX).
   * "tiles"  = XYZ Web Mercator (sin uso por ahora).
   */
  kind: "tiles" | "image" | "stitch";
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
    // Ojo: el servicio de Esri NO es Web Mercator (wkid 104971, mosaicos en grados).
    // Como fuente "raster" XYZ, MapLibre pedía otros mosaicos y salía otra parte de
    // Marte. Se unen los mosaicos que cubren la zona y se colocan con sus coordenadas.
    kind: "stitch",
    minzoom: 0, maxzoom: 20,
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

// ─── CTX: mosaicos de Esri en lon/lat ────────────────────────────────────────
// Rejilla del servicio (tileInfo): origen (−180, 90), mosaicos de 512 px.
// Nivel 10 = 0.17578125° por mosaico (~20 m/px), suficiente como contexto
// alrededor de la ortofoto HiRISE. 4 × 3 mosaicos cubren la zona con margen.
const CTX_LEVEL = 10;
const CTX_TILE_DEG = 0.17578125;
const CTX_TILE_PX = 512;
const CTX_COLS = [1803, 1804, 1805, 1806]; // lon 136.93–137.64 °E
const CTX_ROWS = [538, 539, 540];          // lat −4.57–−5.10 °
const CTX_BOUNDS = {
  west:  CTX_COLS[0] * CTX_TILE_DEG - 180,
  east:  (CTX_COLS[CTX_COLS.length - 1] + 1) * CTX_TILE_DEG - 180,
  north: 90 - CTX_ROWS[0] * CTX_TILE_DEG,
  south: 90 - (CTX_ROWS[CTX_ROWS.length - 1] + 1) * CTX_TILE_DEG,
};
const CTX_COORDS: [[number,number],[number,number],[number,number],[number,number]] = [
  [CTX_BOUNDS.west, CTX_BOUNDS.north],
  [CTX_BOUNDS.east, CTX_BOUNDS.north],
  [CTX_BOUNDS.east, CTX_BOUNDS.south],
  [CTX_BOUNDS.west, CTX_BOUNDS.south],
];

let ctxMosaic: Promise<string> | null = null;

/** Une los mosaicos CTX en un JPEG (data URL). Se hace una sola vez por sesión. */
function loadCtxMosaic(): Promise<string> {
  ctxMosaic ??= (async () => {
    const canvas = document.createElement("canvas");
    canvas.width = CTX_COLS.length * CTX_TILE_PX;
    canvas.height = CTX_ROWS.length * CTX_TILE_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("sin canvas 2d");
    const jobs = CTX_ROWS.flatMap((row, r) =>
      CTX_COLS.map((col, c) => new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { ctx.drawImage(img, c * CTX_TILE_PX, r * CTX_TILE_PX); resolve(); };
        img.onerror = () => resolve(); // un mosaico que falla queda oscuro, no rompe el mapa
        img.src = `${ESRI}/CTX/MapServer/tile/${CTX_LEVEL}/${row}/${col}`;
      })),
    );
    await Promise.all(jobs);
    return canvas.toDataURL("image/jpeg", 0.85);
  })();
  ctxMosaic.catch(() => { ctxMosaic = null; });
  return ctxMosaic;
}

// Cada llamada a applyBasemap invalida la anterior (por si el CTX tarda en bajar
// y mientras tanto se eligió otro mapa base).
let applyToken = 0;

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
  const token = ++applyToken;

  if (id === "none") {
    if (map.getLayer("basemap")) map.setPaintProperty("basemap", "raster-opacity", 0);
    return;
  }

  // Siempre recrear al cambiar (image y raster sources no tienen updateTiles/updateImage
  // fiable entre tipos diferentes).
  const replace = (add: () => void) => {
    if (map.getLayer("basemap"))  map.removeLayer("basemap");
    if (map.getSource("basemap")) map.removeSource("basemap");
    add();
    addLayer(map, paint);
  };

  if (def.kind === "stitch") {
    loadCtxMosaic()
      .then((url) => {
        if (token !== applyToken || !map.getStyle()) return; // ya se eligió otro
        replace(() => map.addSource("basemap", { type: "image", url, coordinates: CTX_COORDS }));
        // Si la ortofoto se prendió o apagó mientras bajaba, usar el paint vigente.
        const orthoOn = !!map.getLayer("ortho") && map.getLayoutProperty("ortho", "visibility") !== "none";
        updateBasemapPaint(map, id, orthoOn);
      })
      .catch(() => { /* sin red: el mapa sigue con fondo oscuro */ });
    return;
  }

  replace(() => addSource(map, def));
}

/** Actualiza solo los valores de paint sin recrear la fuente. */
export function updateBasemapPaint(map: MlMap, id: BasemapId, orthoActive: boolean) {
  if (!map.getLayer("basemap")) return;
  const paint = BASEMAPS[id][orthoActive ? "paintBlend" : "paintSolo"];
  map.setPaintProperty("basemap", "raster-opacity",    paint.opacity);
  map.setPaintProperty("basemap", "raster-contrast",   paint.contrast);
  map.setPaintProperty("basemap", "raster-saturation", paint.saturation);
}
