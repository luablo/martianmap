// Dueño: P3. Objetivos científicos y puntos con foto POV (de pois.geojson de P1).
//
// Renderiza cada POI (no la base) como marcador HTML con punto + nombre, igual que
// BASE/DESTINO: objetivos en color ciencia (#A78BFA) y POV en info (#38BDF8).
// Incluye snapToPoi: el toque cerca de un POI (≤40 px) se "imana" a sus coordenadas
// exactas, para que marcar destino no falle por el grosor del dedo.

import { Map as MlMap, Marker } from "maplibre-gl";
import type { LonLat, Poi } from "@/lib/types";

function poiMarkerEl(poi: Poi) {
  const el = document.createElement("div");
  el.className = `marker marker-poi marker-poi-${poi.type}`;
  const dot = document.createElement("span");
  dot.className = "marker-dot";
  const label = document.createElement("span");
  label.textContent = poi.name; // texto, no HTML: el nombre viene de datos
  el.append(dot, label);
  return el;
}

/** Marcadores de POI (base excluida: tiene su propio marcador en MapView). */
export function addPoiLayer(map: MlMap, pois: Poi[]) {
  for (const poi of pois) {
    if (poi.type === "base") continue;
    new Marker({ element: poiMarkerEl(poi), anchor: "top", offset: [0, -9] })
      .setLngLat([poi.lon, poi.lat])
      .addTo(map);
  }
}

/**
 * Imán de POI: si `point` (en píxeles de pantalla) cae a ≤ thresholdPx de un POI,
 * devuelve sus coordenadas exactas. Si no, null (el llamador usa el punto tocado).
 */
export function snapToPoi(
  point: { x: number; y: number },
  pois: Poi[],
  map: MlMap,
  thresholdPx = 40,
): LonLat | null {
  let best: LonLat | null = null;
  let bestD = thresholdPx;
  for (const poi of pois) {
    if (poi.type === "base") continue;
    const s = map.project([poi.lon, poi.lat]);
    const d = Math.hypot(s.x - point.x, s.y - point.y);
    if (d <= bestD) {
      bestD = d;
      best = [poi.lon, poi.lat];
    }
  }
  return best;
}
