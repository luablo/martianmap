// Dueño: P3. Objetivos científicos y puntos con foto POV (de pois.geojson de P1).
import type { Map as MlMap } from "maplibre-gl";
import type { Poi } from "@/lib/types";

export function addPoiLayer(map: MlMap, pois: Poi[]) {
  map.addSource("pois", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: pois
        .filter((p) => p.type !== "base")
        .map((p) => ({
          type: "Feature",
          properties: { name: p.name, type: p.type },
          geometry: { type: "Point", coordinates: [p.lon, p.lat] },
        })),
    },
  });
  map.addLayer({
    id: "pois",
    type: "circle",
    source: "pois",
    paint: {
      "circle-radius": 7,
      "circle-color": ["match", ["get", "type"], "target", "#a78bfa", "#38bdf8"],
      "circle-stroke-color": "#070a10",
      "circle-stroke-width": 2,
    },
  });
  // TODO P3: etiquetas (requiere glyphs en el estilo) o marcadores HTML con el nombre.
}
