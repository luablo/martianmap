// Dueño: P3 (Mapa). Capa de ortofoto HiRISE: la imagen base de la zona, debajo de todo.
//
// Solo se añade si P1 ya entregó meta.files.ortho (p. ej. "ortho.webp"). Mientras
// no exista (datos sintéticos), no se añade: el mapa queda con la rejilla sobre el
// fondo oscuro. Cuando P1 deja caer el archivo, esta capa aparece sin tocar más código.
//
// Se inserta debajo de la pendiente (o, si no hay pendiente, debajo de la rejilla)
// para ser el fondo sobre el que se pintan las demás capas.

import type { Map as MlMap } from "maplibre-gl";
import type { ZoneData } from "@/lib/types";
import { ZONE_URL } from "@/lib/data/zone";

/**
 * Añade la ortofoto como `image` source sobre los 4 bordes de la zona.
 * No hace nada si no hay `meta.files.ortho`.
 *
 * @param beforeId Capa bajo la que va. Por defecto "slope" si existe, si no "grid".
 */
export function addOrthoLayer(map: MlMap, zone: ZoneData, beforeId?: string) {
  const file = zone.meta.files?.ortho;
  if (!file) return; // sin ortofoto: no se añade la capa

  const { west, south, east, north } = zone.meta.bounds;
  map.addSource("ortho", {
    type: "image",
    url: `${ZONE_URL}/${file}`,
    coordinates: [
      [west, north], // sup-izq
      [east, north], // sup-der
      [east, south], // inf-der
      [west, south], // inf-izq
    ],
  });
  map.addLayer(
    {
      id: "ortho",
      type: "raster",
      source: "ortho",
      // La ortofoto es la imagen base: va opaca (no se reduce su opacidad, a diferencia
      // de pendiente/térmico). El suavizado lineal queda mejor en una foto.
      paint: { "raster-resampling": "linear" },
    },
    beforeId ?? (map.getLayer("slope") ? "slope" : "grid"),
  );
}
