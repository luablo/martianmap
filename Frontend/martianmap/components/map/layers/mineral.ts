// Dueño: P3 (Mapa). Capa de mineralogía CRISM (MRO).
//
// Solo se añade si P1 entregó meta.files.mineral (p. ej. "mineral.png").
// Mientras no exista, el toggle muestra "SIN DATOS" y no hay nada en el mapa.
//
// El PNG que exporta P1 usa la paleta espectral de CRISM (morado–azul ciencia).
// Se inserta debajo de la rejilla (beforeId="grid"), encima del térmico.

import type { Map as MlMap } from "maplibre-gl";
import type { ZoneData } from "@/lib/types";
import { ZONE_URL } from "@/lib/data/zone";

export function addMineralLayer(map: MlMap, zone: ZoneData, beforeId = "grid") {
  const file = zone.meta.files?.mineral;
  if (!file) return;

  const { west, south, east, north } = zone.meta.bounds;
  map.addSource("mineral", {
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
      id: "mineral",
      type: "raster",
      source: "mineral",
      paint: { "raster-resampling": "linear" },
    },
    beforeId,
  );
}
