// Dueño: P3. Objetivos científicos y puntos con foto POV (de pois.geojson de P1).
//
// Renderiza cada POI (no la base) como marcador HTML con punto + nombre, igual que
// BASE/DESTINO: objetivos en color ciencia (#A78BFA) y POV en info (#38BDF8). Los
// marcadores son clicables (pointer-events: auto) y llaman a `onPoi` al tocarlos.
// snapToPoi: el toque cerca de un POI (≤40 px) se "imana" a ese POI.
// povCardEl: tarjeta del popup de un POV (foto, sol, cámara).

import { Map as MlMap, Marker } from "maplibre-gl";
import type { Poi } from "@/lib/types";

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

/**
 * Marcadores de POI (base excluida: tiene su propio marcador en MapView).
 * `onPoi` se llama al tocar un marcador (objetivo → destino; POV → quien llame decide).
 */
export function addPoiLayer(map: MlMap, pois: Poi[], onPoi: (poi: Poi) => void) {
  for (const poi of pois) {
    if (poi.type === "base") continue;
    const el = poiMarkerEl(poi);
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onPoi(poi);
    });
    new Marker({ element: el, anchor: "top", offset: [0, -9] })
      .setLngLat([poi.lon, poi.lat])
      .addTo(map);
  }
}

/**
 * Imán de POI: si `point` (píxeles de pantalla) cae a ≤ thresholdPx de un POI,
 * devuelve ese POI. Si no, null (el llamador usa el punto tocado).
 */
export function snapToPoi(
  point: { x: number; y: number },
  pois: Poi[],
  map: MlMap,
  thresholdPx = 40,
): Poi | null {
  let best: Poi | null = null;
  let bestD = thresholdPx;
  for (const poi of pois) {
    if (poi.type === "base") continue;
    const s = map.project([poi.lon, poi.lat]);
    const d = Math.hypot(s.x - point.x, s.y - point.y);
    if (d <= bestD) {
      bestD = d;
      best = poi;
    }
  }
  return best;
}

/** Tarjeta del popup de un POV (foto de Curiosity, sol y cámara). */
export function povCardEl(poi: Poi) {
  const el = document.createElement("div");
  el.className = "pov-card";
  const title = document.createElement("div");
  title.className = "pov-card-title";
  title.textContent = poi.name;
  el.append(title);
  if (poi.photo) {
    const img = document.createElement("img");
    img.className = "pov-card-photo";
    img.src = poi.photo;
    img.alt = poi.name;
    el.append(img);
  } else {
    const ph = document.createElement("div");
    ph.className = "pov-card-nophoto";
    ph.textContent = "Sin foto POV todavía";
    el.append(ph);
  }
  const meta = document.createElement("div");
  meta.className = "pov-card-meta";
  meta.textContent = [poi.sol != null ? `Sol ${poi.sol}` : null, poi.camera]
    .filter(Boolean)
    .join(" · ");
  el.append(meta);
  if (poi.description) {
    const d = document.createElement("div");
    d.className = "pov-card-desc";
    d.textContent = poi.description;
    el.append(d);
  }
  return el;
}
