"use client";
// Dueño: P3 (Mapa). Las props son el contrato con AppShell (P4): no cambiarlas sin avisar.
// Para capas nuevas, crear un archivo en components/map/layers/ y llamarlo desde aquí.

import { Map as MlMap, Marker, Popup, setWorkerUrl, type ExpressionSpecification, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";
import { useEffect, useRef } from "react";
import { distanceM, gridLines, insideBounds } from "@/lib/geo";
import type { LayerId, LonLat, Note, Poi, RouteResult, ZoneData } from "@/lib/types";
import { addNoGoLayer } from "./layers/nogo";
import { addOrthoLayer } from "./layers/ortho";
import { addPoiLayer, povCardEl, snapToPoi } from "./layers/pois";
import { addSlopeLayer } from "./layers/slope";
import { addThermalLayer } from "./layers/thermal";
import { addMineralLayer } from "./layers/mineral";
import { applyBasemap, trekTransformRequest, type BasemapId } from "./layers/basemap";
import Legend from "./Legend";
import { syncNoteMarkers } from "./layers/notes";

export interface MapViewProps {
  zone: ZoneData;
  destination: LonLat | null;
  route: RouteResult | null;
  layers: Record<LayerId, boolean>;
  notes: Note[];
  basemapId: BasemapId;
  onMapClick: (p: LonLat) => void;
}

function markerEl(kind: "base" | "dest", label: string) {
  const el = document.createElement("div");
  el.className = `marker marker-${kind}`;
  el.innerHTML = `<span class="marker-dot"></span><span>${label}</span>`;
  return el;
}

const line = (coords: LonLat[]) => ({
  type: "Feature" as const,
  properties: {},
  geometry: { type: "LineString" as const, coordinates: coords },
});

/** Punto a la mitad de la longitud del camino (sobre la ruta, no entre extremos). */
function pathMidpoint(path: LonLat[]): LonLat | null {
  if (path.length === 0) return null;
  if (path.length === 1) return path[0];
  const seg: number[] = new Array(path.length - 1);
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    seg[i - 1] = distanceM(path[i - 1], path[i]);
    total += seg[i - 1];
  }
  if (total === 0) return path[0];
  let target = total / 2;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i]) {
      const t = seg[i] === 0 ? 0 : target / seg[i];
      return [
        path[i][0] + (path[i + 1][0] - path[i][0]) * t,
        path[i][1] + (path[i + 1][1] - path[i][1]) * t,
      ];
    }
    target -= seg[i];
  }
  return path[path.length - 1];
}

/** Bounding box de un camino: [minLon, minLat, maxLon, maxLat]. */
function routeBounds(path: LonLat[]): [number, number, number, number] {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of path) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return [minLon, minLat, maxLon, maxLat];
}

/**
 * Margen para encuadrar la ruta sin que quede debajo de la interfaz de AppShell (P4):
 * barra superior, barra de métricas (su alto real llega en --ui-bottom) y, desde 640 px,
 * los paneles laterales (CAPAS a la izquierda; + NOTA/MODO/NOTAS a la derecha).
 */
function uiPadding(map: MlMap) {
  const w = window.innerWidth;
  const measured = parseFloat(getComputedStyle(map.getContainer()).getPropertyValue("--ui-bottom"));
  // Al llegar la primera ruta la barra aún muestra "Toca el mapa…" (~68 px) y crece
  // justo después con las métricas: se usa como mínimo su alto con ruta.
  const withRoute = w < 640 ? 135 : 120;
  // + ~110 px: la Leyenda y el selector de mapa base van justo encima de la barra.
  const bottom = Math.max(Number.isFinite(measured) ? measured : 0, withRoute) + 110;
  if (w < 640) return { top: 170, bottom, left: 40, right: 40 };
  if (w < 1024) return { top: 100, bottom, left: 250, right: 230 };
  return { top: 100, bottom, left: 280, right: 300 };
}

// Capas de imagen/ráster que se prenden y apagan con un toggle de visibilidad.
// "radiation" no va aquí: se pinta sobre la ruta (line-gradient).
const RASTER_LAYERS = ["ortho", "slope", "thermal", "mineral"] as const;

