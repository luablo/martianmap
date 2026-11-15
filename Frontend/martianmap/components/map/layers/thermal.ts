// Dueño: P3 (Mapa). Capa de inercia térmica THEMIS (Mars Odyssey).
//
// Solo se añade si P1 entregó meta.files.thermal (p. ej. "thermal.png").
// Mientras no exista, no se añade: el toggle en CAPAS muestra "SIN DATOS".
// Cuando P1 lo entregue, aparece sin cambiar código.
//
// Colores del PNG que exporta P1 (misma paleta que CONTEXTO §4):
//   azul frío → ámbar cálido (inercia térmica baja → alta). Alfa ~60 %.
// Se inserta debajo de la rejilla (beforeId="grid") y encima de la ortofoto.

import type { Map as MlMap } from "maplibre-gl";
import type { ZoneData } from "@/lib/types";
import { ZONE_URL } from "@/lib/data/zone";

export function addThermalLayer(map: MlMap, zone: ZoneData, beforeId = "grid") {
  const file = zone.meta.files?.thermal;
  if (!file) return;

  const { west, south, east, north } = zone.meta.bounds;
  map.addSource("thermal", {
    type: "image",
    url: `${ZONE_URL}/${file}`,
    coordinates: [
      [west, north],
      [east, north],
      [east, south],
      [west, south],
    ],
  });
  map.addLayer(
    {
      id: "thermal",
      type: "raster",
      source: "thermal",
      paint: { "raster-resampling": "linear" },
    },
    beforeId,
  );
}
