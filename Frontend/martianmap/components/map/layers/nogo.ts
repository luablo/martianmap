// Dueño: P3. Zonas "NO PISAR". TODO P3: rayado diagonal con map.addImage + fill-pattern.
import type { Map as MlMap } from "maplibre-gl";
import type { NoGo } from "@/lib/types";

export function addNoGoLayer(map: MlMap, nogo: NoGo) {
  map.addSource("nogo", { type: "geojson", data: nogo });
  map.addLayer({
    id: "nogo-fill",
    type: "fill",
    source: "nogo",
    paint: { "fill-color": "#ef4444", "fill-opacity": 0.3 },
  });
  map.addLayer({
    id: "nogo-line",
    type: "line",
    source: "nogo",
    paint: { "line-color": "#ef4444", "line-width": 2, "line-dasharray": [2, 1] },
  });
}