export default function MapView({ zone, destination, route, layers, notes, basemapId, onMapClick }: MapViewProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const destMarker = useRef<Marker | null>(null);
  // Etiqueta de dosis que sigue a la ruta (capa de radiación).
  const doseMarker = useRef<Marker | null>(null);
  const doseEl = useRef<HTMLDivElement | null>(null);
  // Últimos bounds a los que se encuadró la ruta (para no re-encuadrar lo mismo).
  const lastFit = useRef<[number, number, number, number] | null>(null);
  // Marcadores de notas (id → Marker) y popup compartido para los POI de tipo POV.
  const noteMarkers = useRef<Map<string, Marker>>(new Map());
  const povPopup = useRef<Popup | null>(null);
  const onClick = useRef(onMapClick);
  useEffect(() => {
    onClick.current = onMapClick;
  }, [onMapClick]);

  // Ref de `layers` para leer el valor más reciente dentro del manejador "load"
  // (mismo patrón que onClick: el "load" se registra una vez y debe ver el estado actual).
  const layersRef = useRef(layers);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  // Ref de basemapId para aplicar el mapa base correcto dentro de "load"
  const basemapRef = useRef(basemapId);
  useEffect(() => {
    basemapRef.current = basemapId;
  }, [basemapId]);

  // Se crea una sola vez por zona
  useEffect(() => {
    if (!container.current) return;
    // Copiado a /public por scripts/copy-maplibre-worker.mjs (postinstall)
    setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    const noteMarkersMap = noteMarkers.current;

    const { meta } = zone;
    const { west, south, east, north } = meta.bounds;
    const pad = 0.02;

    // Estilo vacío: MapLibre cree que está en la Tierra, pero aquí solo usamos
    // lon/lat de Marte como coordenadas. No hay mapa base terrestre.
    const map = new MlMap({
      container: container.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#070a10" } },
        ],
      },
      bounds: [west, south, east, north],
      fitBoundsOptions: { padding: 40 },
      maxBounds: [west - pad, south - pad, east + pad, north + pad],
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      // Convierte URLs trek-eq:// → URLs reales de Trek con coordenadas EQ correctas
      transformRequest: trekTransformRequest,
    });
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;

    // Tocar un POI: objetivo → destino; POV → popup con foto/sol/cámara.
    const handlePoi = (poi: Poi) => {
      if (poi.type === "pov") {
        if (!povPopup.current) povPopup.current = new Popup({ closeButton: true, maxWidth: "280px" });
        const pop = povPopup.current;
        pop.setLngLat([poi.lon, poi.lat]).setDOMContent(povCardEl(poi));
        if (!pop.isOpen()) pop.addTo(map);
        return;
      }
      const p: LonLat = [poi.lon, poi.lat];
      if (insideBounds(meta, p)) onClick.current(p);
    };

    map.on("load", () => {
      // Mapa base de Marte (Trek WMTS): se inserta primero, debajo de todo
      applyBasemap(map, basemapRef.current);

      map.addSource("grid", {
        type: "geojson",
        data: { type: "FeatureCollection", features: gridLines(meta, 500).map(line) },
      });
      map.addLayer({
        id: "grid",
        type: "line",
        source: "grid",
        paint: { "line-color": "#1f2937", "line-width": 1 },
      });

      // Pendiente y ortofoto: image source sobre los 4 bordes de la zona.
      // slope va debajo de la rejilla (beforeId="grid"); ortho debajo de slope
      // (o de la rejilla si no hay pendiente). La ortofoto solo existe cuando P1
      // entregó files.ortho. La visibilidad inicial de ambas sale del ref.
      addSlopeLayer(map, zone);
      addOrthoLayer(map, zone);
      addThermalLayer(map, zone);
      addMineralLayer(map, zone);
      for (const id of RASTER_LAYERS) {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, "visibility", layersRef.current[id] ? "visible" : "none");
        }
      }

      map.addSource("zone", {
        type: "geojson",
        data: line([
          [west, south], [east, south], [east, north], [west, north], [west, south],
        ]),
      });
      map.addLayer({
        id: "zone",
        type: "line",
        source: "zone",
        paint: { "line-color": "#38bdf8", "line-width": 1.5, "line-opacity": 0.6 },
      });

      if (zone.nogo) addNoGoLayer(map, zone.nogo);
      addPoiLayer(map, zone.pois, handlePoi);

      // Ruta: borde oscuro debajo para leerse sobre cualquier terreno.
      // lineMetrics: true habilita line-gradient (colorear la ruta por dosis).
      map.addSource("route", { type: "geojson", data: line([]), lineMetrics: true });
      map.addLayer({
        id: "route-casing",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#070a10", "line-width": 9 },
      });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#2dd4bf", "line-width": 5 },
      });
    });

    new Marker({ element: markerEl("base", "BASE"), anchor: "top", offset: [0, -9] })
      .setLngLat([meta.base.lon, meta.base.lat])
      .addTo(map);

    map.on("click", (e) => {
      // Imán de POI: si se toca a ≤40 px de un POI, se usan sus coordenadas exactas.
      const snapped = snapToPoi(e.point, zone.pois, map);
      if (snapped) {
        handlePoi(snapped);
        return;
      }
      const p: LonLat = [e.lngLat.lng, e.lngLat.lat];
      if (insideBounds(meta, p)) onClick.current(p);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      destMarker.current = null;
      doseMarker.current = null;
      doseEl.current = null;
      lastFit.current = null;
      povPopup.current?.remove();
      povPopup.current = null;
      noteMarkersMap.clear();
    };
  }, [zone]);

  // Destino y ruta
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (destination) {
      if (!destMarker.current) {
        destMarker.current = new Marker({
          element: markerEl("dest", "DESTINO"),
          // Etiqueta arriba (map.css): el punto queda abajo y se centra con +9 px.
          anchor: "bottom",
          offset: [0, 9],
        })
          .setLngLat(destination)
          .addTo(map);
      } else destMarker.current.setLngLat(destination);
    } else {
      destMarker.current?.remove();
      destMarker.current = null;
    }

    const apply = () => {
      (map.getSource("route") as GeoJSONSource | undefined)?.setData(line(route?.path ?? []));
      // fitBounds suave a la ruta nueva, solo si no cabe ya cómodamente en la vista
      // (así no tiembla al cambiar de modo con la misma ruta). Respeta reduced-motion.
      if (route && route.path.length >= 2) {
        const b = routeBounds(route.path);
        const [minLon, minLat, maxLon, maxLat] = b;
        // Encuadra si cambió el destino (bounds nuevos) o si la ruta salió de la
        // vista. Así hace zoom a la ruta nueva sin temblar al cambiar de modo
        // (mismos bounds y aún visible → no re-encuadra). Respeta reduced-motion.
        const view = map.getBounds();
        const offscreen =
          view.getWest() > minLon || view.getEast() < maxLon ||
          view.getSouth() > minLat || view.getNorth() < maxLat;
        const prev = lastFit.current;
        const changed =
          !prev ||
          Math.abs(prev[0] - b[0]) > 1e-9 || Math.abs(prev[1] - b[1]) > 1e-9 ||
          Math.abs(prev[2] - b[2]) > 1e-9 || Math.abs(prev[3] - b[3]) > 1e-9;
        if (changed || offscreen) {
          lastFit.current = b;
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          map.fitBounds(
            [[minLon, minLat], [maxLon, maxLat]],
            { padding: uiPadding(map), maxZoom: 17, animate: !reduce, duration: reduce ? 0 : 600 },
          );
        }
      }
    };

    if (map.getSource("route")) apply();
    else map.once("load", apply);
  }, [destination, route]);

  // Mapa base: se reemplaza reactivamente al cambiar basemapId.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => applyBasemap(map, basemapId);
    // No usar isStyleLoaded(): es false mientras bajan mosaicos de Trek y, como "load"
    // ya pasó, el cambio nunca se aplicaría. "grid" existe ⇔ el "load" ya corrió.
    if (map.getSource("grid")) apply();
    else map.once("load", apply);
  }, [basemapId]);

  // Capas de imagen/ráster: encender/apagar según `layers`. Si una capa aún no
  // existe (el mapa no cargó o P1 no la entregó), se salta; la visibilidad inicial
  // la fija el "load".
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const id of RASTER_LAYERS) {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, "visibility", layers[id] ? "visible" : "none");
      }
    }
  }, [layers]);

  // Notas de campo en el mapa: sincroniza los marcadores morados con la prop `notes`
  // (para el tiempo real cuando P2 cable Supabase). Tocar una nota abre su tarjeta.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => syncNoteMarkers(map, noteMarkers.current, notes);
    if (map.getSource("route")) apply();
    else map.once("load", apply);
  }, [notes]);

  // Radiación (no es ráster): colorea la ruta por dosis acumulada (turquesa→ámbar con
  // line-gradient) y pone una etiqueta con la dosis total en el punto medio de la
  // ruta. Solo cuando la capa está activa y hay ruta. La tasa es uniforme (MSL RAD).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      if (!map.getLayer("route")) return;
      const on = layers.radiation;
      // line-gradient tiene prioridad sobre line-color y no se puede "quitar": el
      // caso apagado usa el mismo color en los dos extremos → se ve sólida turquesa.
      const expr = (on
        ? ["interpolate", ["linear"], ["line-progress"], 0, "#2dd4bf", 1, "#fbbf24"]
        : ["interpolate", ["linear"], ["line-progress"], 0, "#2dd4bf", 1, "#2dd4bf"]) as ExpressionSpecification;
      map.setPaintProperty("route", "line-gradient", expr);

      const mid = on && route && route.path.length > 0 ? pathMidpoint(route.path) : null;
      if (mid) {
        if (!doseMarker.current) {
          const el = document.createElement("div");
          el.className = "marker-dose";
          doseEl.current = el;
          // setLngLat ANTES de addTo: MapLibre dibuja el marcador al agregarlo y, sin
          // coordenadas, lanza "Cannot read properties of undefined (reading 'lng')".
          doseMarker.current = new Marker({
            element: el,
            anchor: "bottom",
            offset: [0, -6],
          })
            .setLngLat(mid)
            .addTo(map);
        }
        doseEl.current!.textContent = `DOSIS ${route!.doseMSv.toFixed(3)} mSv`;
        doseMarker.current.setLngLat(mid);
      } else {
        doseMarker.current?.remove();
        doseMarker.current = null;
        doseEl.current = null;
      }
    };

    // Igual que arriba: la capa "route" existe ⇔ el "load" ya corrió.
    if (map.getLayer("route")) apply();
    else map.once("load", apply);
  }, [layers.radiation, route]);

  // El CSS de MapLibre pone `position: relative` al contenedor: por eso va envuelto.
  return (
    <div className="absolute inset-0">
      <div ref={container} className="h-full w-full" aria-label="Mapa de la zona" />
      <Legend zone={zone} layers={layers} />
    </div>
  );
}
